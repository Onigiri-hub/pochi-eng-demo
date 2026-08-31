// Vocab progress: localStorage only (demo version)

export async function saveVocabRoundProgress(roundId, doneWords, totalWords) {
  const existing = JSON.parse(localStorage.getItem(`vocab_round_${roundId}`) || '{"doneWords":[]}');
  const merged = [...new Set([...(existing.doneWords || []), ...doneWords])];
  localStorage.setItem(`vocab_round_${roundId}`, JSON.stringify({ doneWords: merged, totalWords }));
}

export async function saveVocabMastery(section, modeKey, masteryMap) {
  localStorage.setItem(`vocab_mastery_${section}_${modeKey}`, JSON.stringify(masteryMap));
}

export async function getVocabRoundProgress(roundId) {
  const local = localStorage.getItem(`vocab_round_${roundId}`);
  return local ? JSON.parse(local) : { doneWords: [], totalWords: 0 };
}

export async function getVocabMastery(section, modeKey) {
  const local = localStorage.getItem(`vocab_mastery_${section}_${modeKey}`);
  return local ? JSON.parse(local) : {};
}

export async function addVocabHistory(roundId, sectionId) {
  const history = JSON.parse(localStorage.getItem("demo_vocab_history") || "[]");
  history.push({
    round_id: roundId,
    section_id: sectionId,
    dateString: new Date().toLocaleDateString("sv-SE"),
  });
  localStorage.setItem("demo_vocab_history", JSON.stringify(history));
}

// ===== 並べ替え単語の履修・自信度ステータス（localStorageのみ・demo版）=====
// 保存先: localStorage["arrange_word_status_{stage}"]
//   = { va0001: { learned: true, confidence: "none"|"low"|"high" }, ... }

// ステータスを取得（一覧表示用）
export async function getArrangeWordStatus(stage) {
  const local = localStorage.getItem(`arrange_word_status_${stage}`);
  return local ? JSON.parse(local) : {};
}

// 右●：自信度をユーザー入力で保存（learnedは保持）
export async function saveArrangeWordConfidence(stage, wordId, confidence) {
  const key = `arrange_word_status_${stage}`;
  const local = localStorage.getItem(key);
  const current = local ? JSON.parse(local) : {};
  current[wordId] = { ...(current[wordId] || { learned: false }), confidence };
  localStorage.setItem(key, JSON.stringify(current));
  return current;
}

// 左●：並べ替え問題を一度でも正解したら履修にする
export async function markArrangeWordLearned(stage, wordId) {
  const key = `arrange_word_status_${stage}`;
  const local = localStorage.getItem(key);
  const current = local ? JSON.parse(local) : {};
  if (current[wordId]?.learned) return current; // 既に履修済みなら何もしない
  current[wordId] = { confidence: "none", ...(current[wordId] || {}), learned: true };
  localStorage.setItem(key, JSON.stringify(current));
  return current;
}

// 並べて英単語（単語ベース・ラウンド制なし）の完了をhistoryに記録
export async function addArrangeWordHistory(stageId) {
  const history = JSON.parse(localStorage.getItem("demo_vocab_history") || "[]");
  history.push({
    stage_id: stageId,
    mode: "arrangeWord",
    dateString: new Date().toLocaleDateString("sv-SE"),
  });
  localStorage.setItem("demo_vocab_history", JSON.stringify(history));
}
