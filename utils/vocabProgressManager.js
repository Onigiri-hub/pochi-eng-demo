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
