import Head from "next/head"
import Script from "next/script"
import { Noto_Sans_JP, M_PLUS_Rounded_1c } from "next/font/google"
import "../styles/home.css";
import "../styles/profile.css";
import "../styles/unitList.css";
import "../styles/lecture.css";
import "../styles/lessonList.css";
import "../styles/practice.css";
import { useState, useEffect } from "react";
import { DictionaryContext } from "../utils/DictionaryContext";
import { ProfileContext } from "../utils/ProfileContext";
import { loadCSV } from "../utils/csvLoader";

const noto = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
})

const mplus = M_PLUS_Rounded_1c({
  weight: ["700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mplus",
})

export default function MyApp({ Component, pageProps }) {
  const [dictionary, setDictionary] = useState([])
  const [profile, setProfile] = useState(null)
  const [mofu, setMofu] = useState(0)
  const [streak, setStreak] = useState(0)
  const [totalLessons, setTotalLessons] = useState(0)
  const [totalRounds, setTotalRounds] = useState(0)
  const [completedUnits, setCompletedUnits] = useState(new Set())

  useEffect(() => {
    const savedProfile = localStorage.getItem("demo_profile")
    if (savedProfile) {
      const data = JSON.parse(savedProfile)
      setProfile(data)
      setMofu(data.mofu || 0)
      setTotalLessons(data.totalLessons || 0)
      setTotalRounds(data.totalRounds || 0)
    } else {
      const defaultProfile = {
        nickname: "ゲスト",
        avatar: "01.png",
        acc_head: null,
        acc_eye: null,
        acc_mouth: null,
        mofu: 0,
        startDate: new Date().toLocaleDateString("sv-SE"),
        totalLessons: 0,
        totalRounds: 0,
      }
      localStorage.setItem("demo_profile", JSON.stringify(defaultProfile))
      setProfile(defaultProfile)
    }

    const savedStreak = localStorage.getItem("demo_streak")
    if (savedStreak) {
      const data = JSON.parse(savedStreak)
      const today = new Date().toLocaleDateString("sv-SE")
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("sv-SE")
      if (data.lastDate === today || data.lastDate === yesterday) {
        setStreak(data.count || 0)
      }
    }

    const savedCompletedUnits = localStorage.getItem("demo_completed_units")
    if (savedCompletedUnits) {
      setCompletedUnits(new Set(JSON.parse(savedCompletedUnits)))
    }
  }, [])

  useEffect(() => {
    async function load() {
      const data = await loadCSV("/data/word_dic.csv")
      setDictionary(data)
    }
    load()

    const kirakira = new Audio("/sound/kirakira.mp3")
    kirakira.volume = 0.2
    kirakira.load()
    window._kirakira = kirakira
  }, [])

  return (
    <DictionaryContext.Provider value={dictionary}>
      <ProfileContext.Provider value={{
        profile, setProfile,
        mofu, setMofu,
        streak, setStreak,
        totalLessons, setTotalLessons,
        totalRounds, setTotalRounds,
        completedUnits, setCompletedUnits,
      }}>
        <Head>
          <meta name="theme-color" content="#ebebeb" />
        </Head>
        {process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3714576929730992"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <main className={`${noto.className} ${mplus.variable}`}>
          <Component {...pageProps} />
        </main>
      </ProfileContext.Provider>
    </DictionaryContext.Provider>
  )
}
