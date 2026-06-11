/**
 * 案件数据校验脚本
 * 运行：npm run validate:cases
 *
 * 校验精制版案件（有 evidenceList + investigationNodes + deductionSteps + feedback）
 * 的 id 一致性，防止断链。
 */
import { caseExtensions } from '../src/data/cases-extended.ts';

type ValidationError = {
  caseId: string;
  field: string;
  message: string;
};

const errors: ValidationError[] = [];

function err(caseId: string, field: string, message: string) {
  errors.push({ caseId, field, message });
}

for (const [caseId, ext] of Object.entries(caseExtensions)) {
  const { evidenceList, investigationNodes, deductionSteps, feedback } = ext;

  // ── 1. evidenceList id 不可重复 ──────────────────────────────────────────
  const evidenceIdSet = new Set<string>();
  for (const ev of evidenceList) {
    if (evidenceIdSet.has(ev.id)) {
      err(caseId, 'evidenceList', `证据 id 重复：${ev.id}`);
    }
    evidenceIdSet.add(ev.id);
  }

  // ── 2. investigationNodes id 不可重复 ────────────────────────────────────
  const nodeIdSet = new Set<string>();
  for (const node of investigationNodes) {
    if (nodeIdSet.has(node.id)) {
      err(caseId, 'investigationNodes', `节点 id 重复：${node.id}`);
    }
    nodeIdSet.add(node.id);
  }

  // ── 3. investigationNodes.evidenceIds → evidenceList ────────────────────
  for (const node of investigationNodes) {
    for (const eid of node.evidenceIds ?? []) {
      if (!evidenceIdSet.has(eid)) {
        err(caseId, `investigationNodes[${node.id}].evidenceIds`, `引用了不存在的证据 id：${eid}`);
      }
    }
  }

  // ── 4. investigationNodes.requires → investigationNodes ─────────────────
  for (const node of investigationNodes) {
    for (const req of node.requires ?? []) {
      if (!nodeIdSet.has(req)) {
        err(caseId, `investigationNodes[${node.id}].requires`, `引用了不存在的节点 id：${req}`);
      }
    }
  }

  // ── 5. investigationNodes.unlocks → investigationNodes ──────────────────
  for (const node of investigationNodes) {
    for (const unlk of node.unlocks ?? []) {
      if (!nodeIdSet.has(unlk)) {
        err(caseId, `investigationNodes[${node.id}].unlocks`, `引用了不存在的节点 id：${unlk}`);
      }
    }
  }

  // ── 6. deductionSteps.correctOptionIds → step.options ───────────────────
  for (const step of deductionSteps) {
    if (step.type === 'text') continue;
    const optionIds = new Set((step.options ?? []).map((o) => o.id));
    for (const cid of step.correctOptionIds ?? []) {
      if (!optionIds.has(cid)) {
        err(caseId, `deductionSteps[${step.id}].correctOptionIds`, `引用了不存在的选项 id：${cid}`);
      }
    }
  }

  // ── 7. feedback.evidenceFeedback keys → evidenceList ────────────────────
  for (const eid of Object.keys(feedback.evidenceFeedback)) {
    if (!evidenceIdSet.has(eid)) {
      err(caseId, 'feedback.evidenceFeedback', `引用了不存在的证据 id：${eid}`);
    }
  }

  // ── 8. feedback.missingKeyEvidence keys → evidenceList & role=key ───────
  for (const eid of Object.keys(feedback.missingKeyEvidence)) {
    if (!evidenceIdSet.has(eid)) {
      err(caseId, 'feedback.missingKeyEvidence', `引用了不存在的证据 id：${eid}`);
    } else {
      const ev = evidenceList.find((e) => e.id === eid)!;
      if (ev.role !== 'key') {
        err(caseId, 'feedback.missingKeyEvidence', `证据 ${eid} 的 role 不是 key（实际：${ev.role}）`);
      }
    }
  }

  // ── 9. deductionSteps.requiredEvidenceIds → evidenceList ─────────────────
  for (const step of deductionSteps) {
    for (const eid of step.requiredEvidenceIds ?? []) {
      if (!evidenceIdSet.has(eid)) {
        err(caseId, `deductionSteps[${step.id}].requiredEvidenceIds`, `引用了不存在的证据 id：${eid}`);
      }
    }
  }
}

