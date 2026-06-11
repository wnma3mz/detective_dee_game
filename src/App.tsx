import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText,
  Search,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
  Scale,
  AlertCircle,
  FileQuestion,
  ChevronRight,
  BookOpen,
  MapPin,
  User,
  Package,
  Clock,
  BookMarked,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { cases } from './data/cases';
import {
  calculateScore,
  createEmptyProgress,
  loadProgress,
  resetProgress,
  saveProgress,
} from './data/progress';
import type {
  CaseProgress,
  DetectiveCase,
  InvestigationNode,
  ProgressStore,
} from './data/types';
import './styles.css';

function getProgress(progressStore: ProgressStore, gameCase: DetectiveCase): CaseProgress {
  const emptyProgress = createEmptyProgress(gameCase);
  const savedProgress = progressStore[gameCase.id];
  if (!savedProgress) return emptyProgress;

  return {
    ...emptyProgress,
    ...savedProgress,
    answers: {
      ...emptyProgress.answers,
      ...(savedProgress.answers ?? {}),
    },
    unlockedActionIds: savedProgress.unlockedActionIds ?? [],
    selectedEvidenceIds: savedProgress.selectedEvidenceIds ?? [],
    selectedTruthId: savedProgress.selectedTruthId ?? '',
    finalNote: savedProgress.finalNote ?? '',
    unlockedNodeIds: savedProgress.unlockedNodeIds ?? [],
    deductionAnswers: savedProgress.deductionAnswers ?? {},
  };
}

