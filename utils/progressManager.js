// Progress: localStorage only (demo version)

export async function getProgress(unit) {
  return Number(localStorage.getItem(`progress_u${unit}`) || 0);
}

export async function saveProgress(unit, clearedOrder) {
  const current = Number(localStorage.getItem(`progress_u${unit}`) || 0);
  const isFirstClear = clearedOrder >= current;

  if (isFirstClear) {
    localStorage.setItem(`progress_u${unit}`, clearedOrder + 1);
  }

  const history = JSON.parse(localStorage.getItem("demo_history") || "[]");
  history.push({
    unit_NO: String(unit),
    lesson_NO: String(clearedOrder),
    dateString: new Date().toLocaleDateString("sv-SE"),
  });
  localStorage.setItem("demo_history", JSON.stringify(history));

  return { isFirstClear };
}

export async function checkAndSaveUnitComplete(unitNo, totalLessonsInUnit, completedUnits) {
  if (completedUnits.has(`u${unitNo}`)) return false;

  const progress = Number(localStorage.getItem(`progress_u${unitNo}`) || 0);
  if (progress >= totalLessonsInUnit) {
    const saved = JSON.parse(localStorage.getItem("demo_completed_units") || "[]");
    if (!saved.includes(`u${unitNo}`)) {
      saved.push(`u${unitNo}`);
      localStorage.setItem("demo_completed_units", JSON.stringify(saved));
    }
    return true;
  }
  return false;
}
