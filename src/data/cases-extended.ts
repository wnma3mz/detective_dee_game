/**
 * 8 案精制版扩展数据
 * 包含新的调查节点、证据模型、结构化推理步骤和复盘反馈。
 *
 * 内容规范：
 * - investigationNode.result 只写客观事实，禁用"说明""证明""即栽赃""真正目标"等结论性词语
 * - deductionStep.option.label 只写中性短标签，理由放到 feedback.optionFeedback
 * - 每案至少有一条红鲱鱼链（见各案顶部注释）
 */
import type {
  CaseFeedback,
  DeductionStep,
  Evidence,
  InvestigationNode,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// 01 梁上白绫
//
// ── 红鲱鱼链：赵氏自尽 ────────────────────────────────────────────────────────
// 错误结论：赵氏情绪低落，自行上吊
// 支持它的表面证据：
//   - 旧白绫（id: old-rope）——家中常备旧物，取材方便，符合自尽预谋
//   - 板凳倒地（场景）——符合蹬翻板凳的自尽动作
// 解释不了的关键矛盾：
//   - 双脚与板凳相距过远（id: feet-distance）——距离使"蹬翻板凳"动作在物理上无法完成
// 复盘拆解：旧白绫和倒地板凳让人第一时间相信表面说法；
//   但双脚与板凳的具体距离排除了"蹬翻"这一必要动作，自尽链在物理上断了。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList01: Evidence[] = [
  {
    id: 'torn-clothes',
    title: '衣襟新破',
    content: '赵氏衣襟被撕开一道新口子，袖口皱乱，像死前与人扭打。',
    role: 'key',
    supports: ['struggle-before-death', 'not-suicide'],
  },
  {
    id: 'neck-scratch',
    title: '周二脖颈抓痕',
    content: '周二脖颈上有几道新鲜抓痕，尚未结痂。',
    role: 'key',
    supports: ['suspect-involved', 'struggle-before-death'],
  },
  {
    id: 'feet-distance',
    title: '双脚离板凳过远',
    content: '赵氏双脚离倒在地上的板凳有一段距离，难以自己蹬翻完成上吊。',
    role: 'key',
    supports: ['not-suicide', 'scene-staged'],
  },
  {
    id: 'hoe-neat',
    title: '锄头立得端正',
    content: '墙角锄头立得端正，锄尖上还有湿泥，柄上无倒落时常见的破损或泥点飞溅。',
    role: 'key',
    supports: ['scene-staged', 'suspect-had-time'],
  },
  {
    id: 'suspect-speech',
    title: '周二自相矛盾的口供',
    content: '周二一面说自己吓得魂飞魄散，一面又解释锄头是随手放好的——两者无法同时成立。',
    role: 'supporting',
    supports: ['suspect-involved'],
  },
  {
    id: 'old-rope',
    title: '白绫看似常用',
    content: '悬尸的白绫摸起来有些旧，表面磨损均匀。',
    role: 'decoy',
    misleadsTo: ['suicide'],
  },
  {
    id: 'suspect-had-time',
    title: '周二提前回家',
    content: '邻人证实周二傍晚回家时间比他声称的早了半个时辰，有充足时间布置现场。',
    role: 'key',
    supports: ['scene-staged', 'suspect-involved'],
  },
];

export const investigationNodes01: InvestigationNode[] = [
  {
    id: 'scene-body',
    type: 'scene',
    title: '查看尸身姿态',
    result: '赵氏衣襟被撕开一道新口子，袖口皱乱，像死前与人激烈扭打。双脚离倒在地上的板凳有一段距离。',
    cost: 1,
    evidenceIds: ['torn-clothes', 'feet-distance'],
  },
  {
    id: 'scene-hoe',
    type: 'scene',
    title: '查看墙角锄头',
    result: '锄头立在墙角，柄端朝内，锄尖上有湿泥未干。周围地面无拖拽或跌落痕迹。',
    cost: 1,
    evidenceIds: ['hoe-neat'],
    unlocks: ['witness-zhou-hoe'],
  },
  {
    id: 'scene-rope',
    type: 'scene',
    title: '查看梁上白绫',
    result: '白绫有些旧，磨损均匀——看起来像家中旧物，并非临时取来。',
    cost: 1,
    evidenceIds: ['old-rope'],
  },
  {
    id: 'witness-zhou',
    type: 'witness',
    title: '盘问周二发现尸体后的行动',
    result: '周二说自己一进门就吓坏了，什么也顾不上，只想着去报官。',
    cost: 1,
    unlocks: ['witness-zhou-scratch'],
  },
  {
    id: 'witness-zhou-scratch',
    type: 'witness',
    title: '追问周二脖颈抓痕来历',
    prompt: '周二脖颈上有几道新抓痕，问他从哪里来的。',
    result: '周二支吾片刻，说是赵氏前几天与他拌嘴时抓的，已经有好几天了。但伤口明显尚未结痂。',
    cost: 1,
    requires: ['witness-zhou'],
    evidenceIds: ['neck-scratch', 'suspect-speech'],
  },
  {
    id: 'witness-zhou-hoe',
    type: 'witness',
    title: '追问周二为何整理锄头',
    prompt: '锄头立得端正，问周二是怎么放的。',
    result: '周二先说"锄头是我随手放好的"，又改口说"我当时什么都顾不上了"。前后矛盾。',
    cost: 1,
    requires: ['scene-hoe'],
    evidenceIds: ['suspect-speech'],
  },
  {
    id: 'timeline',
    type: 'timeline',
    title: '核查周二回家时间',
    result: '邻人证实周二傍晚回家，时间比他声称的早了半个时辰。那段时间里无人见过赵氏外出。',
    cost: 1,
    evidenceIds: ['suspect-had-time'],
  },
];

export const deductionSteps01: DeductionStep[] = [
  {
    id: 'step-surface',
    prompt: '本案报官说法是赵氏自尽。这个表面说法可信吗？',
    type: 'single',
    options: [
      { id: 'trust', label: '可信，赵氏自尽' },
      { id: 'doubt', label: '存疑，现场有可疑之处' },
      { id: 'unsure', label: '线索不足，难以判断' },
    ],
    correctOptionIds: ['doubt'],
    maxScore: 2,
  },
  {
    id: 'step-contradiction',
    prompt: '哪一点最能推翻"赵氏自尽"的说法？',
    type: 'single',
    options: [
      { id: 'rope-old', label: '白绫是旧物' },
      { id: 'feet-far', label: '双脚与板凳相距过远' },
      { id: 'zhou-scared', label: '周二称吓坏了却整理了现场' },
    ],
    correctOptionIds: ['feet-far'],
    requiredEvidenceIds: ['feet-distance'],
    maxScore: 2,
  },
  {
    id: 'step-evidence',
    prompt: '哪些线索共同支持"现场被人布置过"这个推论？（可多选）',
    type: 'multi',
    options: [
      { id: 'torn-clothes', label: '衣襟新破' },
      { id: 'neck-scratch', label: '周二脖颈抓痕' },
      { id: 'hoe-neat', label: '锄头立得端正' },
      { id: 'old-rope', label: '白绫是旧物' },
      { id: 'suspect-speech', label: '周二口供前后矛盾' },
    ],
    correctOptionIds: ['torn-clothes', 'neck-scratch', 'hoe-neat', 'suspect-speech'],
    maxScore: 3,
  },
  {
    id: 'step-conclusion',
    prompt: '本案真相最可能是？',
    type: 'single',
    options: [
      { id: 'truth', label: '赵氏被周二勒死后，伪装成上吊' },
      { id: 'decoy-1', label: '赵氏确实自尽，周二只是慌乱中整理了现场' },
      { id: 'decoy-2', label: '外人闯入杀赵氏，周二发现后因畏罪整理了现场' },
    ],
    correctOptionIds: ['truth'],
    requiredEvidenceIds: ['torn-clothes', 'neck-scratch', 'feet-distance', 'hoe-neat'],
    maxScore: 3,
  },
];

