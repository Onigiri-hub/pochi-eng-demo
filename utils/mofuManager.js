// Mofu/streak: localStorage only (demo version)

function getProfile() {
  return JSON.parse(localStorage.getItem("demo_profile") || "{}");
}

function saveProfile(data) {
  localStorage.setItem("demo_profile", JSON.stringify(data));
}

export async function getStreak() {
  const data = JSON.parse(localStorage.getItem("demo_streak") || "null");
  if (!data) return 0;
  const today = new Date().toLocaleDateString("sv-SE");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("sv-SE");
  if (data.lastDate === today || data.lastDate === yesterday) return data.count || 0;
  return 0;
}

export async function updateStreak() {
  const data = JSON.parse(localStorage.getItem("demo_streak") || "null");
  const today = new Date().toLocaleDateString("sv-SE");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("sv-SE");

  let newCount = 1;
  if (data) {
    if (data.lastDate === today) return { count: data.count || 0, isFirstToday: false };
    if (data.lastDate === yesterday) newCount = (data.count || 0) + 1;
  }

  localStorage.setItem("demo_streak", JSON.stringify({ count: newCount, lastDate: today }));
  return { count: newCount, isFirstToday: true };
}

export function calcMofu(streak, isFirstClear) {
  if (isFirstClear) {
    if (streak >= 15) return 10;
    if (streak >= 10) return 8;
    if (streak >= 7) return 7;
    if (streak >= 3) return 6;
    return 5;
  }
  return streak >= 15 ? 2 : 1;
}

export async function addMofu(amount) {
  if (amount <= 0) return;
  const profile = getProfile();
  profile.mofu = (profile.mofu || 0) + amount;
  saveProfile(profile);
}

export async function getMofu() {
  return getProfile().mofu || 0;
}

export async function addTotalLessons() {
  const profile = getProfile();
  profile.totalLessons = (profile.totalLessons || 0) + 1;
  saveProfile(profile);
}

export async function addTotalRounds() {
  const profile = getProfile();
  profile.totalRounds = (profile.totalRounds || 0) + 1;
  saveProfile(profile);
}

export async function spendMofu(currentMofu, amount) {
  const newMofu = Math.max(0, currentMofu - amount);
  const profile = getProfile();
  profile.mofu = newMofu;
  saveProfile(profile);
  return newMofu;
}
