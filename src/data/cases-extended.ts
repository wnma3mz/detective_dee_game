/**
 * 三案样板扩展数据
 * 包含新的调查节点、证据模型、结构化推理步骤和复盘反馈。
 */
import type {
  CaseFeedback,
  DeductionStep,
  Evidence,
  InvestigationNode,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// 01 梁上白绫
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
    content: '墙角锄头立得端正，锄尖上还有湿泥，说明有人从容整理过。',
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
    result: '锄头立得端正，锄尖上还有湿泥。田间劳作后随手一放，不会这么整齐。',
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
      { id: 'trust', label: '可信，赵氏应是自行上吊' },
      { id: 'doubt', label: '存疑，现场有多处不合自尽的痕迹' },
      { id: 'unsure', label: '目前线索不足，难以判断' },
    ],
    correctOptionIds: ['doubt'],
    maxScore: 2,
  },
  {
    id: 'step-contradiction',
    prompt: '哪一点最能推翻"赵氏自尽"的说法？',
    type: 'single',
    options: [
      { id: 'rope-old', label: '白绫是旧物，不像临时取来的' },
      { id: 'feet-far', label: '双脚离板凳过远，动作上无法自然完成上吊' },
      { id: 'zhou-scared', label: '周二说自己吓坏了，应该没力气整理现场' },
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
      { id: 'torn-clothes', label: '衣襟新破——死前曾有扭打' },
      { id: 'neck-scratch', label: '周二脖颈抓痕——与赵氏挣扎可互相印证' },
      { id: 'hoe-neat', label: '锄头立得端正——说明有人从容整理过现场' },
      { id: 'old-rope', label: '白绫是旧物——家中常备，可事先备好' },
      { id: 'zhou-contradict', label: '周二口供前后矛盾——"吓坏了"却还整理了锄头' },
    ],
    correctOptionIds: ['torn-clothes', 'neck-scratch', 'hoe-neat', 'zhou-contradict'],
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
    content: '旧窑场平日由皇帝亲卫把守，闲人不得靠近，说明此处有特殊价值。',
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
    result: '若要挑起战火，只需杀死使团、栽赃边境即可。凶手假冒进京这一步对"挑战火"毫无必要，反而增加暴露风险。',
    cost: 1,
    evidenceIds: ['war-enough'],
  },
  {
    id: 'motive-reward',
    type: 'witness',
    title: '核查"冒领赏赐"说',
    result: '冒领赏赐目标是使团贡品。但凶手进京后仍继续行动，并未在拿到赏赐后脱身，说明这不是终点。',
    cost: 1,
    evidenceIds: ['survivor-risk', 'diplomatic-gift'],
    unlocks: ['motive-reward-detail'],
  },
  {
    id: 'motive-reward-detail',
    type: 'witness',
    title: '追问"冒领赏赐"的漏洞',
    prompt: '赏赐固然重要，但为何要留活口、继续冒险？',
    result: '凶手留下使团中一名向导作为活口，而不是灭口。这个向导熟悉旧窑场附近地形——这才是留他的理由。',
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
    prompt: '朝堂上对凶手动机有三种说法，哪一种最站不住脚？',
    type: 'single',
    options: [
      { id: 'war', label: '挑起战火——杀使团已足够，无需冒充进京' },
      { id: 'reward', label: '冒领赏赐——能解释进京，但不能解释留活口和继续冒险' },
      { id: 'infiltrate', label: '潜入京城另有图谋——最能解释全部行为' },
    ],
    correctOptionIds: ['war'],
    maxScore: 2,
  },
  {
    id: 'step-contradiction',
    prompt: '"冒领赏赐"说法的核心漏洞是什么？',
    type: 'single',
    options: [
      { id: 'gift-small', label: '贡礼价值太低，不值得这么大费周章' },
      { id: 'survivor-risk', label: '为赏赐不该故意留活口，反而扩大风险' },
      { id: 'no-escape-3', label: '凶手已入京却没有立刻逃走' },
    ],
    correctOptionIds: ['survivor-risk'],
    requiredEvidenceIds: ['survivor-risk'],
    maxScore: 2,
  },
  {
    id: 'step-evidence',
    prompt: '哪些线索支持"真正目标是旧窑场"这个推论？（可多选）',
    type: 'multi',
    options: [
      { id: 'kiln-guard', label: '旧窑场由禁军看守，有特殊价值' },
      { id: 'handkerchief', label: '刺客手帕出现在窑场废墟' },
      { id: 'timeline-match', label: '假使团进京次日，窑场即起火' },
      { id: 'diplomatic-gift', label: '使团贡礼丰厚，值得冒充' },
    ],
    correctOptionIds: ['kiln-guard', 'handkerchief', 'timeline-match'],
    maxScore: 3,
  },
  {
    id: 'step-conclusion',
    prompt: '本案最合理的结论是？',
    type: 'single',
    options: [
      { id: 'truth', label: '凶手借使团身份潜入京城，真正目标是旧窑场' },
      { id: 'decoy-1', label: '凶手主要目的是挑起边境战火，进京只是顺便' },
      { id: 'decoy-2', label: '凶手主要目的是冒领赏赐，窑场起火是巧合' },
    ],
    correctOptionIds: ['truth'],
    requiredEvidenceIds: ['kiln-guard', 'handkerchief'],
    maxScore: 3,
  },
];

