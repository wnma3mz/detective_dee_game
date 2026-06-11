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

// ── 旧结构（向后兼容） ──────────────────────────────────────────────────────
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

// ── 新结构 ──────────────────────────────────────────────────────────────────

/** 证据的作用角色 */
export type EvidenceRole = 'key' | 'supporting' | 'context' | 'decoy';

export type Evidence = {
  id: string;
  title: string;
  content: string;
  /** key=关键证据 supporting=辅助 context=背景 decoy=误导 */
  role: EvidenceRole;
  /** 支撑的推论标签 */
  supports?: string[];
  /** 会把玩家引向的错误结论 */
  misleadsTo?: string[];
};

export type InvestigationNodeType = 'scene' | 'witness' | 'evidence' | 'timeline' | 'knowledge';

export type InvestigationNode = {
  id: string;
  type: InvestigationNodeType;
  title: string;
  /** 调查前展示的引导语（可选） */
  prompt?: string;
  /** 调查后展示的结果 */
  result: string;
  /** 消耗行动点数，默认 1 */
  cost: number;
  /** 前置条件：须先解锁这些节点 */
  requires?: string[];
  /** 解锁此节点后，会新出现哪些节点 */
  unlocks?: string[];
  /** 本节点关联的证据 id */
  evidenceIds?: string[];
};

export type DeductionOptionType = 'single' | 'multi' | 'text';

export type DeductionOption = {
  id: string;
  label: string;
};

export type DeductionStep = {
  id: string;
  prompt: string;
  type: DeductionOptionType;
  options?: DeductionOption[];
  /** 正确选项 id（single/multi 有效） */
  correctOptionIds?: string[];
  /** 答对需要已解锁的关键证据 id（仅用于评分参考） */
  requiredEvidenceIds?: string[];
  /** 每步骤满分 */
  maxScore?: number;
};

export type CaseFeedback = {
  /** 针对每个结论选项 id 的反馈文字 */
  optionFeedback: Record<string, string>;
  /** 针对每条证据 id 的反馈文字 */
  evidenceFeedback: Record<string, string>;
  /** 玩家漏掉关键证据时的提示，key 为证据 id */
  missingKeyEvidence: Record<string, string>;
  finalSummary: {
    excellent: string;
    partial: string;
    failed: string;
  };
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
  // 旧调查结构（无新数据的案件仍使用）
  investigationActions: InvestigationAction[];
  questions: CaseQuestion[];
  deduction: Deduction;
  hints: {
    light: string;
    strong: string;
  };
  solution: CaseSolution;
  // 新结构（可选，样板案件补充）
  evidenceList?: Evidence[];
  investigationNodes?: InvestigationNode[];
  deductionSteps?: DeductionStep[];
  feedback?: CaseFeedback;
};

export type CaseProgress = {
  // 旧字段
  unlockedActionIds: string[];
  lightHintUsed: boolean;
  strongHintUsed: boolean;
  submitted: boolean;
  answers: Record<string, string>;
  selectedTruthId: string;
  selectedEvidenceIds: string[];
  finalNote: string;
  score: number | null;
  // 新字段
  unlockedNodeIds: string[];
  deductionAnswers: Record<string, string[]>;
};

export type ProgressStore = Record<string, CaseProgress>;
