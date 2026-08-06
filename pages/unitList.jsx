import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import Papa from "papaparse"
import Navigation from "../components/Navigation";
import { getProgress } from "../utils/progressManager";

export default function UnitList(){
  const [units, setUnits] = useState({})
  const [allData, setAllData] = useState([])
  const [progressMap, setProgressMap] = useState({}) // ★ 全ユニットの進捗をまとめて管理
  const [showLockedMsg, setShowLockedMsg] = useState(false)
  const router = useRouter()
  const scrollRefs = useRef({});

  useEffect(()=>{
    async function load() {
      const res = await fetch("/data/all_unit_list.csv")
      const text = await res.text()
      const data = Papa.parse(text,{
        header:true,
        skipEmptyLines:true
      }).data

      setAllData(data);

      const grouped={};
      data.forEach(l=>{
        if(!grouped[l.unit_NO]){
          grouped[l.unit_NO]={
            name:l.unit_name,
            color:l.unit_color
          }
        }
      });
      setUnits(grouped);

      // ★ 全ユニットの進捗をまとめて取得
      const unitNos = Object.keys(grouped)
      const entries = await Promise.all(
        unitNos.map(async (no) => {
          const p = await getProgress(no)
          return [no, p || 1]
        })
      )
      setProgressMap(Object.fromEntries(entries))
    }

    load()
  },[])

  useEffect(() => {
    if (Object.keys(units).length > 0) {
      const lastUnit = localStorage.getItem("lastPlayedUnit");
      if (lastUnit && scrollRefs.current[lastUnit]) {
        scrollRefs.current[lastUnit].scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }
  }, [units]);

  function openUnit(unitNo){
    router.push(`/lessonList?unit=${unitNo}`)
  }

  return(
    <div className="unitListContainer" style={{ paddingBottom: "100px" }}>
      <div className="unitList">
        {/* タイトル追加 */}
        <div style={{ textAlign: "center", margin: "25px 0 40px", fontSize: "22px", fontWeight: "bold", color: "#333333" }}>
          <img src="/images/icons/dog_333.svg" style={{ width: "30px", marginRight: "8px", verticalAlign: "middle" }} />
          キホンの英文法
        </div>

        {Object.entries(units).map(([no, unit]) => {
          const unitLessons = allData.filter(l => l.unit_NO === no);
          const total = unitLessons.length;
          const progress = progressMap[no] || 1  // ★ progressMapから取得
          const clearedCount = Math.min(progress - 1, total);
          const progressPercent = total > 0 ? (clearedCount / total) * 100 : 0;

          return (
            <div
              className="unitCard"
              key={no}
              ref={(el) => (scrollRefs.current[no] = el)}
              onClick={() => {
                localStorage.setItem("lastPlayedUnit", no);
                openUnit(no);
              }}
              data-sound
            >
              <img 
                src="/images/illustrations/unitlist_button.png" 
                className="unitCardBg"
              />
              <div className="unitCardContent">
                <div className="unitTitle">Unit {no}</div>
                <div className="unitName">{unit.name}</div>
                <div className="unitBarRow">
                  <div className="unitBarContainer">
                    <div 
                      className="unitBarFill" 
                      style={{ 
                        width: `${progressPercent}%`,
                        backgroundColor: progressPercent === 100 ? "#FFD700" : "#555",
                        boxShadow: progressPercent === 100 ? "0 0 10px #FFD700" : "none"
                      }} 
                    />
                  </div>
                  <div className="progressText">{clearedCount}/{total}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ロック済みUnit16 */}
        <div
          className="unitCard"
          onClick={() => setShowLockedMsg(true)}
          style={{ opacity: 0.5, filter: "grayscale(1)", cursor: "pointer" }}
        >
          <img src="/images/illustrations/unitlist_button.png" className="unitCardBg" />
          <div className="unitCardContent">
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>🔒</div>
            <div className="unitTitle">Unit 16〜</div>
            <div className="unitName">製品版で公開中</div>
          </div>
        </div>

        {/* ロックメッセージポップアップ */}
        {showLockedMsg && (
          <div
            onClick={() => setShowLockedMsg(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "28px 24px",
                maxWidth: "280px",
                width: "85%",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🐾</div>
              <p style={{ fontSize: "15px", lineHeight: "1.7", margin: "0 0 20px", color: "#333" }}>
                Unit16以降は<br />
                <strong>Pochi英語（本家）</strong>で<br />
                プレイできます！
              </p>
              <a
                href="https://pochi-english.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  background: "#FF9F43",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "10px 0",
                  fontWeight: "bold",
                  textDecoration: "none",
                  marginBottom: "10px",
                }}
              >
                Pochi英語をプレイする
              </a>
              <button
                onClick={() => setShowLockedMsg(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#aaa",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        )}

      </div>
      <Navigation />
    </div>
  )
}