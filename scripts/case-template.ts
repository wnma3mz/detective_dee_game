/**
 * 精制案件数据骨架模板
 *
 * 使用方法：
 * 1. 将本文件复制到 src/data/cases-extended.ts 末尾（或新建独立文件后在 cases.ts 合并）
 * 2. 将所有 XX 替换为实际案件编号（两位数字，如 03）
 * 3. 按照 docs/case-authoring-guide.md 填写每个字段
 * 4. 在 caseExtensions 中加入对应条目
 * 5. 运行 npm run check 验证通过
 * 6. 人工自查：只看选项能否猜中；只读勘查能否直接知道真相
 *
 * 字段说明详见 docs/case-authoring-guide.md
 */

import type {
  CaseFeedback,
  DeductionStep,
  Evidence,
  InvestigationNode,
} from '../src/data/types';

// ─────────────────────────────────────────────────────────────────────────────
// XX 案件标题
// ─────────────────────────────────────────────────────────────────────────────

// ── 红鲱鱼链设计（必填，写在这里方便复查） ──────────────────────────────────
//
// 错误结论：玩家可能误判为……
// 支持它的表面证据：
//   - 证据 A（id: ）
//   - 证据 B（id: ）
// 解释不了的关键矛盾：
//   - 矛盾点 C（对应证据 id: ）
// 复盘拆解：先说"为什么这条链看起来合理"，再说"在哪里断了"。
//
// 提醒：红鲱鱼链至少要让玩家犹豫 60-70%，不能一看就是弱证据。

export const evidenceListXX: Evidence[] = [
  // ── 关键证据（3-4 条） ──────────────────────────────────────────────────
  {
    id: 'key-evidence-1',           // 唯一 id，小写英文+连字符
    title: '关键证据一',             // 4-8 字
    content: '描述玩家看到了什么——位置、形态、数量、颜色、原话等客观细节。不包含结论。20-50 字。',
    role: 'key',
    supports: ['conclusion-tag'],   // 内部设计标注，可选
  },
  {
    id: 'key-evidence-2',
    title: '关键证据二',
    content: '描述玩家看到了什么——客观陈述，不包含"说明""证明""只有"等结论性词语。20-50 字。',
    role: 'key',
    supports: ['conclusion-tag'],
  },
  {
    id: 'key-evidence-3',
    title: '关键证据三',
    content: '描述玩家看到了什么——客观陈述。20-50 字。',
    role: 'key',
    supports: ['conclusion-tag'],
  },
  // ── 辅助证据（1-2 条） ──────────────────────────────────────────────────
  {
    id: 'supporting-evidence-1',
    title: '辅助证据',
    content: '加强某个推论但不单独成立。客观陈述。20-50 字。',
    role: 'supporting',
    supports: ['conclusion-tag'],
  },
  // ── 误导证据（1-2 条，必须有） ──────────────────────────────────────────
  // 误导证据必须表面合理，能和其他证据共同构成红鲱鱼链（见顶部注释）。
  {
    id: 'decoy-evidence-1',
    title: '误导证据',
    content: '表面看起来指向某个结论，实际有破绽。客观陈述，不写结论。20-50 字。',
    role: 'decoy',
    misleadsTo: ['wrong-conclusion-tag'],  // 会把玩家引向的错误结论，必填
  },
];

