import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useProfileContext } from "../utils/ProfileContext";
import Navigation from "../components/Navigation";

export default function Settings() {
  const [nickname, setNickname] = useState("");
  const [chipSoundOn, setChipSoundOn] = useState(true);
  const [autoPlayOn, setAutoPlayOn] = useState(true);
  const [showJaTranslation, setShowJaTranslation] = useState(true);
  const [savedValues, setSavedValues] = useState(null);

  const router = useRouter();
  const { profile, setProfile } = useProfileContext();

  useEffect(() => {
    if (!profile) return;
    const nick = profile.nickname || "ゲスト";
    const chip = localStorage.getItem("chipSoundOn") !== "false";
    const auto = localStorage.getItem("autoPlayOn") !== "false";
    const ja = localStorage.getItem("showJaTranslation") !== "false";
    setNickname(nick);
    setChipSoundOn(chip);
    setAutoPlayOn(auto);
    setShowJaTranslation(ja);
    setSavedValues({ nickname: nick, chipSoundOn: chip, autoPlayOn: auto, showJaTranslation: ja });
  }, [profile]);

  const isDirty = savedValues !== null && (
    nickname !== savedValues.nickname ||
    chipSoundOn !== savedValues.chipSoundOn ||
    autoPlayOn !== savedValues.autoPlayOn ||
    showJaTranslation !== savedValues.showJaTranslation
  );

  const handleReset = () => {
    const confirmed = window.confirm("進捗データをリセットしますか？\nモフ・バッジ・連続日数もすべてリセットされます。この操作は元に戻せません。");
    if (!confirmed) return;
    localStorage.clear();
    alert("すべてのデータをリセットしました！");
    router.reload?.();
  };

  const handleSave = () => {
    const savedProfile = JSON.parse(localStorage.getItem("demo_profile") || "{}");
    const updatedProfile = { ...savedProfile, nickname };
    localStorage.setItem("demo_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("chipSoundOn", chipSoundOn);
    localStorage.setItem("autoPlayOn", autoPlayOn);
    localStorage.setItem("showJaTranslation", showJaTranslation);
    setProfile({ ...profile, nickname });
    setSavedValues({ nickname, chipSoundOn, autoPlayOn, showJaTranslation });
    alert("設定を保存しました！");
    router.push("/progress");
  };

  return (
    <div className="container">
      <div className="mainContent">
        <div className="header">
          <button className="backBtn" onClick={() => router.back()} style={{ color: "#333333", fontSize: "14px" }}>◀</button>
          <h2>設定</h2>
        </div>

        <section className="settingSection" style={{ marginTop: "60px" }}>
          <h3>ニックネームの変更</h3>
          <input
            type="text"
            className="nickInput"
            value={nickname}
            placeholder="新しいニックネーム"
            onChange={(e) => setNickname(e.target.value)}
          />
        </section>

        <section className="settingSection">
          <h3>音声</h3>
          <div className="audioToggle">
            <label>チップをタップしたときの音声</label>
            <button
              className={`toggleBtn ${chipSoundOn ? "on" : "off"}`}
              onClick={() => setChipSoundOn(!chipSoundOn)}
            >
              {chipSoundOn ? "ON" : "OFF"}
            </button>
          </div>
          <div className="audioToggle">
            <label>英文の自動再生</label>
            <button
              className={`toggleBtn ${autoPlayOn ? "on" : "off"}`}
              onClick={() => setAutoPlayOn(!autoPlayOn)}
            >
              {autoPlayOn ? "ON" : "OFF"}
            </button>
          </div>
          <div className="audioToggle">
            <label>日本語訳を表示する</label>
            <button
              className={`toggleBtn ${showJaTranslation ? "on" : "off"}`}
              onClick={() => setShowJaTranslation(!showJaTranslation)}
            >
              {showJaTranslation ? "ON" : "OFF"}
            </button>
          </div>
        </section>

        <div className="actionButtons">
          <button
            className="saveBtn"
            onClick={isDirty ? handleSave : undefined}
            style={{
              opacity: isDirty ? 1 : 0.4,
              cursor: isDirty ? "pointer" : "default",
            }}
          >
            設定を保存する
          </button>
          <ul className="links">
            <li onClick={() => router.push("/help")} style={{ cursor: "pointer" }}>ヘルプ</li>
            <li onClick={() => router.push("/terms")} style={{ cursor: "pointer" }}>利用規約とプライバシーポリシー</li>
            <li onClick={handleReset} style={{ cursor: "pointer", color: "#878787" }}>データリセット</li>
          </ul>
        </div>

      </div>
      <Navigation />
    </div>
  );
}
