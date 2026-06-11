export type Difficulty = '入门' | '进阶' | '高阶';

export type CaseCategory =
  | '伪装自杀'
  | '动机排除'
  | '身份推理'
  | '路线时间'
  | '密室现场'
  | '物证翻案'
  | '机关诡计'
  | '文字谜'
  | '连环预告';

export type InvestigationAction = {
  id: string;
  title: string;
  clue: string;
};

export type ImageSlot = {
  id: string;
  label: string;
  futurePath: string;
  prompt: string;
};

export type CaseQuestion = {
  id: string;
  prompt: string;
  placeholder: string;
};

export type TruthOption = {
  id: string;
  label: string;
};

export type Deduction = {
  truthQuestion: string;
  truthOptions: TruthOption[];
  correctTruthId: string;
  evidencePrompt: string;
  notePrompt: string;
};

export type CaseSolution = {
  truth: string;
  reasoning: string[];
  scoreRubric: string[];
  takeaway: string;
};

export type DetectiveCase = {
  id: string;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  category: CaseCategory;
  sourceFile: string;
  intro: string[];
  readerNote: string;
  playerTask: string;
  imageSlots: ImageSlot[];
  investigationActions: InvestigationAction[];
  questions: CaseQuestion[];
  deduction: Deduction;
  hints: {
    light: string;
    strong: string;
  };
  solution: CaseSolution;
};

export type CaseProgress = {
  unlockedActionIds: string[];
  lightHintUsed: boolean;
  strongHintUsed: boolean;
  submitted: boolean;
  answers: Record<string, string>;
  selectedTruthId: string;
  selectedEvidenceIds: string[];
  finalNote: string;
  score: number | null;
};

export type ProgressStore = Record<string, CaseProgress>;
