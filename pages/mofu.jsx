import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useProfileContext } from "../utils/ProfileContext"
import Navigation from "../components/Navigation"
import { spendMofu } from "../utils/mofuManager"
import { loadCSV } from "../utils/csvLoader"

const CATEGORY_LABELS = {
  avatar: "アバター",
  head: "頭のアクセサリ",
  eye: "目元のアクセサリ",
  mouth: "口元のアクセサリ",
}

const CATEGORIES = ["avatar", "head", "eye", "mouth"]

export default function Mofu() {
  const router = useRouter()
  const { mofu, setMofu, profile, streak, completedUnits, totalLessons, totalRounds } = useProfileContext()
  const [items, setItems] = useState([])
  const [purchasedIds, setPurchasedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [unlockedIds, setUnlockedIds] = useState(new Set())
  const [confirmItem, setConfirmItem] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    async function load() {
      const purchased = new Set(JSON.parse(localStorage.getItem("demo_purchased_items") || "[]"))
      setPurchasedIds(purchased)

      const allItems = await loadCSV("/data/itemList.csv")
      setItems(allItems)

      const unlocked = new Set(JSON.parse(localStorage.getItem("demo_unlocked_items") || "[]"))

      const toUnlock = allItems.filter((item) => {
        if (unlocked.has(item.item_id)) return false
        if (item.unlock_condition === "none") return false
        if (item.unlock_condition.startsWith("streak_")) {
          const required = parseInt(item.unlock_condition.replace("streak_", ""))
          return streak >= required
        }
        if (item.unlock_condition.startsWith("unit_") && item.unlock_condition.endsWith("_complete")) {
          const unitNo = item.unlock_condition.replace("unit_", "").replace("_complete", "")
          return completedUnits.has(`u${unitNo}`)
        }
        if (item.unlock_condition.startsWith("rounds_")) {
          const required = parseInt(item.unlock_condition.replace("rounds_", ""))
          return totalRounds >= required
        }
        if (item.unlock_condition.startsWith("lessons_")) {
          const required = parseInt(item.unlock_condition.replace("lessons_", ""))
          return totalLessons >= required
        }
        return false
      })

      toUnlock.forEach((item) => unlocked.add(item.item_id))
      if (toUnlock.length > 0) {
        localStorage.setItem("demo_unlocked_items", JSON.stringify([...unlocked]))
      }

      setUnlockedIds(unlocked)
      setLoading(false)
    }

    load()
  }, [completedUnits, totalLessons, totalRounds, streak])

  const isUnlocked = (item) => {
    if (item.unlock_condition === "none") return true
    if (unlockedIds.has(item.item_id)) return true

    if (item.unlock_condition.startsWith("streak_")) {
      const required = parseInt(item.unlock_condition.replace("streak_", ""))
      return streak >= required
    }
    if (item.unlock_condition.startsWith("unit_") && item.unlock_condition.endsWith("_complete")) {
      const unitNo = item.unlock_condition.replace("unit_", "").replace("_complete", "")
      return completedUnits.has(`u${unitNo}`)
    }
    if (item.unlock_condition.startsWith("rounds_")) {
      const required = parseInt(item.unlock_condition.replace("rounds_", ""))
      return totalRounds >= required
    }
    if (item.unlock_condition.startsWith("lessons_")) {
      const required = parseInt(item.unlock_condition.replace("lessons_", ""))
      return totalLessons >= required
    }
    return false
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handlePurchase = (item) => {
    if (mofu < parseInt(item.mofu_cost)) {
      showToast("モフが足りないよ！")
      return
    }
    setConfirmItem(item)
  }

  const executePurchase = async () => {
    const item = confirmItem
    setConfirmItem(null)
    const cost = parseInt(item.mofu_cost)
    try {
      await spendMofu(mofu, cost)
      setMofu((prev) => prev - cost)
      const purchased = JSON.parse(localStorage.getItem("demo_purchased_items") || "[]")
      if (!purchased.includes(item.item_id)) {
        purchased.push(item.item_id)
        localStorage.setItem("demo_purchased_items", JSON.stringify(purchased))
      }
      setPurchasedIds((prev) => new Set([...prev, item.item_id]))
      showToast("購入完了！アバター設定画面で着せ替えできるよ🎉")
    } catch (e) {
      console.error(e)
      showToast("購入に失敗しました。")
    }
  }

  if (loading) return (
    <div className="container">
      <div className="mainContent" />
      <Navigation />
    </div>
  )

  return (
    <div className="container">
      <div className="mainContent">

        <div className="header">
          <h2></h2>
        </div>

        <div style={{
          textAlign: "center",
          margin: "30px 30px",
          padding: "20px",
          background: "#ffffff",
          borderRadius: "20px",
          border: "0px solid #ffffff",
        }}>
          <div style={{ fontSize: "13px", color: "#525252", marginBottom: "10px" }}>現在のモフ</div>
          <img
            src="/images/icons/mofu_333.svg"
            alt="モフ"
            style={{ width: "40px", height: "40px", marginBottom: "0px" }}
          />
          <div style={{ fontSize: "30px", fontWeight: "bold", color: "#333333" }}>
            {mofu}
          </div>
        </div>

        <div style={{ textAlign: "right", margin: "-10px 30px 20px" }}>
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
            }}
          >
            ▶ アバターを変更する
          </button>
        </div>

        <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "16px" }}>アイテムショップ</h3>

        {CATEGORIES.map((category) => {
          const categoryItems = items.filter((i) => i.category === category)
          if (categoryItems.length === 0) return null

          return (
            <div key={category} style={{ marginBottom: "32px" }}>
              <h4 style={{
                fontSize: "14px",
                color: "#444",
                marginBottom: "12px",
                paddingBottom: "6px",
                borderBottom: "2px solid #eee",
              }}>
                {CATEGORY_LABELS[category]}
              </h4>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
              }}>
                {categoryItems.map((item) => {
                  const unlocked = isUnlocked(item)
                  const purchased = purchasedIds.has(item.item_id)
                  const isFree = parseInt(item.mofu_cost) === 0
                  const canBuy = unlocked && !purchased && !isFree

                  return (
                    <div
                      key={item.item_id}
                      style={{
                        borderRadius: "16px",
                        background: "#f8f8f8",
                        padding: "10px",
                        textAlign: "center",
                        border: purchased ? "0px solid #a9b8e7" : "2px solid transparent",
                        opacity: unlocked ? 1 : 0.6,
                      }}
                    >
                      <div style={{ position: "relative", marginBottom: "8px" }}>
                        {!unlocked ? (
                          <img
                            src="/images/avatars/chest.png"
                            alt="ロック中"
                            style={{ width: "100%", borderRadius: "10px" }}
                          />
                        ) : (
                          <>
                            {category !== "avatar" && (
                              <img
                                src="/images/avatars/silhouette.png"
                                alt=""
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  borderRadius: "10px",
                                }}
                              />
                            )}
                            <img
                              src={`/images/avatars/${item.file_name}`}
                              alt={item.item_id}
                              style={{
                                position: "relative",
                                width: "100%",
                                borderRadius: "10px",
                              }}
                            />
                          </>
                        )}
                      </div>

                      {!unlocked ? (
                        <div style={{ fontSize: "11px", color: "#aaa", lineHeight: "1.4" }}>
                          🔒 {item.unlock_label}
                        </div>
                      ) : purchased ? (
                        <div style={{ fontSize: "12px", color: "#8197da", fontWeight: "bold" }}>
                          ✓ 取得済み
                        </div>
                      ) : isFree ? (
                        <div style={{ fontSize: "12px", color: "#8197da", fontWeight: "bold" }}>
                          ✓ 取得済み
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          style={{
                            background: mofu >= parseInt(item.mofu_cost) ? "#FF9F43" : "#ddd",
                            color: mofu >= parseInt(item.mofu_cost) ? "white" : "#aaa",
                            border: "none",
                            borderRadius: "10px",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: mofu >= parseInt(item.mofu_cost) ? "pointer" : "not-allowed",
                            width: "100%",
                          }}
                          disabled={mofu < parseInt(item.mofu_cost)}
                        >
                          {item.mofu_cost}モフ
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div style={{ height: "80px" }} />
      </div>
      <Navigation />

      {confirmItem && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "28px 24px",
            width: "280px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "15px", marginBottom: "8px", fontWeight: "bold" }}>
              購入確認
            </p>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px", lineHeight: "1.6" }}>
              {confirmItem.item_name || confirmItem.item_id} を<br />
              <span style={{ color: "#FF9F43", fontWeight: "bold" }}>{confirmItem.mofu_cost}モフ</span> で購入しますか？
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setConfirmItem(null)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "12px",
                  border: "1px solid #bbb", background: "#d0d0d0",
                  fontSize: "14px", cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={executePurchase}
                style={{
                  flex: 1, padding: "10px", borderRadius: "12px",
                  border: "none", background: "#FF9F43",
                  color: "#fff", fontSize: "14px", fontWeight: "bold", cursor: "pointer",
                }}
              >
                購入する
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: "90px", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(50,50,50,0.85)",
          color: "#fff", borderRadius: "20px",
          padding: "10px 20px", fontSize: "13px",
          whiteSpace: "nowrap", zIndex: 1001,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