export const feedback01: CaseFeedback = {
  optionFeedback: {
    trust: '白绫和板凳会让人先入为主地相信自尽，但衣物撕裂和双脚距离说明现场有问题。',
    doubt: '正确。多处物证与自尽动作逻辑不符。',
    unsure: '已解锁的线索足够推断，衣襟、抓痕、板凳距离三者需要放在一起看。',
    'rope-old': '白绫是旧物只说明取材方便，不能证明上吊或伪造，不是最核心的矛盾。',
    'feet-far': '正确。自尽者须蹬翻板凳，双脚离板凳过远说明该动作根本无法完成。',
    'zhou-scared': '这一点揭示了口供矛盾，但它是"周二参与布置"的证据，而非推翻自尽的核心矛盾。',
    truth: '正确。衣襟新破+抓痕+板凳距离+锄头整理，四证共同支撑这个结论。',
    'decoy-1': '周二说自己吓坏了，但锄头立得端正不像慌乱中随手放的；抓痕新鲜也无法解释。',
    'decoy-2': '外人闯入无法解释锄头被从容放好，也无法解释周二身上的新鲜抓痕。',
  },
  evidenceFeedback: {
    'torn-clothes': '关键证据。衣襟新破说明赵氏死前曾与人扭打，不像独自上吊。',
    'neck-scratch': '关键证据。新抓痕把赵氏的挣扎和周二直接联系起来。',
    'feet-distance': '关键证据。双脚离板凳过远，自尽动作在物理上无法成立。',
    'hoe-neat': '关键证据。锄头被端正立好，说明周二有时间从容布置，与"吓坏了"矛盾。',
    'suspect-speech': '辅助证据。口供前后矛盾加强了对周二的怀疑，但不能单独定案。',
    'old-rope': '误导证据。白绫是旧物只说明随手可取，自尽和伪装都可以用旧绳，无法区分。',
    'suspect-had-time': '关键证据。周二提前回家说明他有足够时间布置现场，直接推翻"吓坏了"的说法。',
  },
  missingKeyEvidence: {
    'feet-distance': '你漏掉了"双脚离板凳过远"——这是推翻自尽最直接的物理矛盾。',
    'hoe-neat': '你漏掉了"锄头立得端正"——它证明周二有时间布置现场，与口供矛盾。',
    'neck-scratch': '你漏掉了"周二脖颈抓痕"——这是把嫌疑人与挣扎现场联系起来的关键。',
  },
  finalSummary: {
    excellent: '大人明察秋毫。衣物、抓痕、板凳、锄头四证俱全，结论无误，案情大白。',
    partial: '大人方向正确，但部分关键证据未予注意，尚需补全推理链。',
    failed: '大人被表面的自尽场景所误导，需重新勘查现场，关注物证之间的逻辑关系。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 02 假使团为何进京
//
// ── 红鲱鱼链：冒领赏赐 ────────────────────────────────────────────────────────
// 错误结论：假使团进京是为了冒领贡礼赏赐
// 支持它的表面证据：
//   - 使团携带的贡礼（id: diplomatic-gift）——贡礼丰厚，财物动机成立
//   - 假使团成功入京受赏（场景事实）——说明他们拿到了赏赐
// 解释不了的关键矛盾：
//   - 留下活口继续冒险（id: survivor-risk）——为了财物不该故意留活口，反而扩大暴露风险
// 复盘拆解：贡礼丰厚+入京受赏让赏赐说非常合理；
//   但留活口、进京后继续行动这些反常行为都无法被"已拿到赏赐"解释，说明目标不在赏赐。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList02: Evidence[] = [
  {
    id: 'no-escape',
    title: '杀使团后未逃走',
    content: '凶手杀死真使团，却没有离开，而是换上使团服饰继续进京。',
    role: 'key',
    supports: ['purpose-in-capital', 'not-war-provoke'],
  },
  {
    id: 'kiln-guard',
    title: '旧窑场有禁军看守',
    content: '旧窑场平日由皇帝亲卫把守，外围设有暗哨，闲人进入须持特定凭证。',
    role: 'key',
    supports: ['kiln-is-target'],
  },
  {
    id: 'handkerchief',
    title: '废墟中的细绢手帕',
    content: '窑场废墟中找到的细绢手帕，质料与假使团刺客随身之物相同。',
    role: 'key',
    supports: ['kiln-is-target', 'same-group'],
  },
  {
    id: 'survivor-risk',
    title: '留下活口继续冒险',
    content: '若只为赏赐，凶手不该故意留活口，反而继续扩大暴露风险。',
    role: 'supporting',
    supports: ['not-reward'],
  },
  {
    id: 'war-enough',
    title: '挑衅战火无需进京',
    content: '若只想挑起边境冲突，杀死真使团就已经足够，无需冒险假冒入京。',
    role: 'supporting',
    supports: ['not-war-provoke'],
  },
  {
    id: 'diplomatic-gift',
    title: '使团携带的贡礼',
    content: '使团带来丰厚贡礼，单从财物价值而言，冒领赏赐说得通。',
    role: 'decoy',
    misleadsTo: ['reward-motive'],
  },
];

export const investigationNodes02: InvestigationNode[] = [
  {
    id: 'scene-killing',
    type: 'scene',
    title: '勘查使团被杀现场',
    result: '真使团在入境后不久遭到伏击，全部被杀。凶手行动迅速、有组织，这不像临时起意。',
    cost: 1,
    evidenceIds: ['no-escape'],
  },
  {
    id: 'scene-kiln',
    type: 'scene',
    title: '调查旧窑场火案',
    result: '旧窑场两日后被焚，废墟里出现刺客随身的细绢手帕。窑场平日由禁军看守。',
    cost: 1,
    evidenceIds: ['kiln-guard', 'handkerchief'],
    unlocks: ['evidence-kiln-value'],
  },
  {
    id: 'evidence-kiln-value',
    type: 'knowledge',
    title: '探查旧窑场的用途',
    prompt: '禁军为何要看守一座废弃窑场？',
    result: '据悉此窑场原是宫中密档存储之所，后改存其他机密物件，具体内容属最高机密。',
    cost: 1,
    requires: ['scene-kiln'],
    evidenceIds: ['kiln-guard'],
  },
  {
    id: 'motive-war',
    type: 'witness',
    title: '核查"挑起战火"说',
    result: '挑起边境冲突通常只需在边境制造流血事件，如杀死使团并栽赃对方。假使团此后却假冒身份继续进京，此举的风险远高于单纯的边境挑衅。',
    cost: 1,
    evidenceIds: ['war-enough'],
  },
  {
    id: 'motive-reward',
    type: 'witness',
    title: '核查"冒领赏赐"说',
    result: '使团贡品确实丰厚，冒领赏赐在财物层面说得通。凶手进京后拿到了赏赐，但随后并未脱身，反而继续在京城活动，行动范围也超出了接待礼仪的正常流程。',
    cost: 1,
    evidenceIds: ['survivor-risk', 'diplomatic-gift'],
    unlocks: ['motive-reward-detail'],
  },
  {
    id: 'motive-reward-detail',
    type: 'witness',
    title: '追问"冒领赏赐"的漏洞',
    prompt: '赏赐固然重要，但为何要留活口、继续冒险？',
    result: '凶手对使团成员逐一清点，唯独留下一名向导活命。这名向导的特别之处在于：他在使团职务中负责旧窑场附近地段的引路，对那一带地形极为熟悉。',
    cost: 1,
    requires: ['motive-reward'],
    evidenceIds: ['survivor-risk'],
  },
  {
    id: 'timeline',
    type: 'timeline',
    title: '核对假使团进京时间与窑场起火时间',
    result: '假使团进京的第二天，旧窑场被焚。两件事在时间上高度吻合，绝非巧合。',
    cost: 1,
    evidenceIds: ['handkerchief'],
  },
];

export const deductionSteps02: DeductionStep[] = [
  {
    id: 'step-surface',
    prompt: '朝堂上对凶手动机有三种说法，哪一种能解释最多行为？',
    type: 'single',
    options: [
      { id: 'war', label: '挑起边境战乱' },
      { id: 'reward', label: '冒领赏赐贡礼' },
      { id: 'infiltrate', label: '借身份潜入京城' },
    ],
    correctOptionIds: ['infiltrate'],
    maxScore: 2,
  },
  {
    id: 'step-contradiction',
    prompt: '以下哪一点最能排除"冒领赏赐"作为主要动机？',
    type: 'single',
    options: [
      { id: 'gift-small', label: '贡礼折算价值不高' },
      { id: 'survivor-risk', label: '留下活口扩大暴露风险' },
      { id: 'no-escape-3', label: '已入京却未立刻脱身' },
    ],
    correctOptionIds: ['survivor-risk'],
    requiredEvidenceIds: ['survivor-risk'],
    maxScore: 2,
  },
  {
    id: 'step-evidence',
    prompt: '哪些线索支持"假使团在京城另有目标"这个推论？（可多选）',
    type: 'multi',
    options: [
      { id: 'kiln-guard', label: '旧窑场由禁军看守' },
      { id: 'handkerchief', label: '刺客手帕出现在窑场废墟' },
      { id: 'timeline-match', label: '进京次日窑场即起火' },
      { id: 'diplomatic-gift', label: '使团贡礼丰厚' },
    ],
    correctOptionIds: ['kiln-guard', 'handkerchief', 'timeline-match'],
    maxScore: 3,
  },
  {
    id: 'step-conclusion',
    prompt: '本案最合理的结论是？',
    type: 'single',
    options: [
      { id: 'truth', label: '借身份入京，目标是旧窑场' },
      { id: 'decoy-1', label: '以挑起战乱为主，进京只是顺势' },
      { id: 'decoy-2', label: '以冒领赏赐为主，窑场属意外' },
    ],
    correctOptionIds: ['truth'],
    requiredEvidenceIds: ['kiln-guard', 'handkerchief'],
    maxScore: 3,
  },
];

export const feedback02: CaseFeedback = {
  optionFeedback: {
    war: '挑起战乱只需杀使团、制造边境冲突即可，假冒身份进京这一步对战乱目标没有任何帮助，反而增加暴露风险。',
    reward: '冒领赏赐能解释进京，也能解释使团身份。但进京后继续行动、故意留活口这些行为都无法被"已拿到赏赐"解释。',
    infiltrate: '正确。借使团身份进京是唯一能同时解释进京行为、留活口、窑场行动三件事的动机。',
    'gift-small': '贡礼价值是否够高是主观判断，不如"留活口却继续冒险"这个逻辑矛盾更直接。',
    'survivor-risk': '正确。为了钱不该这样冒险，说明目的不在赏赐。',
    'no-escape-3': '不逃走有多种解释（还有后续任务、出城被封），不如"留活口"矛盾更尖锐。',
    'timeline-match': '正确。假使团进京次日窑场即起火，时间高度吻合，说明进京就是为了窑场。',
    'diplomatic-gift': '贡礼的存在支持赏赐动机，但无法解释后续连续冒险，它是误导线索。',
    truth: '正确。三条证据——禁军守窑、手帕指向、时间吻合——共同支撑这个结论。',
    'decoy-1': '挑起战火无需进京，凶手冒险假冒使团的动作说明目标在京城内部。',
    'decoy-2': '窑场火案与假使团进京在时间上高度吻合，且手帕直接指向同一伙人，不是巧合。',
  },
  evidenceFeedback: {
    'no-escape': '关键证据。不逃走说明凶手在京城还有未完成的目标。',
    'kiln-guard': '关键证据。禁军看守说明窑场有特殊价值，是合理的目标。',
    handkerchief: '关键证据。手帕把假使团与窑场火案串联成同一伙人。',
    'survivor-risk': '辅助证据。留活口的反常行为暗示这个人有其他用途（熟悉地形）。',
    'war-enough': '辅助证据。直接证伪"挑起战火"说。',
    'diplomatic-gift': '误导证据。贡礼确实存在，但不能解释后续行为链，容易让人止步于"赏赐"动机。',
  },
  missingKeyEvidence: {
    'kiln-guard': '你漏掉了"旧窑场有禁军看守"——这是判断窑场值得冒险闯入的核心依据。',
    handkerchief: '你漏掉了"废墟中的细绢手帕"——这是把假使团和窑场火案连成同一案件的直接证据。',
  },
  finalSummary: {
    excellent: '大人逻辑缜密，三种动机逐一排查，直指窑场才是真正目标。',
    partial: '大人方向正确，但部分动机排除链还不够完整，建议追查窑场线索。',
    failed: '大人被表面动机所误导，需重新梳理凶手进京后的行动与窑场火案之间的关系。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 09 低垂的双手
//
// ── 红鲱鱼链：孙喜旺直接行凶 ────────────────────────────────────────────────
// 错误结论：孙喜旺是左撇子，左手血印铁证其罪，直接定案
// 支持它的表面证据：
//   - 孙喜旺是左撇子（id: left-handed）——与外圈左手血印高度吻合
//   - 孙喜旺在场（场景）——案发时他就在院子里
// 解释不了的关键矛盾：
//   - 严氏双手低垂（id: hands-low）——正面遇刺时没有防御反应，说明遇刺时处于黑暗中
// 复盘拆解：左手血印+左撇子让指控看起来铁证如山；
//   但严氏没有防御反应这一点说明她看不见攻击，配合风灯不可能自然熄灭，
//   推出黑暗是预谋制造的，真凶需要把孙喜旺的手按在剪刀上才能形成外圈血印。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList09: Evidence[] = [
  {
    id: 'hands-low',
    title: '严氏双手低垂',
    content: '严氏双手低垂，手上没有防御伤口和血迹。正面遇刺时，正常人会本能抬手抵挡。',
    role: 'key',
    supports: ['attacked-in-dark', 'could-not-see'],
  },
  {
    id: 'lamp-proof',
    title: '风灯不可能自然熄灭',
    content: '气死风风灯远离门窗，灯罩厚实，正常情况下不会自然熄灭。黑暗是人为制造的。',
    role: 'key',
    supports: ['dark-was-planned', 'third-party'],
  },
  {
    id: 'scissors-grip',
    title: '剪刀外圈握法无法发力',
    content: '剪刀外圈的握法极难对刺杀发力，正常刺杀应握内圈或刀柄位置。',
    role: 'key',
    supports: ['blood-print-planted', 'not-natural-grip'],
  },
  {
    id: 'blood-outer',
    title: '外圈血印位置可疑',
    content: '剪刀外圈有左手血印，内圈也有血。若是主动行凶，血印应在握持时自然形成的位置，而非外圈。',
    role: 'key',
    supports: ['blood-print-planted'],
  },
  {
    id: 'left-handed',
    title: '孙喜旺是左撇子',
    content: '孙喜旺习惯用左手，外圈血印是左手的，表面上与孙喜旺行凶高度吻合。',
    role: 'decoy',
    misleadsTo: ['sun-guilty'],
  },
  {
    id: 'lamp-went-out',
    title: '案发时灯突然熄灭',
    content: '案发前屋内有灯，案发时灯突然熄灭，之后才发现严氏遇害。',
    role: 'supporting',
    supports: ['dark-was-planned'],
  },
];

export const investigationNodes09: InvestigationNode[] = [
  {
    id: 'scene-body',
    type: 'scene',
    title: '查看严氏倒下姿态',
    result: '严氏双手低垂，贴着身侧倒地。手掌和手腕上没有任何防御伤口，也没有血迹。',
    cost: 1,
    evidenceIds: ['hands-low'],
    unlocks: ['deduce-no-defense'],
  },
  {
    id: 'scene-scissors',
    type: 'scene',
    title: '检查凶器剪刀',
    result: '剪刀内圈有血，外圈也有一个清晰的左手血印。握外圈的姿势非常别扭，很难对刺杀发力。',
    cost: 1,
    evidenceIds: ['scissors-grip', 'blood-outer'],
    unlocks: ['deduce-grip'],
  },
  {
    id: 'scene-lamp',
    type: 'scene',
    title: '检查风灯位置',
    result: '风灯放在靠里的桌上，灯罩厚实，远离所有门窗。这种气死风在无人干预下不会自然熄灭。',
    cost: 1,
    evidenceIds: ['lamp-proof', 'lamp-went-out'],
    unlocks: ['deduce-lamp'],
  },
  {
    id: 'witness-sun',
    type: 'witness',
    title: '盘问孙喜旺当时在做什么',
    result: '孙喜旺说自己在院子里，听见屋里动静后才进去。他承认自己是左撇子，但否认杀妻。',
    cost: 1,
    evidenceIds: ['left-handed'],
  },
  {
    id: 'deduce-no-defense',
    type: 'knowledge',
    title: '分析严氏为何没有防御动作',
    prompt: '正面遇刺时，正常人为什么会本能抬手？',
    result: '人在光线正常的情况下遇到正面攻击，本能反应是抬手格挡。严氏双手低垂、无防御伤，有两种可能：其一，她没有意识到危险（如从背后或在黑暗中遇袭）；其二，攻击速度极快以至来不及反应。两者需要结合风灯线索进一步判断。',
    cost: 1,
    requires: ['scene-body'],
    evidenceIds: ['hands-low'],
  },
  {
    id: 'deduce-grip',
    type: 'knowledge',
    title: '分析血印位置的含义',
    prompt: '外圈握法无法有效发力，那血印是什么时候留下的？',
    result: '以外圈握法刺杀，手腕发力角度受限，通常难以造成致命伤；正常持剪刺击的握持位置在内圈或刀柄附近。外圈血印边缘完整、边界清晰，形态上与持续握持摩擦产生的血痕不同。两种解读：一、行凶者握法异常；二、血印是在刃停止运动后由外力按压形成的。',
    cost: 1,
    requires: ['scene-scissors'],
    evidenceIds: ['blood-outer', 'scissors-grip'],
  },
  {
    id: 'deduce-lamp',
    type: 'knowledge',
    title: '分析灯为何在案发时熄灭',
    prompt: '风灯不可能自然熄灭，那是谁把它弄灭的，目的是什么？',
    result: '气死风的设计就是为了在有风的环境中保持燃烧。此灯位置远离门窗，灯罩完整，无风、无油尽的情形下灯自行熄灭只有两种情况：灯芯被浸水，或被人从外部遮盖。案发前屋内有人，案发时灯突然熄灭。',
    cost: 1,
    requires: ['scene-lamp'],
    evidenceIds: ['lamp-proof'],
  },
];

export const deductionSteps09: DeductionStep[] = [
  {
    id: 'step-surface',
    prompt: '现有物证（孙喜旺是左撇子 + 剪刀外圈左手血印）是否足以直接定孙喜旺为凶手？',
    type: 'single',
    options: [
      { id: 'yes-guilty', label: '足够，物证直接指向孙喜旺' },
      { id: 'no-doubt', label: '不够，物证存在疑点' },
      { id: 'maybe', label: '有一定说服力，但不能定案' },
    ],
    correctOptionIds: ['no-doubt'],
    maxScore: 2,
  },
  {
    id: 'step-contradiction',
    prompt: '以下哪一点最能动摇"孙喜旺主动行凶"的判断？',
    type: 'single',
    options: [
      { id: 'left-hand', label: '血印是左手的，但孙喜旺否认犯案' },
      { id: 'hands-low', label: '严氏双手低垂，遇刺前没有防御反应' },
      { id: 'lamp-natural', label: '风灯熄灭时间点异常' },
    ],
    correctOptionIds: ['hands-low'],
    requiredEvidenceIds: ['hands-low'],
    maxScore: 2,
  },
  {
    id: 'step-evidence',
    prompt: '哪些线索共同支持"孙喜旺可能被栽赃"这个推论？（可多选）',
    type: 'multi',
    options: [
      { id: 'hands-low', label: '严氏双手低垂无防御伤' },
      { id: 'lamp-proof', label: '风灯不可能自然熄灭' },
      { id: 'scissors-grip', label: '外圈握法无法有效发力' },
      { id: 'blood-outer', label: '血印在外圈位置' },
      { id: 'left-handed', label: '孙喜旺是左撇子' },
    ],
    correctOptionIds: ['hands-low', 'lamp-proof', 'scissors-grip', 'blood-outer'],
    maxScore: 3,
  },
  {
    id: 'step-conclusion',
    prompt: '本案最合理的判断是？',
    type: 'single',
    options: [
      { id: 'truth', label: '孙喜旺被嫁祸，真凶另有其人' },
      { id: 'decoy-1', label: '孙喜旺直接行凶，握法和血印是操作问题' },
      { id: 'decoy-2', label: '外人潜入，孙喜旺和物证均属巧合' },
    ],
    correctOptionIds: ['truth'],
    requiredEvidenceIds: ['hands-low', 'lamp-proof', 'blood-outer'],
    maxScore: 3,
  },
];

export const feedback09: CaseFeedback = {
  optionFeedback: {
    'yes-guilty': '左手血印确实指向孙喜旺，但外圈握法无法发力、严氏无防御反应这两点都说明"主动行凶"的逻辑链不完整。',
    'no-doubt': '正确。物证有问题，不能直接定案。',
    maybe: '方向对了，但还需要具体指出哪些疑点，才能建立完整的反驳。',
    'left-hand': '孙喜旺否认不是证据，凶手当然会否认。需要找物证层面的矛盾。',
    'hands-low': '正确。正面遇刺时没有防御反应，说明严氏当时看不见攻击，极可能是在黑暗中。',
    'lamp-natural': '灯灭是重要证据，但它更多揭示了"黑暗是人为的"，需要与双手低垂结合才能推论出完整过程。',
    truth: '正确。黑暗、无防御、外圈血印三点共同支撑栽赃假说。',
    'decoy-1': '如果只是不熟练，血印应该在握持时自然形成，而不是在最不适合发力的位置——这是刻意按上去的特征。',
    'decoy-2': '外人潜入无法解释为什么血印偏偏是孙喜旺的手型，更合理的解释是真凶控制了孙喜旺的手。',
  },
  evidenceFeedback: {
    'hands-low': '关键证据。无防御反应直接推导出"遇刺时处于黑暗"。',
    'lamp-proof': '关键证据。风灯不会自然灭，说明黑暗是预谋的。',
    'scissors-grip': '关键证据。外圈握法无法有效发力，血印不是行凶时自然形成的。',
    'blood-outer': '关键证据。与scissors-grip一起，说明血印是事后被按上去的。',
    'left-handed': '误导证据。左手血印表面上指向孙喜旺，但没有考虑血印的形成方式。',
    'lamp-went-out': '辅助证据。灯灭支持"黑暗是人为"的判断，与lamp-proof配合使用。',
  },
  missingKeyEvidence: {
    'hands-low': '你漏掉了"严氏双手低垂"——这是推断"遇刺时处于黑暗"最直接的物理依据。',
    'lamp-proof': '你漏掉了"风灯不可能自然熄灭"——这证明黑暗是有人预谋制造的。',
    'blood-outer': '你漏掉了"外圈血印位置可疑"——结合握法分析，这是血印系栽赃的核心证据。',
  },
  finalSummary: {
    excellent: '大人见微知著，从双手低垂和灯灭时机推出栽赃全貌，推理严密。',
    partial: '大人方向正确，但推理链尚未完整——需要把"黑暗→无防御→外圈血印"三点联动说清楚。',
    failed: '大人被左手血印误导，需要重新审视：物证不只看属于谁，还要看它出现在什么位置。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 04 闭城后的车辙
//
// ── 红鲱鱼链：日间杀案 ────────────────────────────────────────────────────────
// 错误结论：案发在日间，伤口新旧说明昨日作案
// 支持它的表面证据：
//   - 尸身伤口较新（id: fresh-wound）——"不超过一夜"可被理解为日间也行
//   - 官道日间繁忙（背景）——凶手可趁混乱作案
// 解释不了的关键矛盾：
//   - 死者车辙最新且案发后无新车覆盖（id: rut-on-top + no-new-rut）——日间繁忙则车辙早被覆盖，无法保留到发现时仍最清晰
// 复盘拆解：伤口新旧让人先想到"昨天"，日间混乱也是合理作案时机；
//   但官道白日车来车往，死者车辙不可能在日间保持"最新最清晰"不被覆盖，这条链在物证上断了。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList04: Evidence[] = [
  {
    id: 'rut-on-top',
    title: '死者车辙压旧辙',
    content: '死者马车的车辙叠压在更早的旧车辙之上；旧辙边缘已有风化，新辙边缘清晰完整。',
    role: 'key',
    supports: ['time-window', 'night-travel'],
  },
  {
    id: 'no-new-rut',
    title: '案发后无新车辙',
    content: '从案发处到城门口这段路面，除死者车辙外，未见任何覆盖其上的新辙痕。',
    role: 'key',
    supports: ['time-window', 'road-empty'],
  },
  {
    id: 'gate-hours',
    title: '城门丑末关辰时开',
    content: '神都城门丑末（约凌晨1-2时）关闭，辰时（约7-9时）开启。',
    role: 'key',
    supports: ['night-travel', 'abnormal-timing'],
  },
  {
    id: 'heading-city',
    title: '死者仍朝神都方向赶',
    content: '死者已知城门关闭时段，却仍往神都方向行进，行为本身高度反常。',
    role: 'key',
    supports: ['special-identity', 'abnormal-timing'],
  },
  {
    id: 'large-hoofprint',
    title: '异常巨大的蹄印',
    content: '现场旁边有一排格外巨大的蹄印，不像寻常驿马或拉车马所留。',
    role: 'supporting',
    supports: ['special-identity'],
  },
  {
    id: 'daytime-busy',
    title: '官道白日车马繁忙',
    content: '官道日间人来人往，车辙持续被覆盖。只有夜间闭城后，才会出现长时间无车的空窗期。',
    role: 'context',
    supports: ['time-window'],
  },
  {
    id: 'fresh-wound',
    title: '尸身伤口较新',
    content: '死者伤口未见明显腐化，判断死亡时间不超过一夜。',
    role: 'decoy',
    misleadsTo: ['daytime-murder'],
  },
];

export const investigationNodes04: InvestigationNode[] = [
  {
    id: 'scene-rut',
    type: 'scene',
    title: '查看路面车辙覆盖关系',
    result: '死者马车的车辙最新、最清晰，压在数道旧辙之上。案发到报案之间，路面没有留下新车辙。',
    cost: 1,
    evidenceIds: ['rut-on-top', 'no-new-rut'],
    unlocks: ['deduce-time-window'],
  },
  {
    id: 'scene-hoofprint',
    type: 'scene',
    title: '检查周边蹄印',
    result: '案发地周边有一排蹄印，蹄形异常宽大，远超普通驿马，且步幅均匀，像是有备而来的坐骑。',
    cost: 1,
    evidenceIds: ['large-hoofprint'],
  },
  {
    id: 'knowledge-gate',
    type: 'knowledge',
    title: '核查神都城门开闭时间',
    result: '城门丑末（约凌晨两时）关闭，辰时（约早七时）开启。闭城后普通百姓无法入城，也不允许在官道停留。',
    cost: 1,
    evidenceIds: ['gate-hours', 'daytime-busy'],
    unlocks: ['witness-direction'],
  },
  {
    id: 'witness-direction',
    type: 'witness',
    title: '询问报案人：死者行进方向',
    result: '报案人见到死者时，其马车正朝神都城门方向行进。死者一定知道城门已关，却仍然朝那个方向走。',
    cost: 1,
    requires: ['knowledge-gate'],
    evidenceIds: ['heading-city'],
    unlocks: ['deduce-identity'],
  },
  {
    id: 'scene-body',
    type: 'scene',
    title: '查看尸身状况',
    result: '死者伤口利器所致，无挣扎痕迹，倒毙于车旁。伤口较新，判断死亡时间不超过一夜，但无法确定具体时辰。',
    cost: 1,
    evidenceIds: ['fresh-wound'],
  },
  {
    id: 'deduce-time-window',
    type: 'timeline',
    title: '推算路面空窗期',
    result: '官道白日繁忙，车辙持续被覆盖。死者车辙未被覆盖，且案发后也无新车辙——只有闭城后的寅卯时分（约凌晨3-5时），官道才会长时间无车。',
    cost: 1,
    requires: ['scene-rut'],
    evidenceIds: ['daytime-busy', 'no-new-rut'],
  },
  {
    id: 'deduce-identity',
    type: 'witness',
    title: '追问：何人敢在闭城后赶路',
    result: '普通百姓闭城后不赶路，除非有特殊通行凭证或紧急任务。死者朝城门赶路，极可能是持有夜行牌的官差或密探。',
    cost: 1,
    requires: ['witness-direction'],
    evidenceIds: ['heading-city'],
  },
];

export const deductionSteps04: DeductionStep[] = [
  {
    id: 'step-time',
    prompt: '根据车辙覆盖关系和城门开闭时间，案发最可能发生在哪个时段？',
    type: 'single',
    options: [
      { id: 'daytime', label: '日间（巳时至戌时）' },
      { id: 'nightfall', label: '傍晚闭城前后（亥时至丑时）' },
      { id: 'yin-mao', label: '寅卯时分（约凌晨三至五时）' },
    ],
    correctOptionIds: ['yin-mao'],
    requiredEvidenceIds: ['rut-on-top', 'no-new-rut', 'gate-hours'],
    maxScore: 3,
  },
  {
    id: 'step-logic',
    prompt: '推断案发时间的关键逻辑链是什么？',
    type: 'multi',
    options: [
      { id: 'rut-newer', label: '死者车辙压在旧辙之上' },
      { id: 'no-cover', label: '案发后无新车辙覆盖' },
      { id: 'day-busy', label: '官道白日车马繁忙' },
      { id: 'wound-age', label: '尸身伤口新旧程度' },
    ],
    correctOptionIds: ['rut-newer', 'no-cover', 'day-busy'],
    requiredEvidenceIds: ['rut-on-top', 'no-new-rut', 'daytime-busy'],
    maxScore: 2,
  },
  {
    id: 'step-abnormal',
    prompt: '死者在闭城后仍往神都方向赶，最合理的解释是什么？',
    type: 'single',
    options: [
      { id: 'lost', label: '死者不知道城门已关，方向走错' },
      { id: 'special-id', label: '死者持有夜行凭证，有特殊身份或紧急使命' },
      { id: 'forced', label: '死者被人劫持，被迫往前走' },
    ],
    correctOptionIds: ['special-id'],
    requiredEvidenceIds: ['heading-city', 'gate-hours'],
    maxScore: 2,
  },
  {
    id: 'step-conclusion',
    prompt: '综合以上推断，对本案最准确的定性是？',
    type: 'single',
    options: [
      { id: 'correct', label: '寅卯时分预谋伏击，死者有特殊身份' },
      { id: 'wrong-1', label: '日间作案，凶手趁混乱' },
      { id: 'wrong-2', label: '死者迷路，意外遭遇路匪' },
    ],
    correctOptionIds: ['correct'],
    requiredEvidenceIds: ['rut-on-top', 'no-new-rut', 'gate-hours', 'heading-city'],
    maxScore: 3,
  },
];

export const feedback04: CaseFeedback = {
  optionFeedback: {
    'daytime': '日间官道繁忙，车辙很快会被覆盖，死者车辙不可能保留到报案时仍最清晰。',
    'nightfall': '傍晚闭城前仍有人流，无法解释死者车辙未被覆盖这一事实。',
    'yin-mao': '正确。只有官道真正安静的深夜空窗期，才能同时解释"最新车辙未被覆盖"和"此后无车经过"。',
    'rut-newer': '正确。这是推断顺序的第一步。',
    'no-cover': '正确。这是推断顺序的第二步，两步合并才能锁定时间。',
    'day-busy': '正确。有了这个背景知识，才能理解为什么空窗期必然是夜间。',
    'wound-age': '伤口新旧只能说明"不超过一夜"，无法精确到时辰，是辅助排除信息，不是核心逻辑链。',
    'lost': '闭城是公开制度，不是秘密消息，正常人不会不知道。',
    'special-id': '正确。持有夜行牌或奉令赶路，才能解释闭城后仍朝城门方向走。',
    'forced': '被迫行进通常有挣扎痕迹，且方向也不一定由死者决定，此推论缺乏物证支持。',
    'correct': '正确。路线时间推理的完整闭环：车辙锁定时间，行进方向揭示身份，两条线索共同指向预谋伏击。',
    'wrong-1': '日间论无法解释车辙未被覆盖的物证。',
    'wrong-2': '迷路不能解释死者朝正确（城门）方向走，且大型蹄印暗示有备而来的凶手。',
  },
  evidenceFeedback: {
    'rut-on-top': '关键证据。车辙叠压关系是判断路面时间顺序的核心物证。',
    'no-new-rut': '关键证据。与"叠压关系"合用，才能锁定时间段。',
    'gate-hours': '关键证据。城门制度是整条时间推理链的背景知识。',
    'heading-city': '关键证据。反常行为是推断死者特殊身份的唯一依据。',
    'large-hoofprint': '辅助证据。暗示凶手有准备，但不足以单独定案。',
    'daytime-busy': '背景信息。解释了为什么车辙未被覆盖等于夜间作案。',
    'fresh-wound': '误导证据。"不超过一夜"无法精确到时辰，容易让人以为日间也可能。',
  },
  missingKeyEvidence: {
    'rut-on-top': '你漏掉了"死者车辙压旧辙"——这是判断时间顺序的起点。',
    'no-new-rut': '你漏掉了"案发后无新车辙"——这是锁定时间段的另一半。',
    'gate-hours': '你漏掉了"城门丑末关辰时开"——没有这个背景知识，无法理解空窗期的含义。',
    'heading-city': '你漏掉了"死者仍朝神都方向赶"——这是推断死者特殊身份的关键反常。',
  },
  finalSummary: {
    excellent: '大人思路清晰：先用车辙锁定时间，再用行进方向锁定身份，路线时间推理做到了位。',
    partial: '大人抓住了时间线，但死者为何在闭城后仍赶路这一点还没有完整解释。',
    failed: '大人被伤口新旧等表面信息带偏，需要重新以车辙覆盖关系为起点重建推理链。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 07 客栈门栓
//
// ── 红鲱鱼链：机关或暗道入侵 ────────────────────────────────────────────────
// 错误结论：客栈有隐藏机关（屋顶、地板、暗道），凶手秘密进入
// 支持它的表面证据：
//   - 二人昨日才入住（id: late-arrival）——陌生地点有隐藏机关的可能
//   - 两壮汉同时被精准杀死（id: two-victims）——武艺极高才能做到
// 解释不了的关键矛盾：
//   - 两人倒在门前（id: bodies-at-door）——若凶手从机关进入，两人不必走到门边
// 复盘拆解：密室第一反应是机关，两壮汉被瞬间杀死也支持"超强刺客"形象；
//   但两人倒在门前这一位置细节说明他们走向了门口，而不是被突袭于原地，机关说无法解释此细节。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList07: Evidence[] = [
  {
    id: 'bolt-intact',
    title: '门栓完好无损',
    content: '房门门栓从内侧插好，没有被撬开或破坏的痕迹，与报案时状态一致。',
    role: 'key',
    supports: ['no-forced-entry', 'victim-opened'],
  },
  {
    id: 'window-dust',
    title: '窗台积灰未动',
    content: '窗台上的积灰均匀覆盖，灰面平整，窗框与窗沿之间的细灰层未见破损或位移。',
    role: 'key',
    supports: ['no-forced-entry'],
  },
  {
    id: 'bodies-at-door',
    title: '两人倒在门前',
    content: '两名死者倒在距门约一步处，床铺和桌椅均保持原位，床上被褥未被翻动。',
    role: 'key',
    supports: ['victim-opened', 'door-approach'],
  },
  {
    id: 'clean-cut',
    title: '咽喉单刀致命伤',
    content: '两人咽喉各只有一道细致的致命伤，无其他防御伤，出手极为精准。',
    role: 'key',
    supports: ['professional-killer', 'no-struggle'],
  },
  {
    id: 'no-noise',
    title: '隔壁未听见外人进店',
    content: '隔壁住客表示夜间没有听到外人踏入的声响，只听见一声极短的异响后恢复安静。',
    role: 'supporting',
    supports: ['familiar-person', 'no-struggle'],
  },
  {
    id: 'no-fight',
    title: '屋内无打斗痕迹',
    content: '家具摆放整齐，地面无血迹飞溅，茶碗未打翻，两人身上也无抓痕或瘀伤等防御痕迹。',
    role: 'supporting',
    supports: ['no-struggle', 'familiar-person'],
  },
  {
    id: 'two-victims',
    title: '两名壮汉同时被杀',
    content: '死者均为身形健壮的成年男子，伤口各只有一道，位置相近，两处致命伤的深度和角度接近。',
    role: 'context',
    supports: ['professional-killer', 'familiar-person'],
  },
  {
    id: 'late-arrival',
    title: '二人昨日傍晚才入住',
    content: '掌柜记录二人昨日傍晚投宿，在此只住了一晚，熟人知道他们在此的可能性不高。',
    role: 'decoy',
    misleadsTo: ['stranger-killer'],
  },
];

export const investigationNodes07: InvestigationNode[] = [
  {
    id: 'scene-door',
    type: 'scene',
    title: '检查门栓与门框',
    result: '门栓从内侧插着，门框和门板没有被撬开或撞击的痕迹。',
    cost: 1,
    evidenceIds: ['bolt-intact'],
    unlocks: ['deduce-entry'],
  },
  {
    id: 'scene-window',
    type: 'scene',
    title: '检查窗台积灰',
    result: '窗台上的灰尘均匀覆盖，没有任何开启痕迹或手印。',
    cost: 1,
    evidenceIds: ['window-dust'],
  },
  {
    id: 'scene-bodies',
    type: 'scene',
    title: '查看死者倒地位置',
    result: '两人都倒在靠近房门的位置，而非床铺、椅子旁边。咽喉各一道细口，无其他伤。',
    cost: 1,
    evidenceIds: ['bodies-at-door', 'clean-cut', 'no-fight'],
    unlocks: ['witness-noise'],
  },
  {
    id: 'witness-noise',
    type: 'witness',
    title: '询问隔壁住客',
    result: '隔壁客人说只听到一声极短的异响，之后再无动静。没有脚步声、求救声或打斗声。',
    cost: 1,
    requires: ['scene-bodies'],
    evidenceIds: ['no-noise'],
  },
  {
    id: 'witness-innkeeper',
    type: 'witness',
    title: '询问掌柜昨夜动静',
    result: '掌柜说昨夜无异状，没有陌生人问起这两名客人，也无人深夜到前台。两人是昨日傍晚新来的。',
    cost: 1,
    evidenceIds: ['late-arrival'],
    unlocks: ['deduce-identity'],
  },
  {
    id: 'deduce-entry',
    type: 'evidence',
    title: '分析进入方式',
    result: '门无撬痕，窗台无手印，门栓仍从内侧插好。两人倒在门附近而非床铺旁。进入方式上，目前可以排除强行破门和翻窗两种可能；剩余的进入路径都需要门在案发时处于开启状态。',
    cost: 1,
    requires: ['scene-door'],
    evidenceIds: ['bolt-intact', 'bodies-at-door'],
  },
  {
    id: 'deduce-identity',
    type: 'witness',
    title: '追问：谁能让两名壮汉主动开门',
    result: '两名壮汉在夜间毫无防备地走到门边开门，说明来者是他们不设防的人：可能是同行者、店内伙计，或伪装成掌柜前来送水的人。',
    cost: 1,
    requires: ['witness-innkeeper'],
    evidenceIds: ['two-victims'],
  },
];

export const deductionSteps07: DeductionStep[] = [
  {
    id: 'step-entry',
    prompt: '门窗均完好，凶手最可能是如何进入房间的？',
    type: 'single',
    options: [
      { id: 'broke-in', label: '强行破门或翻窗，事后恢复' },
      { id: 'victim-open', label: '死者主动开门迎入' },
      { id: 'hidden-inside', label: '凶手事先藏在房内' },
    ],
    correctOptionIds: ['victim-open'],
    requiredEvidenceIds: ['bolt-intact', 'window-dust', 'bodies-at-door'],
    maxScore: 3,
  },
  {
    id: 'step-evidence',
    prompt: '哪些证据共同支撑"死者主动开门"这一推断？',
    type: 'multi',
    options: [
      { id: 'e-bolt', label: '门栓完好无损' },
      { id: 'e-window', label: '窗台积灰未动' },
      { id: 'e-bodies', label: '两人倒在门前' },
      { id: 'e-arrival', label: '二人昨日才入住' },
    ],
    correctOptionIds: ['e-bolt', 'e-window', 'e-bodies'],
    requiredEvidenceIds: ['bolt-intact', 'window-dust', 'bodies-at-door'],
    maxScore: 2,
  },
  {
    id: 'step-killer',
    prompt: '凶手能让两名壮汉毫无防备地走到门边，最可能是什么人？',
    type: 'single',
    options: [
      { id: 'stranger', label: '陌生路匪，深夜强攻' },
      { id: 'familiar', label: '死者熟悉或不设防的人' },
      { id: 'assassin', label: '武艺极高的刺客' },
    ],
    correctOptionIds: ['familiar'],
    requiredEvidenceIds: ['no-noise', 'clean-cut', 'no-fight'],
    maxScore: 2,
  },
  {
    id: 'step-conclusion',
    prompt: '本案最准确的定性是？',
    type: 'single',
    options: [
      { id: 'correct', label: '死者开门迎接，凶手是不设防之人' },
      { id: 'wrong-1', label: '凶手经屋顶或地道秘密入室' },
      { id: 'wrong-2', label: '掌柜趁机行凶' },
    ],
    correctOptionIds: ['correct'],
    requiredEvidenceIds: ['bolt-intact', 'bodies-at-door', 'clean-cut', 'no-fight'],
    maxScore: 3,
  },
];

export const feedback07: CaseFeedback = {
  optionFeedback: {
    'broke-in': '门窗均无破坏痕迹，恢复原状的说法缺乏物证支持，过度推测。',
    'victim-open': '正确。门栓完好+两人倒在门边，两条证据合用才能得出这个结论。',
    'hidden-inside': '事先藏人需要掌柜配合，且被发现风险极高；屋内无打斗也不支持伏击。',
    'e-bolt': '正确。门栓完好是排除硬闯的直接物证。',
    'e-window': '正确。窗台积灰是排除翻窗的直接物证。',
    'e-bodies': '正确。倒在门前说明死者主动靠近了门。',
    'e-arrival': '昨日才入住是背景信息，不能直接支撑"死者开门"这个推断。',
    'stranger': '完全陌生的人在深夜敲门，壮汉不会毫无防备地开门。',
    'familiar': '正确。无打斗、无求救声、两人倒在门前——都指向死者对来者没有戒心。',
    'assassin': '武艺再高，强行突破门栓也会留痕迹，现场物证不支持此说。',
    'correct': '正确。密室推理的核心不是机关，而是"谁能让人主动开门"。',
    'wrong-1': '屋顶和地下通道的说法没有任何物证支持。',
    'wrong-2': '掌柜是合理怀疑对象，但没有直接证据，且掌柜动机也未交代。',
  },
  evidenceFeedback: {
    'bolt-intact': '关键证据。排除硬闯的核心物证，也是推断凶手身份的起点。',
    'window-dust': '关键证据。与门栓合用，彻底封堵"外来硬闯"的可能。',
    'bodies-at-door': '关键证据。死者走到门边这一事实，说明他们主动迎接来者。',
    'clean-cut': '关键证据。单刀精准，无防御伤，说明凶手出手极快且死者毫无防备。',
    'no-noise': '辅助证据。隔壁没有听到打斗声，印证了死者不设防的状态。',
    'no-fight': '辅助证据。室内整洁印证了死者没来得及反抗。',
    'two-victims': '背景信息。两名壮汉同时被杀，说明凶手要么武艺极高，要么死者完全不设防。',
    'late-arrival': '误导证据。入住时间短容易让人以为凶手是随机路匪，但无法解释无打斗和开门问题。',
  },
  missingKeyEvidence: {
    'bolt-intact': '你漏掉了"门栓完好无损"——没有这个证据，无法排除硬闯说。',
    'bodies-at-door': '你漏掉了"两人倒在门前"——死者的位置是推断他们主动开门的关键。',
    'clean-cut': '你漏掉了"咽喉单刀致命伤"——精准单刀才能说明死者完全未加防备。',
  },
  finalSummary: {
    excellent: '大人逻辑严密：门窗排除硬闯，尸体位置推断开门，无声无打斗锁定熟人，密室推理完整闭环。',
    partial: '大人找到了密室的关键，但"谁能让壮汉开门"这一步推断还不够完整。',
    failed: '大人被"密室必有机关"的思路带偏，需要重新从"凶手如何进来"和"死者为何开门"两个问题重建推理。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 13 夜来的假钦差
//
// ── 红鲱鱼链：真钦差，下属出错 ──────────────────────────────────────────────
// 错误结论：钦差是真的，只是执行人员出了差错（借了外卫制服、籍贯登记有误）
// 支持它的表面证据：
//   - 诏书内容合情合理（id: edict-content）——内容无破绽，说明对方了解朝局
//   - 来人知晓宫中事务细节（隐含场景）——不像完全的外行
// 解释不了的关键矛盾：
//   - 皇帝不知老臣在此（id: emperor-unaware）——若是真圣旨，皇帝不知行踪则圣旨无从发出
// 复盘拆解：诏书内容合理+对宫廷熟悉让人相信可能是真钦差；
//   但行踪未公开这一前提在逻辑上斩断了"真圣旨"的可能——诏书的来源比内容更重要。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList13: Evidence[] = [
  {
    id: 'wrong-boots',
    title: '服靴不合千牛卫制度',
    content: '来人所穿靴子与千牛卫标准制式不符，靴尖样式属于外卫而非内卫规制。',
    role: 'key',
    supports: ['fake-identity', 'uniform-error'],
  },
  {
    id: 'accent-mismatch',
    title: '口音与籍贯矛盾',
    content: '自称关中籍贯，口音却带有明显的河东腔调，两者无法同时成立。',
    role: 'key',
    supports: ['fake-identity', 'identity-inconsistent'],
  },
  {
    id: 'emperor-unaware',
    title: '皇帝不知老臣在此',
    content: '老臣此次途径绛帐并非公开行程，皇帝并不知晓其具体位置。',
    role: 'key',
    supports: ['impossible-edict', 'information-leak'],
  },
  {
    id: 'edict-arrived',
    title: '诏书却准确送到馆驿',
    content: '老臣此次行程未通报朝廷，所经馆驿均为临时歇脚，然而来人持旨时报出了准确的馆驿名称与房号。',
    role: 'key',
    supports: ['impossible-edict', 'fake-identity'],
  },
  {
    id: 'urgent-leave',
    title: '来人急于催促离开',
    content: '来人不停催促老臣立刻动身，不允许拖延，行事慌张，与正式宣旨礼仪不符。',
    role: 'supporting',
    supports: ['fake-identity', 'trap'],
  },
  {
    id: 'night-arrival',
    title: '深夜到访不合礼制',
    content: '正式传旨应在白日公开进行，深夜密访本身就不符合朝廷礼制。',
    role: 'supporting',
    supports: ['fake-identity'],
  },
  {
    id: 'edict-content',
    title: '诏书内容合情合理',
    content: '诏书所言事项并无明显破绽，内容符合当前朝局。',
    role: 'decoy',
    misleadsTo: ['real-edict'],
  },
];

export const investigationNodes13: InvestigationNode[] = [
  {
    id: 'scene-uniform',
    type: 'scene',
    title: '仔细查看来人服制',
    result: '来人所穿靴子靴尖式样与千牛卫标准制式不符，这是内卫与外卫的明显区别。',
    cost: 1,
    evidenceIds: ['wrong-boots'],
    unlocks: ['witness-accent'],
  },
  {
    id: 'witness-accent',
    type: 'witness',
    title: '与来人交谈，辨别口音',
    result: '来人自称关中籍，却在交谈中露出河东腔调。两者无法同时成立。',
    cost: 1,
    requires: ['scene-uniform'],
    evidenceIds: ['accent-mismatch'],
  },
  {
    id: 'knowledge-route',
    type: 'knowledge',
    title: '确认老臣行程是否公开',
    result: '老臣此次过境绛帐系临时决定，皇帝一侧并未收到通报。皇帝不可能知道老臣在此处。',
    cost: 1,
    evidenceIds: ['emperor-unaware'],
    unlocks: ['deduce-edict'],
  },
  {
    id: 'deduce-edict',
    type: 'evidence',
    title: '分析诏书送达的逻辑',
    result: '皇帝不知老臣在此，却有圣旨精准送到——这不可能是真圣旨。诏书要么是伪造，要么是从提前掌握行踪的人手中发出。',
    cost: 1,
    requires: ['knowledge-route'],
    evidenceIds: ['emperor-unaware', 'edict-arrived'],
  },
  {
    id: 'scene-behavior',
    type: 'scene',
    title: '观察来人行事方式',
    result: '来人深夜到访，不按宣旨礼仪进行，且不停催促立刻动身，神色慌张。',
    cost: 1,
    evidenceIds: ['urgent-leave', 'night-arrival'],
  },
  {
    id: 'scene-edict',
    type: 'evidence',
    title: '查验诏书内容',
    result: '诏书内容叙述合理，用词规范，表面看不出破绽。',
    cost: 1,
    evidenceIds: ['edict-content'],
  },
];

export const deductionSteps13: DeductionStep[] = [
  {
    id: 'step-identity',
    prompt: '根据服靴和口音，对来人身份最准确的判断是？',
    type: 'single',
    options: [
      { id: 'real-guard', label: '是真千牛卫，着装有疏漏' },
      { id: 'fake-guard', label: '身份可疑，有多处破绽' },
      { id: 'uncertain', label: '仅凭外貌无法判断' },
    ],
    correctOptionIds: ['fake-guard'],
    requiredEvidenceIds: ['wrong-boots', 'accent-mismatch'],
    maxScore: 2,
  },
  {
    id: 'step-edict-logic',
    prompt: '皇帝不知老臣在此，诏书却准确送达，这说明什么？',
    type: 'single',
    options: [
      { id: 'spy-network', label: '皇帝有密探网络，能追踪臣子行踪' },
      { id: 'impossible', label: '诏书非真，来者掌握了行踪' },
      { id: 'coincidence', label: '纯属巧合，皇帝恰好派人路过此地' },
    ],
    correctOptionIds: ['impossible'],
    requiredEvidenceIds: ['emperor-unaware', 'edict-arrived'],
    maxScore: 3,
  },
  {
    id: 'step-purpose',
    prompt: '假钦差催促老臣深夜离开，目的最可能是？',
    type: 'single',
    options: [
      { id: 'trap', label: '将老臣诱出馆驿，在路上伏击或控制' },
      { id: 'message', label: '传递真实但非正式的紧急消息' },
      { id: 'test', label: '测试老臣对圣旨的态度' },
    ],
    correctOptionIds: ['trap'],
    requiredEvidenceIds: ['urgent-leave', 'emperor-unaware'],
    maxScore: 2,
  },
  {
    id: 'step-conclusion',
    prompt: '综合所有证据，对本案最准确的定性是？',
    type: 'single',
    options: [
      { id: 'correct', label: '假钦差伪造圣旨，意图将老臣诱离' },
      { id: 'wrong-1', label: '真钦差，执行人员出了差错' },
      { id: 'wrong-2', label: '诏书真假待定，先按兵不动' },
    ],
    correctOptionIds: ['correct'],
    requiredEvidenceIds: ['wrong-boots', 'accent-mismatch', 'emperor-unaware', 'edict-arrived'],
    maxScore: 3,
  },
];

export const feedback13: CaseFeedback = {
  optionFeedback: {
    'real-guard': '真千牛卫不可能在制式要求严格的场合穿错靴子，这不是"不严谨"，而是根本上的制度破绽。',
    'fake-guard': '正确。服制和口音是两条独立破绽，缺一都不足够，两条同时成立才能确认身份可疑。',
    'uncertain': '此时已有两条具体破绽，不是无法判断，而是"应该判断"。',
    'spy-network': '皇帝密探网络的存在不能解释诏书送达的逻辑——即使有密探，也不会以圣旨名义传召。',
    'impossible': '正确。这是本案推翻假钦差身份的逻辑核心：皇帝不知→诏书不可能准确送达→诏书是伪造的。',
    'coincidence': '两名死者在馆驿一晚就碰到"路过的圣旨"，这不是巧合，是刻意布局。',
    'trap': '正确。催促连夜离开是布局的最后一步——把人诱出安全环境。',
    'message': '若是传递非正式消息，不需要伪造圣旨，直接派人传话即可。',
    'test': '测试说无法解释服制和口音的破绽，也无法解释信息来源矛盾。',
    'correct': '正确。身份推理的三重验证：制度细节（靴子）、身体特征（口音）、信息来源（行踪不公开）。',
    'wrong-1': '钦差真假才是核心问题，不是下属真假——圣旨来源本身就无法成立。',
    'wrong-2': '"按兵不动"是处置方式，不是推理结论；本案需要定性是否为假钦差。',
  },
  evidenceFeedback: {
    'wrong-boots': '关键证据。制式破绽是最直接的身份验证手段，古代制服细节可当身份证。',
    'accent-mismatch': '关键证据。口音与籍贯矛盾，说明来人在撒谎，这是第二道独立破绽。',
    'emperor-unaware': '关键证据。这是推翻诏书真实性的逻辑前提。',
    'edict-arrived': '关键证据。与"皇帝不知行踪"合用，才能推出"诏书不可能是真的"。',
    'urgent-leave': '辅助证据。催促行为揭示了陷阱的目的——把人引出去。',
    'night-arrival': '辅助证据。深夜传旨不合礼制，是额外的异常信号。',
    'edict-content': '误导证据。内容合理只说明伪造者了解朝局，不能证明诏书为真。',
  },
  missingKeyEvidence: {
    'wrong-boots': '你漏掉了"服靴不合千牛卫制度"——这是第一道可直接核对的身份破绽。',
    'emperor-unaware': '你漏掉了"皇帝不知老臣在此"——没有这条，无法推翻诏书的合法性。',
    'edict-arrived': '你漏掉了"诏书却准确送到馆驿"——这是与皇帝不知行踪合用的关键矛盾。',
  },
  finalSummary: {
    excellent: '大人三重验证环环相扣：制式破绽→口音破绽→信息来源矛盾，身份推理做到了无懈可击。',
    partial: '大人抓住了制度破绽，但"诏书送达本身不可能"这条逻辑链还没有完全展开。',
    failed: '大人被诏书内容迷惑，需要从"皇帝是否知道行踪"这个问题重新出发。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 21 指南车下的吸铁石
//
// ── 红鲱鱼链：地形复杂自然迷路 ──────────────────────────────────────────────
// 错误结论：谷地地形复杂，历史上也有自然迷路记录，此次属意外
// 支持它的表面证据：
//   - 谷地地形复杂易迷路（id: terrain-error）——有历史先例，合理背景
//   - 当日有薄雾（场景）——能见度降低加大迷路风险
// 解释不了的关键矛盾：
//   - 指南车下发现吸铁石（id: magnet-found）——自然迷路无法解释为何车底会有人为放置的铁石
// 复盘拆解：地形复杂+薄雾是非常合理的自然因素；
//   但铁石的存在是人为物证，自然迷路无论如何解释不了这块铁石是怎么到指南车底部的。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList21: Evidence[] = [
  {
    id: 'magnet-found',
    title: '指南车下发现吸铁石',
    content: '勘查指南车底盘时，在靠近磁针机关的位置发现一块人为放置的吸铁石，与车体颜色不符。',
    role: 'key',
    supports: ['direction-tampered', 'sabotage'],
  },
  {
    id: 'wrong-direction',
    title: '实际路线偏向北方伏击圈',
    content: '军队按指南车指示行进，却逐渐偏离预定南行路线，进入北方的狭窄谷地伏击圈。',
    role: 'key',
    supports: ['direction-tampered', 'trap'],
  },
  {
    id: 'had-map',
    title: '军中备有地图',
    content: '军中随行有地形图，正常情况下地图与指南车互相校验，不应迷路。',
    role: 'key',
    supports: ['natural-error-excluded', 'sabotage'],
  },
  {
    id: 'magnet-interferes',
    title: '磁石可干扰磁针方向',
    content: '铁石磁性会使磁针偏转，导致指南车指示方向与真实方向产生固定偏差。',
    role: 'key',
    supports: ['direction-tampered', 'sabotage'],
  },
  {
    id: 'ambush-circle',
    title: '伏击圈显然早有准备',
    content: '伏击圈内敌军埋伏整齐，说明对方预知了军队的路线，不是偶然遭遇。',
    role: 'supporting',
    supports: ['trap', 'insider'],
  },
  {
    id: 'new-route',
    title: '出发前曾更改行军路线',
    content: '原定路线出发前一日临时更改，知情者范围极小。',
    role: 'supporting',
    supports: ['insider', 'sabotage'],
  },
  {
    id: 'terrain-error',
    title: '谷地地形复杂易迷路',
    content: '该区域山谷地形确实复杂，历史上有部队自然迷路的记录。',
    role: 'decoy',
    misleadsTo: ['natural-confusion'],
  },
];

export const investigationNodes21: InvestigationNode[] = [
  {
    id: 'scene-compass',
    type: 'scene',
    title: '检查指南车底盘与磁针机关',
    result: '指南车底部靠近磁针处有一块外来铁石，颜色和材质与车体明显不同，显然是后来放入的。',
    cost: 1,
    evidenceIds: ['magnet-found'],
    unlocks: ['knowledge-magnet'],
  },
  {
    id: 'knowledge-magnet',
    type: 'knowledge',
    title: '验证磁石对磁针的影响',
    result: '用铁石靠近磁针，磁针立刻偏转。磁石放置位置固定，可产生稳定的方向偏差，让军队按错误方向行进。',
    cost: 1,
    requires: ['scene-compass'],
    evidenceIds: ['magnet-interferes'],
  },
  {
    id: 'scene-route',
    type: 'scene',
    title: '复盘实际行军路线',
    result: '将实际路线画在地图上，军队走的方向与正确南行路线相差约四十度，恰好指向北方谷地。',
    cost: 1,
    evidenceIds: ['wrong-direction', 'had-map'],
    unlocks: ['deduce-sabotage'],
  },
  {
    id: 'deduce-sabotage',
    type: 'evidence',
    title: '分析地图与指南车的矛盾',
    result: '军中同时备有地图和指南车，正常情况下两者互相校验，理应避免迷路。目前情形是：地图未发现问题，指南车下有吸铁石，而实际路线与地图预定方向存在固定偏差。',
    cost: 1,
    requires: ['scene-route'],
    evidenceIds: ['had-map', 'magnet-found'],
  },
  {
    id: 'witness-ambush',
    type: 'witness',
    title: '询问侦察兵：伏击圈情况',
    result: '伏击圈内敌军阵列整齐，显然等候多时，不是偶然遭遇。对方必定事先知道我军会走这条路。',
    cost: 1,
    evidenceIds: ['ambush-circle'],
    unlocks: ['witness-route-change'],
  },
  {
    id: 'witness-route-change',
    type: 'witness',
    title: '追问：行军路线是否临时更改',
    result: '行军路线出发前一日曾更改，知情者仅限将领数人。路线泄露说明内部有问题。',
    cost: 1,
    requires: ['witness-ambush'],
    evidenceIds: ['new-route'],
  },
];

export const deductionSteps21: DeductionStep[] = [
  {
    id: 'step-cause',
    prompt: '军队有地图和指南车仍走错方向，最可能的原因是什么？',
    type: 'single',
    options: [
      { id: 'natural', label: '地形复杂，自然迷路' },
      { id: 'tampered', label: '指南车被人为干扰' },
      { id: 'map-wrong', label: '地图绘制存在错误' },
    ],
    correctOptionIds: ['tampered'],
    requiredEvidenceIds: ['magnet-found', 'had-map', 'magnet-interferes'],
    maxScore: 3,
  },
  {
    id: 'step-mechanism',
    prompt: '吸铁石如何导致军队走向伏击圈？',
    type: 'multi',
    options: [
      { id: 'm1', label: '吸铁石放置在指南车磁针附近' },
      { id: 'm2', label: '磁石磁性让磁针产生固定偏差' },
      { id: 'm3', label: '军队按偏差后的方向行进' },
      { id: 'm4', label: '吸铁石被风吹落恰好偏转方向' },
    ],
    correctOptionIds: ['m1', 'm2', 'm3'],
    requiredEvidenceIds: ['magnet-found', 'magnet-interferes'],
    maxScore: 2,
  },
  {
    id: 'step-insider',
    prompt: '伏击圈敌军等候多时，且路线曾临时更改，这说明什么？',
    type: 'single',
    options: [
      { id: 'leak', label: '军中有内奸，路线和指南车被同一伙人布局' },
      { id: 'coincidence', label: '伏击圈是敌方惯用据点，纯属巧合' },
      { id: 'spy-outside', label: '敌方有外部侦察，发现了军队行进方向' },
    ],
    correctOptionIds: ['leak'],
    requiredEvidenceIds: ['ambush-circle', 'new-route'],
    maxScore: 2,
  },
  {
    id: 'step-conclusion',
    prompt: '综合以上推断，对本案最准确的定性是？',
    type: 'single',
    options: [
      { id: 'correct', label: '指南车被人为干扰，疑有内奸配合' },
      { id: 'wrong-1', label: '地形复杂自然迷路，恰好进入敌方据点' },
      { id: 'wrong-2', label: '指南车制造缺陷，与敌无关' },
    ],
    correctOptionIds: ['correct'],
    requiredEvidenceIds: ['magnet-found', 'magnet-interferes', 'wrong-direction', 'ambush-circle'],
    maxScore: 3,
  },
];

export const feedback21: CaseFeedback = {
  optionFeedback: {
    'natural': '军中同时有地图和指南车互相校验，自然迷路的可能性极低；且谷地地形确实复杂只是背景，不能解释吸铁石的存在。',
    'tampered': '正确。指南车下有吸铁石是直接物证，这不是猜测而是确凿证据。',
    'map-wrong': '地图可以核对，且实际偏差方向规律固定，不像随机绘制错误。',
    'm1': '正确。位置决定了磁石能影响磁针。',
    'm2': '正确。这是干扰有效的物理原理。',
    'm3': '正确。这是军队被引入错误路线的最终环节。',
    'm4': '吸铁石是人为放置，不是偶然滚落；且偶然因素无法解释方向偏差的规律性。',
    'leak': '正确。两条独立证据指向同一结论：路线被人知晓（临时更改仍被泄露）+ 指南车被人动手脚。',
    'coincidence': '伏击圈整齐等候本身就排除了巧合，敌方必然事先知道路线。',
    'spy-outside': '外部侦察无法解释指南车下的吸铁石——这需要有人进入军中布置。',
    'correct': '正确。机关诡计案的核心：工具被污染→方向被操控→陷阱提前布置，三环缺一不可。',
    'wrong-1': '吸铁石是人为放置的铁证，无法用"巧合迷路"解释。',
    'wrong-2': '制造缺陷不会导致磁针被外来铁石偏转，且铁石明显是外来物。',
  },
  evidenceFeedback: {
    'magnet-found': '关键证据。指南车下的吸铁石是本案最直接的物证，直接证明工具被人为篡改。',
    'wrong-direction': '关键证据。实际路线偏差是结果，与磁石发现合用才能建立完整因果链。',
    'had-map': '关键证据。有地图还走错，说明不是普通迷路，工具被篡改是唯一解释。',
    'magnet-interferes': '关键证据。磁石干扰磁针的原理是本案机关的核心知识。',
    'ambush-circle': '辅助证据。提前等候说明情报泄露，指向内奸配合。',
    'new-route': '辅助证据。临时更改路线仍被泄露，缩小了内奸范围。',
    'terrain-error': '误导证据。地形复杂只是背景，不能解释吸铁石的存在和伏击圈的有备而来。',
  },
  missingKeyEvidence: {
    'magnet-found': '你漏掉了"指南车下发现吸铁石"——这是证明工具被篡改的直接物证。',
    'magnet-interferes': '你漏掉了"磁石可干扰磁针方向"——没有这个原理，无法解释磁石如何导致路线偏差。',
    'had-map': '你漏掉了"军中备有地图"——这条证据说明同时有地图仍走错，自然迷路说无法成立。',
  },
  finalSummary: {
    excellent: '大人思路清晰：物证（磁石）→原理（干扰偏转）→结果（路线错误）→内奸（路线泄露），机关诡计推理环环相扣。',
    partial: '大人发现了磁石，但路线泄露和内奸配合这条线还没有完整展开。',
    failed: '大人被"地形复杂"这一背景信息误导，需要以"有导航还走错"为起点重建推理。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 25 三句遗言
//
// ── 红鲱鱼链：神意预言 ───────────────────────────────────────────────────────
// 错误结论："大地动"是上天示警，"黑暗之山"是某宗教势力，饷银只是偶发意外
// 支持它的表面证据：
//   - 地动被解读为神意（id: supernatural-read）——当地民间普遍如此理解
//   - 丫鬟身份低微（id: low-status）——普通人说的话容易被理解为迷信而非情报
// 解释不了的关键矛盾：
//   - 萧娘身上有信物（id: token-on-body）——如果只是神意，她不会持有与某势力相关的铜牌
// 复盘拆解：民间将地动解读为神意是真实背景，萧娘临死前说出这些词也可能被理解为恐惧+迷信；
//   但信物的存在说明她接触了具体的人或事，而不只是听了民间传言。
// ─────────────────────────────────────────────────────────────────────────────

export const evidenceList25: Evidence[] = [
  {
    id: 'three-words',
    title: '三个遗言碎片',
    content: '萧娘临死前只说了三组词：黑暗之山、大地动、饷银。三者必须能组成一个因果句才有意义。',
    role: 'key',
    supports: ['syntax-key', 'cause-chain'],
  },
  {
    id: 'quake-happened',
    title: '地动确实发生过',
    content: '当地近期确有地震，此乃公开事实，百姓皆知。',
    role: 'key',
    supports: ['quake-real', 'exploit-quake'],
  },
  {
    id: 'quake-not-manmade',
    title: '人力无法制造真正的地动',
    content: '史料与工匠记录均无人力引发地震的方法；近期地震的成因经官方勘测为地层自然断裂，与人工工事无关。',
    role: 'key',
    supports: ['syntax-key', 'exploit-quake'],
  },
  {
    id: 'token-on-body',
    title: '萧娘身上有信物',
    content: '萧娘身上带有一枚铜制令牌，正面刻有山形图案，背面有两个模糊的篆字，非民间流通之物。',
    role: 'key',
    supports: ['xiao-knew', 'silenced'],
  },
  {
    id: 'low-status',
    title: '丫鬟身份低微',
    content: '萧娘登记在册为普通丫鬟，无官职亦无家族背景，主家事后确认她不曾接触过任何机密文书。',
    role: 'supporting',
    supports: ['xiao-knew', 'silenced'],
  },
  {
    id: 'dark-mountain',
    title: '"黑暗之山"可指黑山地区',
    content: '"黑暗之山"在古语中可指代"黑山"地区，该地有一支山地力量活动。',
    role: 'supporting',
    supports: ['cause-chain'],
  },
  {
    id: 'rations-moved',
    title: '饷银运输近期出过意外',
    content: '当地军饷运输队近期在地动期间曾遭遇"意外"，损失不明。',
    role: 'supporting',
    supports: ['exploit-quake', 'cause-chain'],
  },
  {
    id: 'supernatural-read',
    title: '"大地动"被解读为神意',
    content: '当地有人将地动解读为上天示警，引发民间恐慌。',
    role: 'decoy',
    misleadsTo: ['supernatural-cause'],
  },
];

export const investigationNodes25: InvestigationNode[] = [
  {
    id: 'scene-words',
    type: 'evidence',
    title: '逐字分析三个遗言碎片',
    result: '三个碎片：黑暗之山（地点/势力）、大地动（事件）、饷银（目标）。三者必须能组成逻辑因果链：谁在什么时机做了什么事。',
    cost: 1,
    evidenceIds: ['three-words'],
    unlocks: ['knowledge-quake'],
  },
  {
    id: 'knowledge-quake',
    type: 'knowledge',
    title: '核查地动是否真实发生',
    result: '当地近期确有地震，是公开事实。但人力不可能人工引发真正地震——遗言里的"地动"只能是"利用地动"，不是"制造地动"。',
    cost: 1,
    requires: ['scene-words'],
    evidenceIds: ['quake-happened', 'quake-not-manmade'],
    unlocks: ['deduce-syntax'],
  },
  {
    id: 'deduce-syntax',
    type: 'evidence',
    title: '尝试三种组合句法',
    result: '三种句法各自的问题：\n"引发地动"——以当时技术，人力无法制造真正地震，此读法与已知事实矛盾。\n"知道地动将发生"——即便能预知，也无法解释"饷银"为何出现在遗言里，三词之间仍缺乏因果关系。\n"利用地动造成的混乱"——需要结合饷银运输情况进一步核查，看三词是否能形成完整因果链。',
    cost: 1,
    requires: ['knowledge-quake'],
    evidenceIds: ['three-words', 'quake-not-manmade'],
  },
  {
    id: 'scene-body',
    type: 'scene',
    title: '检查萧娘遗物',
    result: '萧娘身上有一枚铜牌，纹样与黑山势力相关联。她一个普通丫鬟，不应持有此物，说明她目睹或听到了某件核心秘事。',
    cost: 1,
    evidenceIds: ['token-on-body', 'low-status'],
    unlocks: ['witness-rations'],
  },
  {
    id: 'witness-rations',
    type: 'witness',
    title: '查询饷银运输记录',
    result: '地动发生当日，军饷运输队恰好在路上，事后上报为"意外损失"，但金额与实际差异过大，疑似被劫。',
    cost: 1,
    requires: ['scene-body'],
    evidenceIds: ['rations-moved'],
  },
  {
    id: 'knowledge-mountain',
    type: 'knowledge',
    title: '考证"黑暗之山"的指代',
    result: '"黑暗之山"古语可指"黑山"，该地有一支善于利用山地和混乱的武装力量，历史上曾多次在动荡时机劫持官方物资。',
    cost: 1,
    evidenceIds: ['dark-mountain'],
  },
];

export const deductionSteps25: DeductionStep[] = [
  {
    id: 'step-exclude',
    prompt: '"大地动"在遗言中最合理的解读是？',
    type: 'single',
    options: [
      { id: 'cause', label: '"黑暗之山"引发了地动（主动制造）' },
      { id: 'know', label: '"黑暗之山"知道地动将要发生（预知）' },
      { id: 'exploit', label: '"黑暗之山"利用地动制造混乱，趁机行事' },
    ],
    correctOptionIds: ['exploit'],
    requiredEvidenceIds: ['quake-not-manmade', 'quake-happened'],
    maxScore: 3,
  },
  {
    id: 'step-syntax',
    prompt: '能同时解释"黑暗之山+大地动+饷银"三者关系的唯一句法是？',
    type: 'single',
    options: [
      { id: 'correct-syntax', label: '黑暗之山趁地动之乱劫走饷银' },
      { id: 'wrong-syntax-1', label: '地动毁了饷银库，黑暗之山乘机逃走' },
      { id: 'wrong-syntax-2', label: '饷银与地动无关，黑暗之山是地名' },
    ],
    correctOptionIds: ['correct-syntax'],
    requiredEvidenceIds: ['three-words', 'quake-not-manmade', 'rations-moved'],
    maxScore: 3,
  },
  {
    id: 'step-xiao',
    prompt: '萧娘为何会被追杀？',
    type: 'single',
    options: [
      { id: 'witness', label: '她目睹或听闻了劫饷秘密，成为灭口对象' },
      { id: 'participant', label: '她是劫饷的参与者，因分赃不均被杀' },
      { id: 'mistaken', label: '她被误认为持有与劫饷有关的文件' },
    ],
    correctOptionIds: ['witness'],
    requiredEvidenceIds: ['token-on-body', 'low-status'],
    maxScore: 2,
  },
  {
    id: 'step-conclusion',
    prompt: '根据三句遗言，最完整的推理结论是？',
    type: 'single',
    options: [
      { id: 'correct', label: '趁地动劫饷，萧娘因知情被灭口' },
      { id: 'wrong-1', label: '地动是神意，萧娘是无辜受害者' },
      { id: 'wrong-2', label: '黑山势力制造了地动，饷银是副产品' },
    ],
    correctOptionIds: ['correct'],
    requiredEvidenceIds: ['three-words', 'quake-not-manmade', 'token-on-body', 'rations-moved'],
    maxScore: 2,
  },
];

export const feedback25: CaseFeedback = {
  optionFeedback: {
    'cause': '人力无法制造真正的地震，这个读法可以直接排除。',
    'know': '"知道地动"无法解释"饷银"出现在遗言中，三词必须能组成完整因果链。',
    'exploit': '正确。利用地动是唯一既符合"人力上限"又能串联三个词的读法。',
    'correct-syntax': '正确。这是唯一能让三个词各司其职、构成完整因果链的句法。',
    'wrong-syntax-1': '地动摧毁饷银库不需要"黑暗之山"出现在遗言里；且地动不能被人主动摧毁。',
    'wrong-syntax-2': '把黑暗之山解读为地名而非势力，无法解释萧娘为何被追杀。',
    'witness': '正确。信物和低微身份合用，说明她知道了不该知道的事，而非本身是危险人物。',
    'participant': '参与者被杀通常是内部矛盾，但信物和低微身份不支持萧娘是主动参与者。',
    'mistaken': '误杀说无法解释她身上的铜牌信物为何存在。',
    'correct': '正确。文字谜案的核心：穷举句法→排除不可能→锁定唯一合理读法。',
    'wrong-1': '神意说无法解释劫饷行为和萧娘被追杀，绕过了遗言中的具体指向。',
    'wrong-2': '制造地动已被排除；此选项是"利用地动"和"制造地动"的混淆。',
  },
  evidenceFeedback: {
    'three-words': '关键证据。三个词必须组成因果链，这是整个文字谜推理的起点和框架。',
    'quake-happened': '关键证据。地动是真实发生的事，才能被利用；否则整条推理链都不成立。',
    'quake-not-manmade': '关键证据。排除"制造地动"读法的核心依据，迫使玩家转向"利用地动"。',
    'token-on-body': '关键证据。信物是证明萧娘掌握核心信息的直接物证。',
    'low-status': '辅助证据。低微身份说明她的危险来自所知而非所是。',
    'dark-mountain': '辅助证据。帮助确认"黑暗之山"的指代，但不是推理的核心逻辑。',
    'rations-moved': '辅助证据。饷银损失的记录印证了"劫饷"这一推论。',
    'supernatural-read': '误导证据。神意解读是民间传言，会让玩家绕过因果逻辑直接接受玄学解释。',
  },
  missingKeyEvidence: {
    'three-words': '你漏掉了对三个词逐一分析的过程——遗言推理必须先明确每个词的语法功能。',
    'quake-not-manmade': '你漏掉了"人力无法制造地动"——没有这条，无法排除最大的误导读法。',
    'token-on-body': '你漏掉了"萧娘身上的信物"——这是证明她掌握核心秘密的关键物证。',
  },
  finalSummary: {
    excellent: '大人逻辑严密：先排除不可能的读法，再用因果链锁定唯一答案，文字谜推理做到了穷举与排除。',
    partial: '大人找到了"利用地动"这个方向，但萧娘为何被杀这条辅助线还没有完整交代。',
    failed: '大人被"神意"或"制造地动"等误导读法带偏，需要从"人力能做什么"这一约束重新出发。',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 阅卷初判选项
// ─────────────────────────────────────────────────────────────────────────────

const initialHypotheses04 = [
  { id: 'daytime', label: '案发在日间，凶手趁官道混乱作案', feedback: '日间官道车来车往，车辙会持续被覆盖——死者车辙清晰未被覆盖，说明案发后无车经过，这与日间说矛盾。' },
  { id: 'night-window', label: '案发在闭城后的夜间空窗期，死者有特殊身份', feedback: '初判与真相一致。关键在于把车辙覆盖关系和城门制度联动起来，推出唯一的时间窗口。' },
  { id: 'unsure', label: '路人偶发袭击，时间难以确定', feedback: '偶发袭击说无法解释死者在闭城后仍朝城门方向赶路这一反常行为，需要深入调查。' },
];

const initialHypotheses07 = [
  { id: 'mechanism', label: '凶手通过某种机关或暗道进入密室', feedback: '机关和暗道是密室故事的常见预设，但此案门窗无痕、客栈结构简单，物证不支持这一方向。' },
  { id: 'victim-opened', label: '死者自己开了门，凶手趁机杀人', feedback: '初判与真相一致。门栓完好+两人倒在门边，这两条物证合用才能推出这个结论。' },
  { id: 'innkeeper', label: '掌柜或店内人员是凶手', feedback: '店内人员是合理怀疑方向，但不能从"谁是凶手"出发倒推，应先确认"凶手如何进入"。' },
];

const initialHypotheses13 = [
  { id: 'real', label: '钦差是真的，但执行时出了差错', feedback: '真钦差有制度保障，不会服靴错误；且皇帝根本不知道老臣在绛帐，真圣旨不可能送到这里。' },
  { id: 'fake', label: '这是一伙假钦差，目的是将老臣诱离馆驿', feedback: '初判与真相一致。三重破绽（靴子、口音、行踪矛盾）缺一都不算完整证明，需要逐一核实。' },
  { id: 'unsure', label: '来人身份可疑，但无法确定真假', feedback: '保持怀疑是对的，但现场已有足够的制度细节可以核对，不应止步于"可疑"。' },
];

const initialHypotheses21 = [
  { id: 'terrain', label: '地形复杂，军队自然迷路进入伏击圈', feedback: '军中同时有地图和指南车，自然迷路的可能性很低；且指南车下有吸铁石这一物证无法被"地形复杂"解释。' },
  { id: 'tampered', label: '指南车被人为干扰，是有计划的陷阱', feedback: '初判与真相一致。物证（磁石）→原理（偏转）→结果（走错路）→内奸（路线泄露），推理链要完整展开。' },
  { id: 'intel-leak', label: '军队路线情报被泄露，敌方提前布置伏击', feedback: '情报泄露是本案一部分，但单靠情报泄露无法解释军队为何按错误方向走——还需要解释指南车的问题。' },
];

const initialHypotheses25 = [
  { id: 'supernatural', label: '"大地动"是神意，黑暗之山是宗教势力', feedback: '神意解读绕过了因果逻辑——遗言三个词必须能组成一个具体的因果句，而非玄学符号。' },
  { id: 'exploit-quake', label: '某势力利用地动制造的混乱劫走了饷银，萧娘因知情被灭口', feedback: '初判与真相一致。关键在于排除"制造地动"（人力不可能），才能锁定"利用地动"这个唯一合理读法。' },
  { id: 'unrelated', label: '三个词各自独立，不是同一件事', feedback: '临死遗言通常指向同一件最重要的事——把三个词拆开理解，会失去遗言的推理价值。' },
];

const initialHypotheses01 = [
  { id: 'suicide', label: '赵氏自缢身亡', feedback: '初判自杀，但后续调查发现尸身与现场多处矛盾，说明直觉可能受到了表面布局的干扰。' },
  { id: 'murder', label: '赵氏被人杀害后伪装成自杀', feedback: '初判他杀，与最终真相一致。后续调查只需收集足够证据支撑这一判断。' },
  { id: 'unsure', label: '暂时无法判断，需勘查才能确定', feedback: '保持开放态度不失稳妥，但现场已有多处疑点——"疑点"本身就是信号。' },
];

const initialHypotheses02 = [
  { id: 'war', label: '假使团的目的是挑起战乱', feedback: '战争动机看似有道理，但后续调查发现假使团行事更精准——他们的目标另有所图。' },
  { id: 'kiln', label: '假使团进京是为了旧窑场里的秘密', feedback: '初判与最终真相一致。调查中需要找出窑场和假使团之间的直接联系来支撑这一判断。' },
  { id: 'bribe', label: '假使团是为了贿赂官员，购买情报', feedback: '行贿动机有一定合理性，但无法解释窑场火案和留活口等反常行为，说明动机判断还不够准确。' },
];

const initialHypotheses09 = [
  { id: 'sun-guilty', label: '孙喜旺就是凶手，左手血印是铁证', feedback: '左手血印是最显眼的物证，初判孙喜旺很自然。但"物证出现在哪里"比"物证属于谁"更重要，需要深入调查。' },
  { id: 'third-party', label: '有第三人趁黑暗行凶并嫁祸孙喜旺', feedback: '初判与最终真相一致。黑暗、无防御、血印位置可疑——三点联动才能证明这是一起嫁祸案。' },
  { id: 'accident', label: '可能是意外或严氏自己造成的伤亡', feedback: '意外说无法解释人为熄灭的风灯，以及剪刀上反常的外圈血印，需要重新审视现场。' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 扩展数据索引，供 cases.ts 合并
// ─────────────────────────────────────────────────────────────────────────────

export const caseExtensions: Record<string, {
  evidenceList: Evidence[];
  investigationNodes: InvestigationNode[];
  deductionSteps: DeductionStep[];
  feedback: CaseFeedback;
  actionPointLimit: number;
  initialHypotheses: { id: string; label: string; feedback: string }[];
}> = {
  '01': {
    evidenceList: evidenceList01,
    investigationNodes: investigationNodes01,
    deductionSteps: deductionSteps01,
    feedback: feedback01,
    actionPointLimit: 6,  // 共7个节点（含2个追问），留有压力但不至于绝路
    initialHypotheses: initialHypotheses01,
  },
  '02': {
    evidenceList: evidenceList02,
    investigationNodes: investigationNodes02,
    deductionSteps: deductionSteps02,
    feedback: feedback02,
    actionPointLimit: 6,  // 共7个节点（含2个追问），需要取舍
    initialHypotheses: initialHypotheses02,
  },
  '09': {
    evidenceList: evidenceList09,
    investigationNodes: investigationNodes09,
    deductionSteps: deductionSteps09,
    feedback: feedback09,
    actionPointLimit: 5,  // 共7个节点（含3个追问），高阶案压力更大
    initialHypotheses: initialHypotheses09,
  },
  '04': {
    evidenceList: evidenceList04,
    investigationNodes: investigationNodes04,
    deductionSteps: deductionSteps04,
    feedback: feedback04,
    actionPointLimit: 5,  // 共7个节点（含2个追问），进阶案中等压力
    initialHypotheses: initialHypotheses04,
  },
  '07': {
    evidenceList: evidenceList07,
    investigationNodes: investigationNodes07,
    deductionSteps: deductionSteps07,
    feedback: feedback07,
    actionPointLimit: 5,  // 共7个节点（含2个追问），进阶密室案
    initialHypotheses: initialHypotheses07,
  },
  '13': {
    evidenceList: evidenceList13,
    investigationNodes: investigationNodes13,
    deductionSteps: deductionSteps13,
    feedback: feedback13,
    actionPointLimit: 5,  // 共6个节点（含1个追问），入门身份案
    initialHypotheses: initialHypotheses13,
  },
  '21': {
    evidenceList: evidenceList21,
    investigationNodes: investigationNodes21,
    deductionSteps: deductionSteps21,
    feedback: feedback21,
    actionPointLimit: 5,  // 共6个节点（含1个追问），入门机关案
    initialHypotheses: initialHypotheses21,
  },
  '25': {
    evidenceList: evidenceList25,
    investigationNodes: investigationNodes25,
    deductionSteps: deductionSteps25,
    feedback: feedback25,
    actionPointLimit: 5,  // 共6个节点（含1个追问），进阶文字谜
    initialHypotheses: initialHypotheses25,
  },
};