const nodeTypeIcon: Record<string, React.ReactNode> = {
  scene: <MapPin size={14} />,
  witness: <User size={14} />,
  evidence: <Package size={14} />,
  timeline: <Clock size={14} />,
  knowledge: <BookMarked size={14} />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

// ── 新勘查面板（investigationNodes 模式） ──────────────────────────────────────

function NewInvestigationPanel({
  gameCase,
  progress,
  onUnlockNode,
}: {
  gameCase: DetectiveCase;
  progress: CaseProgress;
  onUnlockNode: (nodeId: string) => void;
}) {
  const nodes = gameCase.investigationNodes!;

  const visibleNodes = nodes.filter((node) => {
    if (!node.requires || node.requires.length === 0) return true;
    return node.requires.every((req) => progress.unlockedNodeIds.includes(req));
  });

  return (
    <div className="actions-grid">
      {visibleNodes.map((node) => {
        const unlocked = progress.unlockedNodeIds.includes(node.id);
        return (
          <div className={`action-card ${unlocked ? 'unlocked' : ''}`} key={node.id}>
            <div className="action-title" style={{ gap: '0.4rem' }}>
              <span style={{ color: unlocked ? 'var(--accent-gold)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {nodeTypeIcon[node.type] ?? <Search size={14} />}
              </span>
              {unlocked ? node.title : '未知线索'}
              {node.requires && node.requires.length > 0 && !unlocked && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginLeft: 'auto' }}>追问</span>
              )}
            </div>

            {node.prompt && !unlocked && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0.5rem 0' }}>{node.prompt}</p>
            )}

            {unlocked ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="action-clue"
              >
                {node.result}
              </motion.div>
            ) : (
              <button onClick={() => onUnlockNode(node.id)}>
                <Search size={16} /> 调查此处
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 新断案面板（deductionSteps 模式） ─────────────────────────────────────────

function NewDeductionPanel({
  gameCase,
  progress,
  onAnswer,
  submitted,
}: {
  gameCase: DetectiveCase;
  progress: CaseProgress;
  onAnswer: (stepId: string, answers: string[]) => void;
  submitted: boolean;
}) {
  const steps = gameCase.deductionSteps!;

  return (
    <div className="deduction-section">
      {steps.map((step, idx) => {
        const answers = progress.deductionAnswers[step.id] ?? [];
        return (
          <div className="deduction-block" key={step.id}>
            <h4>{idx + 1}. {step.prompt}</h4>

            {step.type === 'text' && (
              <textarea
                disabled={submitted}
                value={answers[0] ?? ''}
                onChange={(e) => onAnswer(step.id, [e.target.value])}
                placeholder="写下你的判断……"
                rows={3}
              />
            )}

            {(step.type === 'single' || step.type === 'multi') && step.options && (
              <div className="options-grid">
                {step.options.map((opt) => {
                  const selected = answers.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      className={`option-card ${selected ? 'selected' : ''}`}
                      disabled={submitted}
                      style={{ width: '100%' }}
                      onClick={() => {
                        if (step.type === 'single') {
                          onAnswer(step.id, [opt.id]);
                        } else {
                          const next = selected
                            ? answers.filter((a) => a !== opt.id)
                            : [...answers, opt.id];
                          onAnswer(step.id, next);
                        }
                      }}
                    >
                      <div className="option-indicator" />
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      {step.type === 'multi' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {selected ? '✓' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === 'multi' && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                可多选
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 新复盘面板（feedback 模式） ───────────────────────────────────────────────

function NewReviewPanel({
  gameCase,
  progress,
}: {
  gameCase: DetectiveCase;
  progress: CaseProgress;
}) {
  const { feedback, deductionSteps, evidenceList } = gameCase;
  if (!feedback || !deductionSteps || !evidenceList) return null;

  // 判断最终结论步骤是否答对
  const conclusionStep = deductionSteps[deductionSteps.length - 1];
  const conclusionAnswers = progress.deductionAnswers[conclusionStep.id] ?? [];
  const conclusionCorrect =
    conclusionStep.correctOptionIds?.length === 1 &&
    conclusionAnswers[0] === conclusionStep.correctOptionIds[0];

  const score = progress.score ?? 0;
  const maxPossible = deductionSteps.reduce((s, st) => s + (st.maxScore ?? 2), 0) + 3;
  const ratio = score / maxPossible;
  const summaryText =
    ratio >= 0.8
      ? feedback.finalSummary.excellent
      : ratio >= 0.5
        ? feedback.finalSummary.partial
        : feedback.finalSummary.failed;

  // 分析玩家选择的证据
  const evidenceMap = new Map(evidenceList.map((e) => [e.id, e]));
  const selectedEvidences = progress.selectedEvidenceIds
    .map((id) => evidenceMap.get(id))
    .filter(Boolean) as typeof evidenceList;
  const keyHits = selectedEvidences.filter((e) => e.role === 'key');
  const decoyHits = selectedEvidences.filter((e) => e.role === 'decoy');

  // 玩家漏掉的关键证据
  const unlockedNodeIds = new Set(progress.unlockedNodeIds);
  const unlockedEvidenceIds = new Set<string>();
  for (const node of gameCase.investigationNodes ?? []) {
    if (unlockedNodeIds.has(node.id)) {
      for (const eid of node.evidenceIds ?? []) unlockedEvidenceIds.add(eid);
    }
  }
  const missedKeyEvidence = evidenceList.filter(
    (e) => e.role === 'key' && unlockedEvidenceIds.has(e.id) && !progress.selectedEvidenceIds.includes(e.id),
  );

  return (
    <div className="review-diagnosis">
      <div className={`review-verdict ${conclusionCorrect ? 'correct' : 'wrong'}`}>
        {conclusionCorrect ? (
          <><CheckCircle2 size={20} /> 结论正确</>
        ) : (
          <><XCircle size={20} /> 结论有误</>
        )}
      </div>

      <p className="review-summary">{summaryText}</p>

      {/* 推理步骤回顾 */}
      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>推理步骤回顾</h4>
      {deductionSteps.map((step, idx) => {
        const answers = progress.deductionAnswers[step.id] ?? [];
        const correct = step.correctOptionIds ?? [];
        const isCorrect =
          step.type === 'text'
            ? answers[0]?.trim()
            : step.type === 'single'
              ? answers[0] === correct[0]
              : correct.every((c) => answers.includes(c)) && answers.every((a) => correct.includes(a));

        // 获取选项反馈
        const optionFeedbacks = answers
          .map((a) => feedback.optionFeedback[a])
          .filter(Boolean);

        return (
          <div key={step.id} className={`review-step ${isCorrect ? 'correct' : 'wrong'}`}>
            <div className="review-step-header">
              {isCorrect ? <CheckCircle2 size={14} /> : <MinusCircle size={14} />}
              <span>第 {idx + 1} 步：{step.prompt}</span>
            </div>
            {optionFeedbacks.length > 0 && (
              <p className="review-step-feedback">{optionFeedbacks[0]}</p>
            )}
          </div>
        );
      })}

      {/* 证据分析 */}
      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>证据选择分析</h4>
      {selectedEvidences.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>未选择任何证据。</p>
      )}
      {selectedEvidences.map((ev) => {
        const fb = feedback.evidenceFeedback[ev.id];
        const roleLabel =
          ev.role === 'key' ? '关键证据' :
          ev.role === 'supporting' ? '辅助证据' :
          ev.role === 'context' ? '背景信息' : '误导证据';
        const roleClass =
          ev.role === 'key' ? 'evidence-key' :
          ev.role === 'supporting' ? 'evidence-supporting' :
          ev.role === 'decoy' ? 'evidence-decoy' : 'evidence-context';
        return (
          <div key={ev.id} className={`review-evidence ${roleClass}`}>
            <div className="review-evidence-title">
              <span>{ev.title}</span>
              <span className={`evidence-badge ${roleClass}`}>{roleLabel}</span>
            </div>
            {fb && <p className="review-step-feedback">{fb}</p>}
          </div>
        );
      })}

      {/* 漏掉的关键证据 */}
      {missedKeyEvidence.length > 0 && (
        <>
          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--accent-red)' }}>遗漏的关键证据</h4>
          {missedKeyEvidence.slice(0, 2).map((ev) => (
            <div key={ev.id} className="review-evidence evidence-missing">
              <div className="review-evidence-title">
                <span>{ev.title}</span>
                <span className="evidence-badge evidence-missing">未采纳</span>
              </div>
              <p className="review-step-feedback">{feedback.missingKeyEvidence[ev.id] ?? ev.content}</p>
            </div>
          ))}
        </>
      )}

      {/* 误导证据警示 */}
      {decoyHits.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(139, 43, 43, 0.08)', borderRadius: '6px', borderLeft: '3px solid var(--accent-red)' }}>
          <p style={{ color: 'var(--accent-red)', fontSize: '0.88rem', margin: 0 }}>
            你选择了 {decoyHits.length} 条误导证据，它们在评分中扣了分。误导证据表面合理，但不足以支撑真正的结论。
          </p>
        </div>
      )}

      {/* 关键证据命中情况 */}
      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(184, 142, 70, 0.08)', borderRadius: '6px', borderLeft: '3px solid var(--accent-gold)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
          关键证据命中 {keyHits.length} / {evidenceList.filter((e) => e.role === 'key').length} 条
        </p>
      </div>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────────────

export function App() {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id ?? '');
  const [progressStore, setProgressStore] = useState<ProgressStore>(() => loadProgress());
  const [activeTab, setActiveTab] = useState<'reading' | 'investigation' | 'deduction'>('reading');

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) ?? cases[0],
    [selectedCaseId],
  );

  const selectedProgress = selectedCase ? getProgress(progressStore, selectedCase) : null;

  useEffect(() => {
    saveProgress(progressStore);
  }, [progressStore]);

  useEffect(() => {
    setActiveTab('reading');
  }, [selectedCaseId]);

  function updateCaseProgress(caseId: string, updater: (progress: CaseProgress) => CaseProgress) {
    const gameCase = cases.find((item) => item.id === caseId);
    if (!gameCase) return;
    setProgressStore((current) => ({
      ...current,
      [caseId]: updater(getProgress(current, gameCase)),
    }));
  }

  function unlockAction(actionId: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => {
      if (progress.unlockedActionIds.includes(actionId)) return progress;
      return { ...progress, unlockedActionIds: [...progress.unlockedActionIds, actionId] };
    });
  }

  function unlockNode(nodeId: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => {
      if (progress.unlockedNodeIds.includes(nodeId)) return progress;
      const node = selectedCase.investigationNodes?.find((n) => n.id === nodeId);
      // 同时把节点关联的证据加入 selectedEvidenceIds 供展示（不计入断案勾选）
      const newEvidenceIds = node?.evidenceIds ?? [];
      return {
        ...progress,
        unlockedNodeIds: [...progress.unlockedNodeIds, nodeId],
        // 将解锁的证据自动加入待选池（不强制勾选，需玩家在断案页手动勾选）
      };
    });
  }

  function selectTruth(truthId: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => ({ ...progress, selectedTruthId: truthId }));
  }

  function toggleEvidence(evidenceId: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => {
      const selectedEvidenceIds = progress.selectedEvidenceIds.includes(evidenceId)
        ? progress.selectedEvidenceIds.filter((id) => id !== evidenceId)
        : [...progress.selectedEvidenceIds, evidenceId];
      return { ...progress, selectedEvidenceIds };
    });
  }

  function updateFinalNote(value: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => ({ ...progress, finalNote: value }));
  }

  function setDeductionAnswer(stepId: string, answers: string[]) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => ({
      ...progress,
      deductionAnswers: { ...progress.deductionAnswers, [stepId]: answers },
    }));
  }

  function useHint(kind: 'light' | 'strong') {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => ({
      ...progress,
      lightHintUsed: progress.lightHintUsed || kind === 'light',
      strongHintUsed: progress.strongHintUsed || kind === 'strong',
    }));
  }

  function submitCase() {
    if (!selectedCase || !selectedProgress) return;
    if (!window.confirm('结案呈词一旦提交，便不可更改。大人确认要结案吗？')) return;
    updateCaseProgress(selectedCase.id, (progress) => ({
      ...progress,
      submitted: true,
      score: calculateScore(selectedCase, progress),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restartCase() {
    if (!selectedCase) return;
    if (window.confirm('重开此案将清空当前推理进度，是否继续？')) {
      updateCaseProgress(selectedCase.id, () => createEmptyProgress(selectedCase));
    }
  }

  function resetAll() {
    if (window.confirm('这将清空所有案件的进度！是否继续？')) {
      resetProgress();
      setProgressStore({});
    }
  }

  if (!selectedCase || !selectedProgress) {
    return <main className="app-shell">暂无案件数据。</main>;
  }

  const completedCount = cases.filter((c) => getProgress(progressStore, c).submitted).length;

  // 断案可提交条件：旧模式需要选真相+2条证据；新模式需要每步都有答案
  const canSubmit = selectedCase.deductionSteps
    ? selectedCase.deductionSteps.every(
        (step) => (selectedProgress.deductionAnswers[step.id] ?? []).length > 0,
      )
    : Boolean(selectedProgress.selectedTruthId) && selectedProgress.selectedEvidenceIds.length >= 2;

  const selectedTruthLabel =
    selectedCase.deduction.truthOptions.find((opt) => opt.id === selectedProgress.selectedTruthId)?.label ??
    '尚未选择';

  // 新模式：可以勾选已解锁节点关联的证据
  const unlockedEvidenceIds = new Set<string>();
  for (const node of selectedCase.investigationNodes ?? []) {
    if (selectedProgress.unlockedNodeIds.includes(node.id)) {
      for (const eid of node.evidenceIds ?? []) unlockedEvidenceIds.add(eid);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">狄公断案</p>
        <h1>文字互动推理</h1>
        <p className="hero-text">
          保留古风案情，通过搜证、提示、推理提交和复盘评分，让玩家像狄公一样一步步拆开疑案。
        </p>
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">总案卷</span>
            <span className="stat-value">{cases.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">已破获</span>
            <span className="stat-value">{completedCount}</span>
          </div>
          <button className="ghost-button" style={{ marginLeft: '1rem', marginTop: '0.2rem' }} onClick={resetAll}>
            <RotateCcw size={16} /> 重置进度
          </button>
        </div>
      </header>

      <section className="layout">
        <aside className="case-list-container" aria-label="案件列表">
          <div className="case-list-header">
            <h2>
              <ScrollText size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />
              案卷目录
            </h2>
            <span style={{ color: 'var(--text-muted)' }}>{completedCount}/{cases.length}</span>
          </div>
          <div className="case-list-scroll">
            {cases.map((gameCase) => {
              const progress = getProgress(progressStore, gameCase);
              const isActive = gameCase.id === selectedCase.id;
              return (
                <button
                  className={`case-tab ${isActive ? 'active' : ''}`}
                  key={gameCase.id}
                  onClick={() => {
                    setSelectedCaseId(gameCase.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  type="button"
                >
                  <span className="case-tab-id">{gameCase.id}</span>
                  <span className="case-tab-main">
                    <strong>{gameCase.title}</strong>
                    <small>
                      {progress.submitted
                        ? `${gameCase.category} · ${gameCase.difficulty}`
                        : `待查 · ${gameCase.difficulty}`}
                    </small>
                  </span>
                  {progress.submitted ? (
                    <CheckCircle2 size={18} className="status-icon" />
                  ) : isActive ? (
                    <ChevronRight size={18} className="status-icon" />
                  ) : (
                    <span style={{ width: 18 }} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <AnimatePresence mode="wait">
          <motion.article
            key={selectedCase.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="case-content"
          >
            <section className="panel case-header-panel">
              <div className="case-number">第 {selectedCase.id} 案</div>
              <h2 className="case-title">{selectedCase.title}</h2>
              <p className="case-subtitle">{selectedCase.subtitle}</p>
              <div className="tags-row">
                <span className="tag">{selectedProgress.submitted ? selectedCase.category : '案型待判'}</span>
                <span className="tag">难度: {selectedCase.difficulty}</span>
                {selectedCase.deductionSteps && (
                  <span className="tag" style={{ borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
                    精制版
                  </span>
                )}
              </div>

              <div className="stage-tabs">
                <button className={`stage-tab ${activeTab === 'reading' ? 'active' : ''}`} onClick={() => setActiveTab('reading')}>
                  一·阅卷
                </button>
                <button className={`stage-tab ${activeTab === 'investigation' ? 'active' : ''}`} onClick={() => setActiveTab('investigation')}>
                  二·勘查
                </button>
                <button className={`stage-tab ${activeTab === 'deduction' ? 'active' : ''}`} onClick={() => setActiveTab('deduction')}>
                  三·断案
                </button>
              </div>
            </section>

            <AnimatePresence mode="wait">
              {/* ── 阅卷 ── */}
              {activeTab === 'reading' && (
                <motion.div
                  key="reading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <section className="panel">
                    <h3 className="panel-title"><BookOpen size={20} /> 案卷纪实</h3>
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                      {selectedCase.intro.map((paragraph, index) => (
                        <motion.p variants={itemVariants} key={index} className="story-text">
                          {paragraph}
                        </motion.p>
                      ))}
                      <motion.div variants={itemVariants} className="reader-note">
                        <strong>
                          <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          现代读者小注
                        </strong>
                        {selectedCase.readerNote}
                      </motion.div>
                    </motion.div>

                    <div className="stage-footer">
                      <button onClick={() => { setActiveTab('investigation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        前往勘查 <ChevronRight size={18} />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* ── 勘查 ── */}
              {activeTab === 'investigation' && (
                <motion.div
                  key="investigation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  <section className="panel">
                    <h3 className="panel-title"><Search size={20} /> 现场勘查</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      任务：{selectedCase.playerTask}
                    </p>

                    {selectedCase.investigationNodes ? (
                      <NewInvestigationPanel
                        gameCase={selectedCase}
                        progress={selectedProgress}
                        onUnlockNode={unlockNode}
                      />
                    ) : (
                      <div className="actions-grid">
                        {selectedCase.investigationActions.map((action) => {
                          const unlocked = selectedProgress.unlockedActionIds.includes(action.id);
                          return (
                            <div className={`action-card ${unlocked ? 'unlocked' : ''}`} key={action.id}>
                              <div className="action-title">
                                <span style={{ fontSize: '1.2rem', color: unlocked ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                                  {action.id}.
                                </span>
                                {unlocked ? action.title : '未知线索'}
                              </div>
                              {unlocked ? (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="action-clue">
                                  {action.clue}
                                </motion.div>
                              ) : (
                                <button onClick={() => unlockAction(action.id)}>
                                  <Search size={16} /> 调查此处
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="panel">
                    <h3 className="panel-title"><Lightbulb size={20} /> 案情提示</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      若毫无头绪，可查看提示。注：查看提示会影响最终结案评价。
                    </p>
                    <div className="hints-container">
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="ghost-button" onClick={() => useHint('light')} disabled={selectedProgress.lightHintUsed}>
                          {selectedProgress.lightHintUsed ? '已阅轻提示' : '查阅轻提示'}
                        </button>
                        <button className="ghost-button" style={{ borderColor: 'rgba(139, 43, 43, 0.4)', color: 'var(--accent-red)' }} onClick={() => useHint('strong')} disabled={selectedProgress.strongHintUsed}>
                          {selectedProgress.strongHintUsed ? '已阅强提示' : '查阅强提示'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {selectedProgress.lightHintUsed && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="hint-box">
                            <strong>轻提示：</strong> {selectedCase.hints.light}
                          </motion.div>
                        )}
                        {selectedProgress.strongHintUsed && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="hint-box strong">
                            <strong style={{ color: 'var(--accent-red)' }}>强提示：</strong> {selectedCase.hints.strong}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="stage-footer">
                      <button onClick={() => { setActiveTab('deduction'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        开始断案 <ChevronRight size={18} />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* ── 断案 ── */}
              {activeTab === 'deduction' && (
                <motion.div
                  key="deduction"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  <section className="panel">
                    <h3 className="panel-title"><FileQuestion size={20} /> 结案呈词</h3>

                    {selectedCase.deductionSteps ? (
                      /* 新模式：结构化推理链 */
                      <>
                        <NewDeductionPanel
                          gameCase={selectedCase}
                          progress={selectedProgress}
                          onAnswer={setDeductionAnswer}
                          submitted={selectedProgress.submitted}
                        />

                        {/* 证据勾选（基于已解锁节点的证据） */}
                        {unlockedEvidenceIds.size > 0 && (
                          <div className="deduction-block" style={{ marginTop: '1.5rem' }}>
                            <h4>勾选支撑你结论的证据</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '-0.5rem 0 1rem 0' }}>
                              须先在"现场勘查"解锁线索。选择误导性证据会影响评分。
                            </p>
                            <div className="evidence-grid">
                              {selectedCase.evidenceList!.filter((ev) => unlockedEvidenceIds.has(ev.id)).map((ev) => {
                                const selected = selectedProgress.selectedEvidenceIds.includes(ev.id);
                                const disabled = selectedProgress.submitted;
                                return (
                                  <label key={ev.id} className={`evidence-checkbox ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
                                    <input type="checkbox" checked={selected} disabled={disabled} onChange={() => toggleEvidence(ev.id)} />
                                    <div className="checkbox-custom" />
                                    <span>{ev.title}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* 旧模式：原有 UI */
                      <div className="deduction-section">
                        <div className="deduction-block">
                          <h4>1. {selectedCase.deduction.truthQuestion}</h4>
                          <div className="options-grid">
                            {selectedCase.deduction.truthOptions.map((option) => {
                              const selected = selectedProgress.selectedTruthId === option.id;
                              return (
                                <button
                                  key={option.id}
                                  className={`option-card ${selected ? 'selected' : ''}`}
                                  onClick={() => selectTruth(option.id)}
                                  disabled={selectedProgress.submitted}
                                  style={{ width: '100%' }}
                                >
                                  <div className="option-indicator" />
                                  <span style={{ flex: 1 }}>{option.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="deduction-block">
                          <h4>2. {selectedCase.deduction.evidencePrompt}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '-0.5rem 0 1rem 0' }}>
                            须先在"现场勘查"解锁线索。至少勾选 2 条方可结案。
                          </p>
                          <div className="evidence-grid">
                            {selectedCase.investigationActions.map((action) => {
                              const unlocked = selectedProgress.unlockedActionIds.includes(action.id);
                              const selected = selectedProgress.selectedEvidenceIds.includes(action.id);
                              const disabled = selectedProgress.submitted || !unlocked;
                              return (
                                <label key={action.id} className={`evidence-checkbox ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
                                  <input type="checkbox" checked={selected} disabled={disabled} onChange={() => toggleEvidence(action.id)} />
                                  <div className="checkbox-custom" />
                                  <span>{action.id}. {unlocked ? action.title : '未解锁'}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="deduction-block">
                          <div className="text-input-block">
                            <h4>3. {selectedCase.deduction.notePrompt}</h4>
                            <textarea
                              disabled={selectedProgress.submitted}
                              onChange={(e) => updateFinalNote(e.target.value)}
                              placeholder="例如：报案人的反应与现场物证互相矛盾。"
                              value={selectedProgress.finalNote}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {!selectedProgress.submitted && (
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button
                          onClick={submitCase}
                          disabled={selectedProgress.submitted || !canSubmit}
                          style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}
                        >
                          <Scale size={20} /> 确认结案
                        </button>
                        <button className="ghost-button" onClick={restartCase}>
                          <RotateCcw size={18} /> 重置本案
                        </button>
                      </div>
                    )}
                  </section>

                  {selectedProgress.submitted && (
                    <motion.section
                      variants={panelVariants}
                      initial="hidden"
                      animate="show"
                      className="panel solution-panel"
                    >
                      <h3 className="panel-title">
                        <Scale size={20} /> 真相与复盘
                      </h3>
                      <div className="score-display">
                        <CheckCircle2 size={18} /> 得分: {selectedProgress.score ?? 0}
                      </div>

                      {/* 新模式：推理诊断 */}
                      {selectedCase.feedback && (
                        <NewReviewPanel gameCase={selectedCase} progress={selectedProgress} />
                      )}

                      {/* 玩家摘要（旧模式保留） */}
                      {!selectedCase.feedback && (
                        <div className="player-summary">
                          <h4>大人的判断</h4>
                          <p><strong>结论：</strong>{selectedTruthLabel}</p>
                          <p><strong>线索：</strong>{selectedProgress.selectedEvidenceIds.length ? selectedProgress.selectedEvidenceIds.join('、') : '未勾选'}</p>
                          {selectedProgress.finalNote.trim() && <p><strong>陈词：</strong>{selectedProgress.finalNote}</p>}
                        </div>
                      )}

                      <div className="solution-truth">【真相】{selectedCase.solution.truth}</div>
                      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        {selectedCase.solution.reasoning.map((item) => (
                          <li key={item} style={{ marginBottom: '0.5rem' }}>{item}</li>
                        ))}
                      </ul>

                      {!selectedCase.feedback && (
                        <>
                          <h4 style={{ color: 'var(--text-dark)' }}>评分参考</h4>
                          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                            {selectedCase.solution.scoreRubric.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      <div className="takeaway-box">
                        <Lightbulb size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                        {selectedCase.solution.takeaway}
                      </div>

                      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button className="ghost-button" onClick={restartCase} style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                          <RotateCcw size={18} /> 重开本案重新挑战
                        </button>
                      </div>
                    </motion.section>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        </AnimatePresence>
      </section>
    </main>
  );
}