export const investigationNodesXX: InvestigationNode[] = [
  // ── 基础节点（无前置，玩家一开始就能看到） ──────────────────────────────
  {
    id: 'scene-1',
    type: 'scene',                  // scene / witness / evidence / timeline / knowledge
    title: '调查现场一',             // 6-12 字，玩家点击前能看到
    // result 只写事实：位置、颜色、形态、数量、人物原话。
    // 禁止在 result 里出现"说明""证明""真正目标""即栽赃""不可能""最可能"等词。
    result: '描述玩家调查后发现了什么——客观细节，不给结论。40-100 字。',
    cost: 1,
    evidenceIds: ['key-evidence-1'],
    unlocks: ['witness-1'],         // 内容设计标注，不参与 UI 计算
  },
  {
    id: 'scene-2',
    type: 'scene',
    title: '调查现场二',
    result: '描述玩家调查后发现了什么——客观细节，不给结论。40-100 字。',
    cost: 1,
    evidenceIds: ['key-evidence-2'],
  },
  {
    id: 'timeline-1',
    type: 'timeline',
    title: '核查时间线',
    result: '描述时间线事实——先后顺序、具体时刻、持续时长。不直接给结论。40-100 字。',
    cost: 1,
    evidenceIds: ['key-evidence-3'],
  },
  // ── 证人节点（基础） ─────────────────────────────────────────────────────
  {
    id: 'witness-1',
    type: 'witness',
    title: '盘问证人甲',
    result: '证人甲的陈述原话或摘要，客观转述，不加判断性结论。40-100 字。',
    cost: 1,
    unlocks: ['witness-1-follow'],
  },
  // ── 追问节点（需要先解锁父节点） ────────────────────────────────────────
  {
    id: 'witness-1-follow',
    type: 'witness',
    title: '追问证人甲某细节',
    prompt: '追问的背景——告诉玩家为什么要追问这个细节。',
    result: '追问后的内容——揭示新的客观信息或前后矛盾，不直接下判断。40-100 字。',
    cost: 1,
    requires: ['witness-1'],        // 前置节点，须先解锁
    evidenceIds: ['supporting-evidence-1'],
  },
  // ── 误导节点（调查后得到误导证据） ──────────────────────────────────────
  {
    id: 'scene-decoy',
    type: 'scene',
    title: '调查看似关键处',
    // 误导节点的 result 同样只写事实，不能主动提示"这里没问题"。
    result: '描述玩家看到的事实，看起来有意义，但有隐藏破绽。40-100 字。',
    cost: 1,
    evidenceIds: ['decoy-evidence-1'],
  },
];

export const deductionStepsXX: DeductionStep[] = [
  // 第一步：判断表面说法是否可信
  {
    id: 'step-surface',
    prompt: '本案官方/报案人说法是……。这个说法是否可信？',
    type: 'single',
    // 选项只写中性标签，不写理由，不暗示哪个是正确答案。
    // 正确选项不要比错误选项长一大截。
    options: [
      { id: 'trust', label: '基本可信' },
      { id: 'doubt', label: '存在可疑之处' },
      { id: 'unsure', label: '线索不足，难以判断' },
    ],
    correctOptionIds: ['doubt'],
    maxScore: 2,
  },
  // 第二步：找到最核心的逻辑矛盾
  {
    id: 'step-contradiction',
    prompt: '以下哪一点最能推翻表面说法？',
    type: 'single',
    options: [
      // 三个选项应该看起来都有一定道理，不能一眼看出哪个是"正确"选项。
      { id: 'point-a', label: '四到六字的中性标签' },
      { id: 'point-b', label: '四到六字的中性标签' },
      { id: 'point-c', label: '四到六字的中性标签' },
    ],
    correctOptionIds: ['point-a'],  // 替换为实际正确项
    requiredEvidenceIds: ['key-evidence-1'],  // 答对需要已发现该证据，影响得分倍率
    maxScore: 2,
  },
  // 第三步：组合支撑证据（多选）
  {
    id: 'step-evidence',
    prompt: '哪些线索共同支持你的核心推论？（可多选）',
    type: 'multi',
    // 选项 label 写证据名称，不写"关键""误导"等定性词。
    options: [
      { id: 'key-evidence-1', label: '关键证据一的标题' },
      { id: 'key-evidence-2', label: '关键证据二的标题' },
      { id: 'key-evidence-3', label: '关键证据三的标题' },
      { id: 'supporting-evidence-1', label: '辅助证据的标题' },
      { id: 'decoy-evidence-1', label: '误导证据的标题' },  // 混入干扰，让玩家思考
    ],
    correctOptionIds: ['key-evidence-1', 'key-evidence-2', 'key-evidence-3', 'supporting-evidence-1'],
    maxScore: 3,
  },
  // 第四步：最终结论
  {
    id: 'step-conclusion',
    prompt: '本案真相最可能是？',
    type: 'single',
    options: [
      // 所有选项长度相近。正确选项不能明显比其他选项更"完整"或"像答案"。
      // 错误选项也要有表面合理的支撑（对应红鲱鱼链）。
      { id: 'conclusion-a', label: '六到十二字的中性标签' },
      { id: 'conclusion-b', label: '六到十二字的中性标签' },
      { id: 'conclusion-c', label: '六到十二字的中性标签' },
    ],
    correctOptionIds: ['conclusion-a'],  // 替换为实际正确项
    requiredEvidenceIds: ['key-evidence-1', 'key-evidence-2', 'key-evidence-3'],
    maxScore: 3,
  },
];

