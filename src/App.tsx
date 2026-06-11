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
  BookOpen
} from 'lucide-react';
import { cases } from './data/cases';
import {
  calculateScore,
  createEmptyProgress,
  loadProgress,
  resetProgress,
  saveProgress,
} from './data/progress';
import type { CaseProgress, DetectiveCase, ProgressStore } from './data/types';
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
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

export function App() {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id ?? '');
  const [progressStore, setProgressStore] = useState<ProgressStore>(() => loadProgress());

  const [activeTab, setActiveTab] = useState<'reading' | 'investigation' | 'deduction'>('reading');

  const selectedCase = useMemo(() => {
    return cases.find((gameCase) => gameCase.id === selectedCaseId) ?? cases[0];
  }, [selectedCaseId]);

  const selectedProgress = selectedCase ? getProgress(progressStore, selectedCase) : null;

  useEffect(() => {
    saveProgress(progressStore);
  }, [progressStore]);

  // Reset tab when case changes
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
      return {
        ...progress,
        unlockedActionIds: [...progress.unlockedActionIds, actionId],
      };
    });
  }

  function selectTruth(truthId: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => ({
      ...progress,
      selectedTruthId: truthId,
    }));
  }

  function toggleEvidence(evidenceId: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => {
      const selectedEvidenceIds = progress.selectedEvidenceIds.includes(evidenceId)
        ? progress.selectedEvidenceIds.filter((id) => id !== evidenceId)
        : [...progress.selectedEvidenceIds, evidenceId];

      return {
        ...progress,
        selectedEvidenceIds,
      };
    });
  }

  function updateFinalNote(value: string) {
    if (!selectedCase) return;
    updateCaseProgress(selectedCase.id, (progress) => ({
      ...progress,
      finalNote: value,
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
    
    // Add a small confirmation to make it feel weighty
    if (!window.confirm('结案呈词一旦提交，便不可更改。大人确认要结案吗？')) {
      return;
    }

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

  const completedCount = cases.filter((gameCase) => getProgress(progressStore, gameCase).submitted).length;
  const canSubmit = Boolean(selectedProgress.selectedTruthId) && selectedProgress.selectedEvidenceIds.length >= 2;
  const selectedTruthLabel =
    selectedCase.deduction.truthOptions.find((option) => option.id === selectedProgress.selectedTruthId)?.label ??
    '尚未选择';

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
            <h2><ScrollText size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }}/>案卷目录</h2>
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
                    <small>{progress.submitted ? `${gameCase.category} · ${gameCase.difficulty}` : `待查 · ${gameCase.difficulty}`}</small>
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
              </div>

              {/* Stage Navigation Tabs */}
              <div className="stage-tabs">
                <button 
                  className={`stage-tab ${activeTab === 'reading' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reading')}
                >
                  一·阅卷
                </button>
                <button 
                  className={`stage-tab ${activeTab === 'investigation' ? 'active' : ''}`}
                  onClick={() => setActiveTab('investigation')}
                >
                  二·勘查
                </button>
                <button 
                  className={`stage-tab ${activeTab === 'deduction' ? 'active' : ''}`}
                  onClick={() => setActiveTab('deduction')}
                >
                  三·断案
                </button>
              </div>
            </section>

            <AnimatePresence mode="wait">
              {/* READING STAGE */}
              {activeTab === 'reading' && (
                <motion.div
                  key="reading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <section className="panel">
                    <h3 className="panel-title"><BookOpen size={20}/> 案卷纪实</h3>
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                      {selectedCase.intro.map((paragraph, index) => (
                        <motion.p variants={itemVariants} key={index} className="story-text">
                          {paragraph}
                        </motion.p>
                      ))}
                      <motion.div variants={itemVariants} className="reader-note">
                        <strong><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> 现代读者小注</strong>
                        {selectedCase.readerNote}
                      </motion.div>
                    </motion.div>
                    
                    <div className="stage-footer">
                      <button onClick={() => {
                        setActiveTab('investigation');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}>
                        前往勘查 <ChevronRight size={18} />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* INVESTIGATION STAGE */}
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
                    <h3 className="panel-title"><Search size={20}/> 现场勘查</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      任务：{selectedCase.playerTask}
                    </p>
                    
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
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="action-clue"
                              >
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
                  </section>

                  <section className="panel">
                    <h3 className="panel-title"><Lightbulb size={20}/> 案情提示</h3>
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
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hint-box"
                          >
                            <strong>轻提示：</strong> {selectedCase.hints.light}
                          </motion.div>
                        )}
                        {selectedProgress.strongHintUsed && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hint-box strong"
                          >
                            <strong style={{ color: 'var(--accent-red)' }}>强提示：</strong> {selectedCase.hints.strong}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="stage-footer">
                      <button onClick={() => {
                        setActiveTab('deduction');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}>
                        开始断案 <ChevronRight size={18} />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* DEDUCTION & SOLUTION STAGE */}
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
                    <h3 className="panel-title"><FileQuestion size={20}/> 结案呈词</h3>
                    
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
                          须先在“现场勘查”解锁线索。至少勾选 2 条方可结案。
                        </p>
                        <div className="evidence-grid">
                          {selectedCase.investigationActions.map((action) => {
                            const unlocked = selectedProgress.unlockedActionIds.includes(action.id);
                            const selected = selectedProgress.selectedEvidenceIds.includes(action.id);
                            const disabled = selectedProgress.submitted || !unlocked;
                            
                            return (
                              <label key={action.id} className={`evidence-checkbox ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  disabled={disabled}
                                  onChange={() => toggleEvidence(action.id)}
                                />
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
                            onChange={(event) => updateFinalNote(event.target.value)}
                            placeholder="例如：报案人的反应与现场物证互相矛盾。"
                            value={selectedProgress.finalNote}
                          />
                        </div>
                      </div>

                      {!selectedProgress.submitted && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button 
                            onClick={submitCase} 
                            disabled={selectedProgress.submitted || !canSubmit}
                            style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}
                          >
                            <Scale size={20} />
                            确认结案
                          </button>
                          <button className="ghost-button" onClick={restartCase}>
                            <RotateCcw size={18} />
                            重置本案
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  {selectedProgress.submitted && (
                    <motion.section 
                      variants={panelVariants}
                      initial="hidden"
                      animate="show"
                      className="panel solution-panel"
                    >
                      <h3 className="panel-title">
                        <Scale size={20} />
                        真相与复盘
                      </h3>
                      <div className="score-display">
                        <CheckCircle2 size={18} /> 得分: {selectedProgress.score ?? 0}
                      </div>
                      
                      <div className="player-summary">
                        <h4>大人的判断</h4>
                        <p><strong>结论：</strong>{selectedTruthLabel}</p>
                        <p><strong>线索：</strong>{selectedProgress.selectedEvidenceIds.length
                            ? selectedProgress.selectedEvidenceIds.join('、')
                            : '未勾选'}</p>
                        {selectedProgress.finalNote.trim() && <p><strong>陈词：</strong>{selectedProgress.finalNote}</p>}
                      </div>

                      <div className="solution-truth">【真相】{selectedCase.solution.truth}</div>
                      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        {selectedCase.solution.reasoning.map((item) => (
                          <li key={item} style={{ marginBottom: '0.5rem' }}>{item}</li>
                        ))}
                      </ul>

                      <h4 style={{ color: 'var(--text-dark)' }}>评分参考</h4>
                      <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                        {selectedCase.solution.scoreRubric.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>

                      <div className="takeaway-box">
                        <Lightbulb size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/>
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
