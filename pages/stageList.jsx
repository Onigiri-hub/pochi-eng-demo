import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Papa from "papaparse"
import Navigation from "../components/Navigation"
import { getArrangeWordStatus, getAllClearedRoundIds } from "../utils/vocabProgressManager"

// 円グラフ（ドーナツ型の進捗リング）
function CircleProgress({ value, total, color, label }) {
  const size = 84
  const stroke = 9
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const fraction = total > 0 ? value / total : 0
  const offset = circumference * (1 - fraction)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#ccc" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      <text
        x="50%" y="50%"
        dominantBaseline="central" textAnchor="middle"
        fontSize="14" fontWeight="bold" fill="#333"
      >
        {label}
      </text>
    </svg>
  )
}

// 並べて英単語：データが用意できている Stage_no の上限。
// これより後の Stage はグレーアウトして無効化する（データを追加したら値を上げる）。
const ARRANGE_MAX_ENABLED_NO = 1

export default function StageList() {
  const [stages, setStages] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const [stageRes, secRes] = await Promise.all([
        fetch("/data/vocab/stageList.csv"),
        fetch("/data/vocab/sectionList.csv"),
      ])

      const stageData = Papa.parse(await stageRes.text(), { header: true, skipEmptyLines: true }).data
      const secData = Papa.parse(await secRes.text(), { header: true, skipEmptyLines: true }).data
      setStages(stageData)

      const clearedSet = getAllClearedRoundIds()

      const map = {}
      await Promise.all(
        stageData.map(async (stage) => {
          // 並べて英単語：Rounds ではなく「履修済み単語数 / 全単語数」で進捗を出す
          if (stage.mode_category === "arrange") {
            try {
              const wRes = await fetch(`/data/vocab/arrange_words/arrange_words_${stage.stage_id}.csv`)
              if (!wRes.ok) throw new Error("no data")
              const wordsData = Papa.parse(await wRes.text(), { header: true, skipEmptyLines: true }).data
                .filter(w => w.arrange_word)
              const status = await getArrangeWordStatus(stage.stage_id)
              const learnedCount = wordsData.filter(w => status[w.arrange_word_id]?.learned).length
              const confidentCount = wordsData.filter(w => status[w.arrange_word_id]?.confidence === "high").length
              map[stage.stage_id] = { total: wordsData.length, cleared: learnedCount, confident: confidentCount }
            } catch (e) {
              map[stage.stage_id] = { total: 0, cleared: 0, confident: 0 }
            }
            return
          }

          // 1:1英単語：Rounds のクリア数で進捗を出す
          const sections = secData.filter(s => s.stage_id === stage.stage_id)
          let totalRounds = 0
          let clearedRounds = 0

          await Promise.all(
            sections.map(async (section) => {
              const csvPath = `/data/vocab/rounds/${section.rounds_csv}`
              try {
                const rRes = await fetch(csvPath)
                const rounds = Papa.parse(await rRes.text(), { header: true, skipEmptyLines: true }).data
                totalRounds += rounds.length
                rounds.forEach(round => {
                  if (clearedSet.has(round.round_id)) clearedRounds++
                })
              } catch (e) {
                console.error(`rounds取得失敗: ${csvPath}`)
              }
            })
          )

          map[stage.stage_id] = { totalRounds, clearedRounds }
        })
      )
      setProgressMap(map)
    }
    load()
  }, [])

  const oneToOne = stages.filter(s => s.mode_category === "1to1")
  const arrange = stages.filter(s => s.mode_category === "arrange")

  return (
    <div className="unitListContainer" style={{ paddingBottom: "100px" }}>
      <div className="unitList">

        <div style={{ textAlign: "center", margin: "25px 0 40px", fontSize: "22px", fontWeight: "bold", color: "#333333" }}>
          <img src="/images/icons/honekko_333.svg" style={{ width: "24px", marginRight: "8px", verticalAlign: "middle" }} />
          1:1英単語
        </div>

        {oneToOne.map((stage) => {
          const progress = progressMap[stage.stage_id] || { totalRounds: 0, clearedRounds: 0 }
          return (
            <div
              className="unitCard"
              key={stage.stage_id}
              onClick={() => router.push(`/sectionList?stage=${stage.stage_id}&name=${encodeURIComponent(stage.stage_name)}`)}
            >
              <img src="/images/illustrations/stagelist_button.png" className="unitCardBg" />
              <div className="unitCardContent">
                <div className="unitTitle">{stage.stage_name}</div>
                <div style={{ fontSize: "14px", marginTop: "8px" }}>
                  {progress.clearedRounds}/{progress.totalRounds}
                </div>
              </div>
            </div>
          )
        })}

        {arrange.length > 0 && (
          <>
            <div style={{ textAlign: "center", margin: "70px 0 40px", fontSize: "22px", fontWeight: "bold", color: "#333333" }}>
              <img src="/images/icons/honekko_333.svg" style={{ width: "24px", marginRight: "8px", verticalAlign: "middle" }} />
              並べて英単語
            </div>

            {arrange.map((stage) => {
              const progress = progressMap[stage.stage_id] || { total: 0, cleared: 0, confident: 0 }
              // データが無い（total=0）Stage、または上限より後の Stage はグレーアウトして無効化
              const loaded = progressMap[stage.stage_id] !== undefined
              const disabled =
                (loaded && progress.total === 0) ||
                Number(stage.stage_no) > ARRANGE_MAX_ENABLED_NO
              return (
                <div
                  className="unitCard"
                  key={stage.stage_id}
                  onClick={disabled ? undefined : () => router.push(`/arrangeSectionList?stage=${stage.stage_id}&name=${encodeURIComponent(stage.stage_name)}`)}
                  style={disabled ? { filter: "grayscale(100%)", opacity: 0.5, cursor: "default", pointerEvents: "none" } : undefined}
                >
                  <img src="/images/illustrations/unitlist_button.png" className="unitCardBg" />
                  <div className="unitCardContent">
                    <div className="unitTitle">{stage.stage_name}</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "20px" }}>
                      <CircleProgress value={progress.cleared} total={progress.total} color="#ffa726" label="やったよ" />
                      <CircleProgress value={progress.confident} total={progress.total} color="#02ccbb" label="自信あり" />
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

      </div>
      <Navigation />
    </div>
  )
}
