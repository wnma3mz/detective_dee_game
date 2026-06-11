import type { CaseProgress, DetectiveCase, ProgressStore } from './types';

const STORAGE_KEY = 'digong-detective-progress-v1';

export function createEmptyProgress(gameCase: DetectiveCase): CaseProgress {
  return {
    unlockedActionIds: [],
    lightHintUsed: false,
    strongHintUsed: false,
    submitted: false,
    answers: Object.fromEntries(gameCase.questions.map((question) => [question.id, ''])),
    selectedTruthId: '',
    selectedEvidenceIds: [],
    finalNote: '',
    score: null,
    // 新字段
    unlockedNodeIds: [],
    deductionAnswers: {},
    actionPointsSpent: 0,
    initialHypothesisId: '',
  };
}

export function loadProgress(): ProgressStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressStore): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function calculateScore(gameCase: DetectiveCase, progress: CaseProgress): number {
  const hintPenalty = Number(progress.lightHintUsed) + Number(progress.strongHintUsed) * 2;

  // ── 新评分：使用 deductionSteps + evidenceList ────────────────────────────
  if (gameCase.deductionSteps && gameCase.evidenceList) {
    let total = 0;

    // 各推理步骤得分
    for (const step of gameCase.deductionSteps) {
      const answers = progress.deductionAnswers[step.id] ?? [];
      const correct = step.correctOptionIds ?? [];
      const maxScore = step.maxScore ?? 2;

      // 检查该步骤要求的证据是否已被玩家选择
      const requiredEvidenceIds = step.requiredEvidenceIds ?? [];
      const evidenceCovered =
        requiredEvidenceIds.length === 0 ||
        requiredEvidenceIds.some((eid) => progress.selectedEvidenceIds.includes(eid));
      const evidenceMultiplier = evidenceCovered ? 1 : 0.6;

      if (step.type === 'text') {
        if (answers[0]?.trim()) total += maxScore * evidenceMultiplier;
      } else if (step.type === 'single') {
        if (correct.length > 0 && answers[0] === correct[0]) total += maxScore * evidenceMultiplier;
      } else if (step.type === 'multi') {
        const correctSet = new Set(correct);
        const hits = answers.filter((a) => correctSet.has(a)).length;
        const wrong = answers.filter((a) => !correctSet.has(a)).length;
        const raw = (hits / Math.max(correctSet.size, 1)) * maxScore - wrong * 0.5;
        total += Math.max(0, raw) * evidenceMultiplier;
      }
    }

    // 证据质量分
    const evidenceMap = new Map(gameCase.evidenceList.map((e) => [e.id, e.role]));
    let evidenceScore = 0;
    for (const eid of progress.selectedEvidenceIds) {
      const role = evidenceMap.get(eid);
      if (role === 'key') evidenceScore += 1;
      else if (role === 'supporting' || role === 'context') evidenceScore += 0.5;
      else if (role === 'decoy') evidenceScore -= 1;
    }
    total += Math.min(3, Math.max(0, evidenceScore));

    return Math.max(0, Math.round(total - hintPenalty));
  }

  // ── 旧评分（向后兼容） ────────────────────────────────────────────────────
  const truthScore = progress.selectedTruthId === gameCase.deduction.correctTruthId ? 4 : 0;
  const validEvidenceIds = new Set(gameCase.investigationActions.map((action) => action.id));
  const evidenceScore = Math.min(
    4,
    progress.selectedEvidenceIds.filter((id) => validEvidenceIds.has(id)).length,
  );
  const noteScore = progress.finalNote.trim() ? 1 : 0;
  const progressScore = progress.unlockedActionIds.length >= 3 ? 1 : 0;
  return Math.max(0, truthScore + evidenceScore + noteScore + progressScore - hintPenalty);
}
