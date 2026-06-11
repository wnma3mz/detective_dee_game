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
  const truthScore = progress.selectedTruthId === gameCase.deduction.correctTruthId ? 4 : 0;
  const validEvidenceIds = new Set(gameCase.investigationActions.map((action) => action.id));
  const evidenceScore = Math.min(
    4,
    progress.selectedEvidenceIds.filter((id) => validEvidenceIds.has(id)).length,
  );
  const noteScore = progress.finalNote.trim() ? 1 : 0;
  const progressScore = progress.unlockedActionIds.length >= 3 ? 1 : 0;
  const hintPenalty = Number(progress.lightHintUsed) + Number(progress.strongHintUsed) * 2;
  return Math.max(0, truthScore + evidenceScore + noteScore + progressScore - hintPenalty);
}
