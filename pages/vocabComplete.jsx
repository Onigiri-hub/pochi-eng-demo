import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Navigation from "../components/Navigation"
import { checkAndEarnBadges, loadBadgeList } from "../utils/badgeManager"
import { useProfileContext } from "../utils/ProfileContext"
import { updateStreak, calcMofu, addMofu, addTotalRounds } from "../utils/mofuManager"
import { loadCSV } from "../utils/csvLoader"
import ShareModal from "../components/ShareModal"

export default function VocabComplete() {
  const router = useRouter()
  const { stage, section, round, isFirstClear, mode } = router.query
  const isArrangeMode = mode === "arrange"
  const {
    setMofu, setStreak,
    setTotalRounds,
    totalLessons, totalRounds
  } = useProfileContext()
  const [newBadges, setNewBadges] = useState([])
  const [mofuEarned, setMofuEarned] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [showRest, setShowRest] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [showStreakPopup, setShowStreakPopup] = useState(false)
  const [shareTarget, setShareTarget] = useState(null)

  useEffect(() => {
    if (!router.isReady) return

    const audio = window._kirakira || new Audio("/sound/kirakira.mp3");
    audio.volume = 0.2;
    audio.currentTime = 0;
    audio.play().catch(e => console.log("音の再生に失敗:", e));

    async function handleComplete() {
      const firstClear = isFirstClear === "true"

      const { count: streak, isFirstToday } = await updateStreak()
      setStreak(streak)

      if (isFirstToday && streak >= 2) {
        setStreakCount(streak)
        setShowStreakPopup(true)
      }

      const mofu = calcMofu(streak, firstClear)
      await addMofu(mofu)
      if (firstClear) {
        await addTotalRounds()
        setTotalRounds(prev => prev + 1)
      }
      setMofuEarned(mofu)
      setMofu(prev => prev + mofu)

      const stageId = stage
      const completedStages = []

      const sectionsCsv = isArrangeMode ? "/data/vocab/arrangeSectionList.csv" : "/data/vocab/sectionList.csv"
      const allSections = await loadCSV(sectionsCsv)
      const stageSections = allSections.filter(s => s.stage_id === stageId)

      const allRoundIds = []
      await Promise.all(stageSections.map(async (sec) => {
        const roundsCsv = isArrangeMode
          ? `/data/vocab/arrange_rounds/${sec.arrange_rounds_csv}`
          : `/data/vocab/rounds/${sec.rounds_csv}`
        const rounds = await loadCSV(roundsCsv)
        rounds.forEach(r => allRoundIds.push(r.round_id))
      }))

      const clearedSet = new Set()
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("vocab_round_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}")
            if (data.totalWords > 0 && (data.doneWords || []).length >= data.totalWords) {
              clearedSet.add(key.replace("vocab_round_", ""))
            }
          } catch {}
        }
      }

      const isStageComplete = allRoundIds.every(id => clearedSet.has(id))
      if (isStageComplete) completedStages.push(stageId)

      const badges = await checkAndEarnBadges({
        streak,
        totalLessons,
        totalRounds: totalRounds + (firstClear ? 1 : 0),
        completedStages,
        isUnitComplete: null,
        isPerfect: false,
      })
      if (badges.length > 0) {
        const badgeList = await loadBadgeList()
        const badgeObjects = badges
          .map(id => badgeList.find(b => b.badge_id === id))
          .filter(Boolean)
        setNewBadges(badgeObjects)
      } else {
        setNewBadges([])
      }

      if (badges.length > 0) {
        if (!(isFirstToday && streak >= 2)) setShowPopup(true)
      }
    }

    handleComplete()

  }, [router.isReady])

  useEffect(() => {
    document.documentElement.style.overscrollBehavior = "none"
    document.body.style.overscrollBehavior = "none"
    return () => {
      document.documentElement.style.overscrollBehavior = ""
      document.body.style.overscrollBehavior = ""
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowRest(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="completePage" style={{ paddingBottom: "80px" }}>
      <div className="app">
        <div className="completeArea" style={{ flexDirection: "column" }}>

          <video
            src="/animations/animation-great.mp4"
            autoPlay
            muted
            playsInline
            style={{ width: "70%" }}
          />

          {mofuEarned > 0 && (
            <div style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#FF9F43",
              marginTop: "10px",
              animation: "poyon 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
            }}>
              +{mofuEarned} モフ獲得！
            </div>
          )}

        </div>

        {showStreakPopup && (
          <>
            <div
              onClick={() => {
                setShowStreakPopup(false)
                if (newBadges.length > 0) setShowPopup(true)
              }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }}
            />
            <div style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              borderRadius: "20px",
              padding: "30px 24px",
              zIndex: 101,
              textAlign: "center",
              minWidth: "280px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔥</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#FF9F43" }}>
                {streakCount}日連続！
              </div>
              <div style={{ fontSize: "14px", color: "#888", margin: "8px 0 20px" }}>
                すごい！頑張ってるね！
              </div>
              <button
                onClick={() => {
                  setShowStreakPopup(false)
                  if (newBadges.length > 0) setShowPopup(true)
                }}
                style={{
                  padding: "10px 30px",
                  borderRadius: "20px",
                  border: "none",
                  background: "#FF9F43",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                やった！
              </button>
            </div>
          </>
        )}

        {showPopup && newBadges.length > 0 && (
          <>
            <div
              onClick={() => setShowPopup(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 100,
              }}
            />
            <div style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              borderRadius: "20px",
              padding: "30px 24px",
              zIndex: 101,
              textAlign: "center",
              minWidth: "280px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
                バッジ獲得！
              </div>
              {newBadges.map(badge => (
                <div key={badge.badge_id} style={{
                  background: "#fffbe6",
                  border: "2px solid #FFD700",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "10px",
                }}>
                  <div style={{ fontSize: "32px" }}>{badge.icon}</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>{badge.name}</div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{badge.description}</div>
                  <button
                    onClick={() => { setShowPopup(false); setShareTarget(badge) }}
                    style={{
                      marginTop: "10px",
                      padding: "8px 20px",
                      borderRadius: "16px",
                      border: "none",
                      background: "#f4a6c0",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    shareする
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  marginTop: "16px",
                  padding: "10px 30px",
                  borderRadius: "20px",
                  border: "none",
                  background: "#FF9F43",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                やった！
              </button>
            </div>
          </>
        )}

        {shareTarget && (
          <ShareModal badge={shareTarget} onClose={() => setShareTarget(null)} />
        )}

        {showRest && (
          <div className="bottomArea">
            <div className="completeBottom">
              <button
                className="finishButton"
                onClick={() => router.replace(isArrangeMode ? `/arrangeSectionList?stage=${stage}` : `/sectionList?stage=${stage}`)}
                data-sound
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
      <Navigation />
    </div>
  )
}
