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

// ── 输出结果 ─────────────────────────────────────────────────────────────────

if (errors.length === 0) {
  console.log('✅ 所有精制版案件数据校验通过，无断链。');
  process.exit(0);
} else {
  console.error(`\n❌ 发现 ${errors.length} 处数据问题：\n`);
  for (const e of errors) {
    console.error(`  [案件 ${e.caseId}] ${e.field}\n    → ${e.message}\n`);
  }
  process.exit(1);
}