export const feedbackXX: CaseFeedback = {
  optionFeedback: {
    // ── step-surface 选项反馈 ──────────────────────────────────────────────
    trust: '说明为什么相信表面说法的玩家忽略了什么细节。',
    doubt: '正确。指出哪几处物证与表面说法逻辑不符。',
    unsure: '说明此时已解锁的线索其实足以判断，提示玩家往哪个方向看。',
    // ── step-contradiction 选项反馈 ───────────────────────────────────────
    'point-a': '正确。说明为什么这个矛盾点最致命，引用 1-2 条证据。',
    'point-b': '先承认这个点为什么看起来重要，再说明它为什么不是核心矛盾。',
    'point-c': '先承认这个疑点确实存在，再说明为什么单独不足以推翻表面说法。',
    // ── step-evidence 选项反馈（每个选项都要有） ──────────────────────────
    'key-evidence-1': '说明该证据在推理链中扮演什么角色。',
    'key-evidence-2': '说明该证据在推理链中扮演什么角色。',
    'key-evidence-3': '说明该证据在推理链中扮演什么角色。',
    'supporting-evidence-1': '说明该辅助证据如何加强推论。',
    'decoy-evidence-1': '先承认它为什么表面合理，再解释它真正的含义是什么，以及为什么无法支持结论。',
    // ── step-conclusion 选项反馈 ──────────────────────────────────────────
    'conclusion-a': '正确。简述关键推理路径。',
    'conclusion-b': '先承认这个方向为什么看起来合理（对应红鲱鱼链），再说明它解释不了什么。',
    'conclusion-c': '先承认这个方向为什么有一定道理，再指出关键缺口。',
  },
  evidenceFeedback: {
    'key-evidence-1': '说明该证据在整个案件中的作用，以及不选它会错过什么推论。',
    'key-evidence-2': '说明该证据在整个案件中的作用。',
    'key-evidence-3': '说明该证据在整个案件中的作用。',
    'supporting-evidence-1': '说明该辅助证据如何支撑主要推论，单独不够但组合有效。',
    'decoy-evidence-1': '先承认它为什么表面合理（它支持了哪条红鲱鱼链），再解释为什么它实际上不成立。',
  },
  missingKeyEvidence: {
    // 玩家已解锁该节点但没有在断案时勾选该证据时显示
    'key-evidence-1': '说明这条证据为什么关键，玩家错过了什么推论机会。',
    'key-evidence-2': '说明这条证据为什么关键，玩家错过了什么推论机会。',
    'key-evidence-3': '说明这条证据为什么关键，玩家错过了什么推论机会。',
  },
  finalSummary: {
    excellent: '得分率≥80%：肯定玩家，简述完整推理路径（1-2句）。',
    partial: '得分率50-80%：方向正确但证据链不完整，指出缺失的关键一步（1-2句）。',
    failed: '得分率<50%：说明主要偏差来源——被哪条红鲱鱼链带偏，或哪个核心矛盾没看出来（1-2句）。',
  },
};

// ── 阅卷初判（3 个选项，不计分，仅用于复盘对比） ────────────────────────────
export const initialHypothesesXX = [
  {
    id: 'hyp-close',
    label: '与真相接近的初判（10-20 字）',
    feedback: '说明这个初判方向为什么接近，以及还缺少哪一步才能确认（30-60 字）。',
  },
  {
    id: 'hyp-surface',
    label: '相信表面说法的初判（10-20 字）',
    feedback: '说明表面说法为什么有迷惑性，哪条证据会打破它（30-60 字）。',
  },
  {
    id: 'hyp-neutral',
    label: '中性/模糊的初判（10-20 字）',
    feedback: '说明这个初判反映了什么思路，以及案情实际上比这个更复杂（30-60 字）。',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 将以上数据加入 caseExtensions（在 cases-extended.ts 底部）
// ─────────────────────────────────────────────────────────────────────────────

/*
在 caseExtensions 对象中加入以下条目：

  'XX': {
    evidenceList: evidenceListXX,
    investigationNodes: investigationNodesXX,
    deductionSteps: deductionStepsXX,
    feedback: feedbackXX,
    actionPointLimit: 10,   // 入门案 10 / 进阶案 12 / 高阶案 14，根据节点总成本微调
    initialHypotheses: initialHypothesesXX,
  },
*/
