import { useRouter } from "next/router";

export default function DeleteAccount() {
  const router = useRouter();

  const handleReset = () => {
    const confirmed = window.confirm("すべての学習データを削除しますか？この操作は元に戻せません。");
    if (!confirmed) return;
    localStorage.clear();
    router.push("/delete-success");
  };

  return (
    <div className="container" style={{
      maxWidth: "400px",
      margin: "0 auto",
      minHeight: "100vh",
      position: "relative",
      backgroundColor: "#fff"
    }}>
      <div className="mainContent" style={{
        textAlign: "center",
        padding: "50px 20px"
      }}>
        <h2>データの削除</h2>
        <p>すべての学習記録を削除します。<br />この操作は元に戻せません。</p>

        <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "15px" }}>
          <button
            onClick={() => router.back()}
            style={{ padding: "15px", borderRadius: "10px", border: "none", background: "#333333", color: "white", cursor: "pointer" }}
          >
            戻る
          </button>

          <button
            onClick={handleReset}
            style={{ padding: "15px", borderRadius: "10px", border: "none", background: "#d44", color: "white", cursor: "pointer" }}
          >
            データを削除する
          </button>
        </div>
      </div>
    </div>
  );
}
