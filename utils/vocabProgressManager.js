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

// ===== 履修フェーズ：セクション状態（localStorageのみ・demo版）=====
// 保存先: localStorage["vocab_section_state_{section_id}"] = { clearedRounds:{}, test:{passed,lastScore,lastTestedAt} }

function _readSectionState(sectionId) {
  const raw = localStorage.getItem(`vocab_section_state_${sectionId}`);
  const data = raw ? JSON.parse(raw) : {};
  return { clearedRounds: data.clearedRounds || {}, test: data.test || null };
}
function _writeSectionState(sectionId, state) {
  localStorage.setItem(`vocab_section_state_${sectionId}`, JSON.stringify(state));
}

export async function getSectionState(sectionId) {
  return _readSectionState(sectionId);
}

// 履修ラウンドのクリアを記録し、初クリアかどうかを返す
export async function markRoundCleared(sectionId, roundId) {
  const state = _readSectionState(sectionId);
  const firstClear = !state.clearedRounds[roundId];
  state.clearedRounds[roundId] = true;
  _writeSectionState(sectionId, state);
  await addVocabHistory(roundId, sectionId);
  return firstClear;
}

// 定着テストの結果を保存（lastTestedAt はミリ秒。gaugeはこの数値から計算）
export async function saveSectionTest(sectionId, passed, lastScore) {
  const state = _readSectionState(sectionId);
  state.test = { passed, lastScore, lastTestedAt: Date.now() };
  _writeSectionState(sectionId, state);
}

// stageList / vocabComplete 用：全セクションの clearedRounds を集約
export function getAllClearedRoundIds() {
  const set = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("vocab_section_state_")) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        const cr = data.clearedRounds || {};
        Object.keys(cr).forEach((rid) => { if (cr[rid]) set.add(rid); });
      } catch {}
    }
  }
  return set;
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
