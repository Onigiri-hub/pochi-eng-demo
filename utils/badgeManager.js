import Papa from "papaparse";

export async function loadBadgeList() {
  const res = await fetch("/data/badgeList.csv")
  const text = await res.text()
  return Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  }).data
}

export async function getBadges() {
  return JSON.parse(localStorage.getItem("demo_badges_earned") || "[]");
}

export async function checkAndEarnBadges({
  streak = 0,
  totalLessons = 0,
  totalRounds = 0,
  completedStages = [],
  isUnitComplete = null,
  isPerfect = false,
  completedUnitCount = 0,
}) {
  const earned = await getBadges();
  const newBadges = [];

  const check = (id, condition) => {
    if (condition && !earned.includes(id)) {
      newBadges.push(id);
    }
  };

  check("first_clear", totalLessons >= 1);
  check("lesson_5", totalLessons >= 5);
  check("lesson_10", totalLessons >= 10);
  check("lesson_50", totalLessons >= 50);
  check("lesson_100", totalLessons >= 100);
  check("lesson_200", totalLessons >= 200);

  if (isUnitComplete) {
    check(`unit_${isUnitComplete}_complete`, true);
  }

  check("streak_3", streak >= 3);
  check("streak_7", streak >= 7);
  check("streak_10", streak >= 10);
  check("streak_30", streak >= 30);
  check("streak_50", streak >= 50);
  check("streak_100", streak >= 100);
  check("streak_200", streak >= 200);
  check("streak_365", streak >= 365);

  for (const stageId of completedStages) {
    check(`${stageId}_clear`, true);
  }

  check("round_5", totalRounds >= 5);
  check("round_10", totalRounds >= 10);
  check("round_20", totalRounds >= 20);
  check("round_30", totalRounds >= 30);
  check("round_50", totalRounds >= 50);
  check("round_100", totalRounds >= 100);
  check("round_200", totalRounds >= 200);
  check("round_500", totalRounds >= 500);

  check("unit_clear_5", completedUnitCount >= 5);
  check("unit_clear_10", completedUnitCount >= 10);
  check("unit_clear_20", completedUnitCount >= 20);
  check("unit_clear_30", completedUnitCount >= 30);
  check("unit_clear_40", completedUnitCount >= 40);
  check("unit_clear_50", completedUnitCount >= 50);

  if (newBadges.length > 0) {
    localStorage.setItem("demo_badges_earned", JSON.stringify([...earned, ...newBadges]));
  }

  return newBadges;
}