// ── 文本 lint（warning，不 fail） ─────────────────────────────────────────────
//
// 仅扫描玩家在"勘查结束前"就能看到的字段：
//   InvestigationNode.result / Evidence.content（非 type:knowledge 节点的 result 仍需规范）
//   DeductionStep.option.label
//
// 以下高风险词直接给出结论，不应出现在这些字段中。
// 初判/复盘 feedback 字段不在此范围，可以给解释。
const FORBIDDEN_PATTERNS = [
  { pattern: /说明(?:凶手|真相|此|他|她|来|是|有人|行凶|栽赃|没有|死者)/, label: '说明+结论' },
  { pattern: /(?:^|[^一二三四五六七八九十百])只有(?:一种|这种|[^，。\s]{0,4}才)/, label: '只有…才（独断句）' },
  { pattern: /不可能(?:是|知道|看到|做到|完成|发生|自然|人工|存在)/, label: '不可能+结论' },
  { pattern: /即栽赃/, label: '即栽赃' },
  { pattern: /真正目标/, label: '真正目标' },
  { pattern: /无法成立/, label: '无法成立' },
];

type LintWarning = { caseId: string; field: string; matched: string; text: string };
const warnings: LintWarning[] = [];

function warnText(caseId: string, field: string, text: string) {
  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      warnings.push({ caseId, field, matched: label, text: text.slice(0, 80) });
    }
  }
}

for (const [caseId, ext] of Object.entries(caseExtensions)) {
  const { evidenceList, investigationNodes, deductionSteps } = ext;

  // Evidence.content（所有角色，含 decoy）
  for (const ev of evidenceList) {
    warnText(caseId, `evidence[${ev.id}].content`, ev.content);
  }

  // InvestigationNode.result（knowledge 节点豁免）
  for (const node of investigationNodes) {
    if (node.type === 'knowledge') continue;
    warnText(caseId, `node[${node.id}].result`, node.result);
  }

  // DeductionStep.option.label — 禁用词扫描 + 长度差检查
  for (const step of deductionSteps) {
    const opts = step.options ?? [];
    for (const opt of opts) {
      warnText(caseId, `step[${step.id}].option[${opt.id}].label`, opt.label);
    }

    // 长度差检查：正确选项的字数不应显著超过所有错误选项
    // 阈值：正确选项比最长错误选项多超过 6 个字视为警告
    const correctIds = new Set(step.correctOptionIds ?? []);
    if (correctIds.size === 0 || opts.length < 2) continue;
    const correctLens = opts.filter((o) => correctIds.has(o.id)).map((o) => o.label.length);
    const wrongLens = opts.filter((o) => !correctIds.has(o.id)).map((o) => o.label.length);
    if (wrongLens.length === 0) continue;
    const maxCorrect = Math.max(...correctLens);
    const maxWrong = Math.max(...wrongLens);
    if (maxCorrect - maxWrong > 6) {
      warnings.push({
        caseId,
        field: `step[${step.id}]`,
        matched: '正确选项过长',
        text: `正确选项最长 ${maxCorrect} 字，错误选项最长 ${maxWrong} 字，差值 ${maxCorrect - maxWrong}`,
      });
    }
  }
}

// ── 输出结果 ─────────────────────────────────────────────────────────────────

if (errors.length === 0) {
  console.log('✅ 所有精制版案件数据校验通过，无断链。');
} else {
  console.error(`\n❌ 发现 ${errors.length} 处数据问题：\n`);
  for (const e of errors) {
    console.error(`  [案件 ${e.caseId}] ${e.field}\n    → ${e.message}\n`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  文本 lint：发现 ${warnings.length} 处勘查前可见字段中的高风险词（warning，不影响 build）：\n`);
  for (const w of warnings) {
    console.warn(`  [案件 ${w.caseId}] ${w.field}\n    命中：「${w.matched}」\n    文本：${w.text}\n`);
  }
} else {
  console.log('✅ 文本 lint 通过，勘查前可见字段无高风险词。');
}
