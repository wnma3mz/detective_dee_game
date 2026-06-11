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
  /**
   * 前置条件：须先解锁这些节点，本节点才会在 UI 中出现。
   * 这是节点可见性的唯一计算规则，UI 只看 requires。
   */
  requires?: string[];
  /**
   * 内容设计标注：解锁本节点后"逻辑上会引出"哪些后续节点。
   * 仅作策划提示，不参与 UI 状态计算。
   * 后续节点的实际可见性仍由那些节点自身的 requires 决定。
   */
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
  /** 调查行动点上限，精制版案件设置，超出后禁止继续调查 */
  actionPointLimit?: number;
  /** 阅卷初判选项（不计分，仅用于复盘对比） */
  initialHypotheses?: { id: string; label: string; feedback: string }[];
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
  actionPointsSpent: number;
  initialHypothesisId: string;
  /** 证据簿分类：玩家对每条已发现证据的主观归类（不参与评分） */
  evidenceNotes: Record<string, '事实' | '矛盾' | '推论' | ''>;
};

export type ProgressStore = Record<string, CaseProgress>;

/**
 * 中间推理链（内容设计用，不参与 UI 计算）
 *
 * 目的：强制内容设计时明确"哪几条证据组合才能推出哪个中间结论"，
 * 避免单条证据直达最终结论。
 *
 * 使用方法：在案件数据文件中声明 inferenceLinks 数组，作为设计注释，
 * 不需要导出到 caseExtensions，也不影响现有评分逻辑。
 */
export type InferenceLink = {
  id: string;
  /** 需要组合的证据 id 列表（2-3 条） */
  evidenceIds: string[];
  /** 这些证据组合后能推出的中间结论 */
  conclusion: string;
  /** 用相同证据可能误推出的错误结论（可选，用于复盘拆解） */
  decoyConclusion?: string;
};
