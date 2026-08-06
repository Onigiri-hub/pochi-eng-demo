import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#fff",
      padding: "60px 24px",
      boxSizing: "border-box"
    }}>

      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
        Pochiへようこそ！
      </h1>

      <img
        src="/images/illustrations/pochi.png"
        alt="Pochi"
        style={{ width: "120px", margin: "24px 0" }}
      />

      <button
        onClick={() => router.push("/home")}
        style={{
          backgroundColor: "#333333",
          color: "#fff",
          padding: "14px 28px",
          border: "none",
          borderRadius: "25px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "24px"
        }}
      >
        体験版をプレイする
      </button>

      <div style={{
        maxWidth: "360px",
        width: "100%",
        backgroundColor: "#fff3f3",
        border: "1px solid #ffcccc",
        borderRadius: "12px",
        padding: "14px 18px",
        boxSizing: "border-box",
        marginBottom: "24px",
        color: "#cc0000",
        fontSize: "13px",
        lineHeight: "1.7",
      }}>
        ⚠️ これはデモ版です。学習記録はこのブラウザにのみ保存されます。ブラウザのキャッシュクリアやプライベートモードの終了などでデータが消えることがあります。
      </div>

      <div style={{
        maxWidth: "360px",
        width: "100%",
        backgroundColor: "#f8f8f8",
        borderRadius: "16px",
        padding: "24px",
        boxSizing: "border-box"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>
          Pochiとは？
        </h2>
        <p style={{ fontSize: "15px", lineHeight: "1.8", color: "#444", margin: 0 }}>
          ぽちぽちするだけで英語の感覚を身につけるアプリです。<br />
          英語初学者の負荷を下げて、英語を「わかる！」「つかってみたい！」にすることを目指して作りました。
        </p>
        <img
          src="/images/illustrations/index-introduction.png"
          alt="アプリ紹介"
          style={{
            width: "100%",
            borderRadius: "12px",
            marginTop: "16px"
          }}
        />
      </div>

      <div style={{ marginTop: "32px", fontSize: "13px", color: "#888", textAlign: "center" }}>
        <span
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => router.push("/terms")}
        >
          利用規約とプライバシーポリシー
        </span>
      </div>

    </div>
  );
}