export const feedback02: CaseFeedback = {
  optionFeedback: {
    war: '正确。挑起战火不需要冒充进京，杀使团就已经达成目的。',
    reward: '冒领赏赐能解释进京，但解释不了留活口和后续的高风险行动。',
    infiltrate: '正确，这是最终结论。',
    'gift-small': '贡礼价值是否够高是主观判断，不如"留活口却继续冒险"这个逻辑矛盾更直接。',
    'survivor-risk': '正确。为了钱不该这样冒险，说明目的不在赏赐。',
    'no-escape-3': '不逃走有多种解释（还有后续任务、出城被封），不如"留活口"矛盾更尖锐。',
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
    result: '人在光线正常的情况下遇到正面攻击，本能反应是抬手格挡。严氏双手低垂，说明她在遇刺时根本没有看见攻击——很可能是在黑暗中。',
    cost: 1,
    requires: ['scene-body'],
    evidenceIds: ['hands-low'],
  },
  {
    id: 'deduce-grip',
    type: 'knowledge',
    title: '分析血印位置的含义',
    prompt: '外圈握法无法有效发力，那血印是什么时候留下的？',
    result: '血印极可能不是行凶时自然形成的，而是事后由他人将孙喜旺的手按在剪刀上留下的——即栽赃。',
    cost: 1,
    requires: ['scene-scissors'],
    evidenceIds: ['blood-outer', 'scissors-grip'],
  },
  {
    id: 'deduce-lamp',
    type: 'knowledge',
    title: '分析灯为何在案发时熄灭',
    prompt: '风灯不可能自然熄灭，那是谁把它弄灭的，目的是什么？',
    result: '灯在案发时熄灭，说明有人主动制造了黑暗。在黑暗中，严氏无法看见攻击，孙喜旺也可能在不知情的情况下被控制。',
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
      { id: 'no-doubt', label: '不够，外圈握法和无防御反应都有问题' },
      { id: 'maybe', label: '证据有一定说服力，但存在疑点' },
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
      { id: 'lamp-natural', label: '风灯不可能自然熄灭，黑暗是人为的' },
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
      { id: 'hands-low', label: '严氏双手低垂，说明遇刺前处于黑暗中' },
      { id: 'lamp-proof', label: '风灯不可能自然熄灭，黑暗是人为制造' },
      { id: 'scissors-grip', label: '外圈握法无法有效发力' },
      { id: 'blood-outer', label: '血印在外圈，不是自然行凶时的握持位置' },
      { id: 'left-handed', label: '孙喜旺是左撇子，与血印手型吻合' },
    ],
    correctOptionIds: ['hands-low', 'lamp-proof', 'scissors-grip', 'blood-outer'],
    maxScore: 3,
  },
  {
    id: 'step-conclusion',
    prompt: '本案最合理的判断是？',
    type: 'single',
    options: [
      { id: 'truth', label: '孙喜旺可能被真凶控制利用，血手印是栽赃的一部分' },
      { id: 'decoy-1', label: '孙喜旺确是凶手，血印和握法只是他操作不熟练' },
      { id: 'decoy-2', label: '另有外人潜入行凶，孙喜旺和物证都是巧合' },
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
// 扩展数据索引，供 cases.ts 合并
// ─────────────────────────────────────────────────────────────────────────────

export const caseExtensions: Record<string, {
  evidenceList: Evidence[];
  investigationNodes: InvestigationNode[];
  deductionSteps: DeductionStep[];
  feedback: CaseFeedback;
}> = {
  '01': {
    evidenceList: evidenceList01,
    investigationNodes: investigationNodes01,
    deductionSteps: deductionSteps01,
    feedback: feedback01,
  },
  '02': {
    evidenceList: evidenceList02,
    investigationNodes: investigationNodes02,
    deductionSteps: deductionSteps02,
    feedback: feedback02,
  },
  '09': {
    evidenceList: evidenceList09,
    investigationNodes: investigationNodes09,
    deductionSteps: deductionSteps09,
    feedback: feedback09,
  },
};
