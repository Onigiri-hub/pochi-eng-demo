import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useProfileContext } from "../utils/ProfileContext"
import Navigation from "../components/Navigation";
import ShareModal from "../components/ShareModal";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getBadges, loadBadgeList } from "../utils/badgeManager";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BADGE_CATEGORIES = [
  {
    label: "連続記録",
    ids: ["streak_3", "streak_7", "streak_10", "streak_30", "streak_50", "streak_100", "streak_200", "streak_365"],
  },
  {
    label: "英文法レッスン",
    ids: ["first_clear", "lesson_5", "lesson_10", "lesson_50", "lesson_100", "lesson_200"],
  },
  {
    label: "英文法Unitクリア",
    ids: ["unit_clear_5", "unit_clear_10", "unit_clear_20", "unit_clear_30", "unit_clear_40", "unit_clear_50"],
  },
  {
    label: "英単語レッスン",
    ids: ["round_5", "round_10", "round_20", "round_30", "round_50", "round_100", "round_200", "round_500"],
  },
]

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [vocabHistoryData, setVocabHistoryData] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])
  const [badgeList, setBadgeList] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [shareTarget, setShareTarget] = useState(null)
  const router = useRouter();
  const { profile, streak } = useProfileContext()

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("demo_history") || "[]")
    const vocabHistory = JSON.parse(localStorage.getItem("demo_vocab_history") || "[]")
    setHistoryData(history)
    setVocabHistoryData(vocabHistory)

    const savedProfile = JSON.parse(localStorage.getItem("demo_profile") || "{}")
    setStartDate(savedProfile.startDate || new Date().toLocaleDateString("sv-SE"))

    Promise.all([getBadges(), loadBadgeList()])
      .then(([earned, list]) => {
        setEarnedBadges(earned)
        setBadgeList(list)
        setLoading(false)
      })
  }, []);

  const getGraphData = () => {
    const days = []
    const grammarCounts = []
    const vocabCounts = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const s = d.toLocaleDateString('sv-SE')
      days.push(d.toLocaleDateString('ja-JP', { weekday: 'short' }))

      const grammarCount = historyData.filter(h => h.dateString === s).length
      const vocabCount = vocabHistoryData.filter(h => h.dateString === s).length
      grammarCounts.push(grammarCount)
      vocabCounts.push(vocabCount)
    }

    return {
      labels: days,
      datasets: [
        {
          label: "英文法",
          data: grammarCounts,
          backgroundColor: "#FF9F43",
          borderRadius: 5,
        },
        {
          label: "英単語",
          data: vocabCounts,
          backgroundColor: "#02ccbb",
          borderRadius: 5,
        },
      ],
    }
  }

  if (loading) return null;

  return (
    <div className="container">
      <div className="mainContent">
        <div className="header" style={{ justifyContent: "flex-end" }}>
          <button className="settingsBtn" onClick={() => router.push("/settings")}>⚙️</button>
        </div>

        <div className="profileSection">

          <h2 className="nickname">{profile ? profile.nickname : ""}</h2>

          <div className="avatarCircle" style={{ position: "relative", cursor: "pointer" }} onClick={() => router.push("/avatar-settings")}>
            <img
              src={`/images/avatars/${profile?.avatar || "01.png"}`}
              alt="Avatar"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
            {profile?.acc_eye && (
              <img
                src={`/images/avatars/${profile.acc_eye}`}
                alt="eye"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              />
            )}
            {profile?.acc_mouth && (
              <img
                src={`/images/avatars/${profile.acc_mouth}`}
                alt="mouth"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              />
            )}
            {profile?.acc_head && (
              <img
                src={`/images/avatars/${profile.acc_head}`}
                alt="head"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              />
            )}
          </div>

          <div style={{ width: "100%", textAlign: "right" }}>
            <button
              onClick={() => router.push("/avatar-settings")}
              style={{
                background: "none",
                border: "none",
                fontSize: "13px",
                color: "#6f70a7",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "4px 0",
                marginTop: "8px",
              }}
            >
              ▶ アバターを変更する
            </button>
          </div>
        </div>

        <div className="statsGrid">
          <div className="statItem">
            <span className="statLabel">学習開始</span>
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
              {startDate
                ? `${startDate.slice(0, 4)}年${Number(startDate.slice(5, 7))}月`
                : "-"
              }
            </span>
          </div>
          <div className="statItem">
            <span className="statLabel">連続記録</span>
            <span className="statValue">{streak}日</span>
          </div>
        </div>

        <div className="graphContainer"
          style={{
            background: "#f8f8f8",
            padding: "10px",
            borderRadius: "10px",
            marginTop: "20px",
            height: "200px"
          }}>
          <Bar
            data={getGraphData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: "bottom" }
              },
              scales: {
                x: {
                  stacked: true,
                  grid: { display: false },
                },
                y: {
                  stacked: true,
                  display: true,
                  grid: { display: false },
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: (value) => {
                      if (Math.floor(value) === value) return value
                    }
                  }
                }
              }
            }}
          />
        </div>

        <div style={{ marginTop: "50px" }}>
          <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
            実績バッジ
          </h3>
          {BADGE_CATEGORIES.map(category => {
            const visible = []
            let nextShown = false
            for (const id of category.ids) {
              if (earnedBadges.includes(id)) {
                visible.push({ id, earned: true })
              } else if (!nextShown) {
                visible.push({ id, earned: false })
                nextShown = true
              } else {
                break
              }
            }
            if (visible.length === 0) return null
            return (
              <div key={category.label} style={{ marginBottom: "32px" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#888", marginBottom: "12px" }}>
                  {category.label}
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                }}>
                  {visible.map(({ id, earned }) => {
                    const badge = badgeList.find(b => b.badge_id === id)
                    if (!badge) return null
                    return (
                      <div
                        key={id}
                        onClick={earned ? () => setShareTarget(badge) : undefined}
                        style={{
                          textAlign: "center",
                          opacity: earned ? 1 : 0.35,
                          cursor: earned ? "pointer" : "default",
                        }}
                        title={earned ? `${badge.name}（タップしてシェア）` : badge.description}
                      >
                        <img
                          src={earned
                            ? `/images/badges/${badge.image_earned}`
                            : `/images/badges/${badge.image_locked}`
                          }
                          alt={badge.name}
                          style={{
                            width: "70%",
                            aspectRatio: "1",
                            objectFit: "contain",
                            borderRadius: "12px",
                          }}
                        />
                        <div style={{
                          fontSize: "10px",
                          color: "#555",
                          marginTop: "4px",
                          lineHeight: 1.2,
                        }}>
                          {badge.name}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

      </div>
      <Navigation />

      {shareTarget && (
        <ShareModal
          badge={shareTarget}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}
