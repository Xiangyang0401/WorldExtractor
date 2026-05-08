// ============================================================
// 万界拾遗 · 对峙页面：与虚无的对峙
// ============================================================

import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { VOID_ROUNDS, executeRound } from '@/data/confrontation'
import type { Relic } from '@/types'

export function ConfrontationPage() {
  const { state, dispatch, navigateTo } = useApp()
  const { confrontationSession } = state

  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [phase, setPhase] = useState<'void-speaks' | 'player-acts' | 'result'>('void-speaks')
  const [roundResult, setRoundResult] = useState<{ worldBefore: number; worldAfter: number; action: string } | null>(null)

  if (!confrontationSession) {
    navigateTo('home')
    return null
  }

  const { currentRound, worldCount, relics: sessionRelics, finished } = confrontationSession

  if (finished) {
    navigateTo('confrontation-result')
    return null
  }

  const currentVoidRound = VOID_ROUNDS[currentRound - 1]
  if (!currentVoidRound) return null

  const availableRelics = sessionRelics.filter(r => !r.used && r.effectType !== 'auto')

  const handleConfirmAct = () => {
    const newSession = executeRound(confrontationSession, selectedRelic)
    const lastRecord = newSession.roundHistory[newSession.roundHistory.length - 1]

    setRoundResult({
      worldBefore: lastRecord.worldCountBefore,
      worldAfter: lastRecord.worldCountAfter,
      action: lastRecord.playerAction,
    })
    setPhase('result')
    dispatch({ type: 'UPDATE_CONFRONTATION', session: newSession })
    setSelectedRelic(null)
  }

  const handleNextRound = () => {
    const session = state.confrontationSession!
    if (session.finished) {
      navigateTo('confrontation-result')
    } else {
      setPhase('void-speaks')
      setRoundResult(null)
    }
  }

  return (
    <div className="game-container" style={{ padding: '4rem 1.5rem 2rem' }}>
      <div className="w-full animate-fadeIn" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '1.25rem',
        maxWidth: 1000,
        alignItems: 'stretch',
        minHeight: 600,
      }}>

        {/* ── 左栏：主内容 ── */}
        <div className="parchment-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* 顶部 */}
          <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid rgba(74,158,255,0.08)', flexShrink: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 style={{ color: 'var(--star-white)', fontSize: '1.1rem', letterSpacing: '0.15em', margin: 0 }}>
                  与虚无的对峙
                </h3>
                <p style={{ color: 'var(--star-muted)', fontSize: '0.78rem', margin: '0.2rem 0 0', letterSpacing: '0.1em' }}>
                  第 {currentRound} 轮 / 共 5 轮
                </p>
              </div>
              <div className="text-center">
                <p style={{ color: 'var(--aurora-cyan)', fontSize: '0.7rem', letterSpacing: '0.15em', margin: 0 }}>存活世界</p>
                <p style={{ color: 'var(--star-white)', fontSize: '1.8rem', fontFamily: 'monospace', margin: 0, lineHeight: 1.2 }}>
                  {worldCount}
                </p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="progress-bar mt-3">
              <div className="progress-bar-fill" style={{ width: `${((currentRound - 1) / 5) * 100}%` }} />
            </div>
          </div>

          {/* 中间：虚无显现 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', paddingRight: '1.25rem' }}>

            {/* 虚无叙事 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--aurora-blue)', fontSize: '0.7rem', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>
                ── {currentVoidRound.title} ──
              </p>
              <div className="narrative-text" style={{ fontSize: '0.95rem', lineHeight: 2.1, color: 'var(--star-soft)' }}>
                {currentVoidRound.narrative}
              </div>
            </div>

            {/* 效果说明 */}
            <div className="ripple-block" style={{ marginBottom: '1.5rem' }}>
              {currentVoidRound.effectDescription}
              {currentVoidRound.specialType === 'final' && (
                <span style={{ color: 'var(--aurora-cyan)', display: 'block', marginTop: '0.5rem', fontSize: '0.82rem' }}>
                  此轮使用任何遗物，效果翻倍。
                </span>
              )}
            </div>

            {/* 选择遗物（player-acts阶段） */}
            {phase === 'player-acts' && (
              <div className="animate-fadeIn">
                <p style={{ color: 'var(--star-muted)', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                  选择以何应对，或无所为
                </p>
                <div className="space-y-2">
                  {availableRelics.map(relic => (
                    <button
                      key={relic.id}
                      className="choice-btn"
                      style={{
                        borderColor: selectedRelic?.id === relic.id ? 'var(--aurora-blue)' : undefined,
                        background: selectedRelic?.id === relic.id ? 'rgba(74,158,255,0.08)' : undefined,
                      }}
                      onClick={() => setSelectedRelic(prev => prev?.id === relic.id ? null : relic)}
                    >
                      <div style={{ color: 'var(--star-white)', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                        {relic.name}
                      </div>
                      <div style={{ color: 'var(--star-muted)', fontSize: '0.75rem' }}>
                        {relic.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 回合结果 */}
            {phase === 'result' && roundResult && (
              <div className="animate-fadeIn">
                {selectedRelic && (
                  <div className="ripple-block" style={{ borderColor: 'rgba(74,158,255,0.3)', marginBottom: '1rem' }}>
                    {selectedRelic.useNarrative}
                  </div>
                )}
                <div style={{
                  padding: '1rem',
                  background: 'rgba(74,158,255,0.04)',
                  border: '1px solid rgba(74,158,255,0.12)',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--star-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    {roundResult.action}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--star-soft)', fontSize: '1.5rem', fontFamily: 'monospace' }}>
                      {roundResult.worldBefore}
                    </span>
                    <span style={{ color: 'var(--star-muted)', fontSize: '0.8rem' }}>→</span>
                    <span style={{
                      fontSize: '1.5rem',
                      fontFamily: 'monospace',
                      color: roundResult.worldAfter < roundResult.worldBefore
                        ? 'var(--nova-red)'
                        : roundResult.worldAfter > roundResult.worldBefore
                          ? 'var(--aurora-cyan)'
                          : 'var(--star-white)',
                    }}>
                      {roundResult.worldAfter}
                    </span>
                  </div>
                  <p style={{ color: 'var(--star-muted)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                    存活世界数
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div style={{ padding: '1rem 1.75rem 1.5rem', borderTop: '1px solid rgba(74,158,255,0.08)', flexShrink: 0 }}>
            {phase === 'void-speaks' && (
              <button
                className="btn-primary w-full"
                style={{ letterSpacing: '0.2em' }}
                onClick={() => setPhase('player-acts')}
              >
                以何应对
              </button>
            )}
            {phase === 'player-acts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="btn-primary w-full"
                  onClick={handleConfirmAct}
                >
                  {selectedRelic ? `使用「${selectedRelic.name}」` : '无所为，承受虚无'}
                </button>
                {selectedRelic && (
                  <button
                    className="btn-secondary w-full"
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => setSelectedRelic(null)}
                  >
                    取消选择
                  </button>
                )}
              </div>
            )}
            {phase === 'result' && (
              <button
                className="btn-primary w-full"
                style={{ letterSpacing: '0.2em' }}
                onClick={handleNextRound}
              >
                {state.confrontationSession?.finished
                  ? '见证结局'
                  : `迎接第 ${currentRound + 1} 轮`}
              </button>
            )}
          </div>
        </div>

        {/* ── 右栏：遗物栏 ── */}
        <div className="parchment-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <p style={{ color: 'var(--star-muted)', fontSize: '0.7rem', letterSpacing: '0.2em', textAlign: 'center', marginBottom: '1.25rem' }}>
              携带的遗物
            </p>

            {sessionRelics.length === 0 ? (
              <p style={{ color: 'var(--star-dim)', fontSize: '0.8rem', textAlign: 'center', lineHeight: 2, opacity: 0.5 }}>
                你两手空空来到这里
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessionRelics.map(relic => (
                  <div
                    key={relic.id}
                    style={{
                      padding: '0.75rem',
                      background: relic.used ? 'rgba(255,255,255,0.01)' : 'rgba(74,158,255,0.04)',
                      border: `1px solid ${relic.used ? 'rgba(255,255,255,0.04)' : 'rgba(74,158,255,0.15)'}`,
                      borderRadius: '5px',
                      opacity: relic.used ? 0.4 : 1,
                    }}
                  >
                    <div style={{
                      color: relic.used ? 'var(--star-dim)' : 'var(--star-white)',
                      fontSize: '0.82rem',
                      marginBottom: '0.25rem',
                      textDecoration: relic.used ? 'line-through' : 'none',
                    }}>
                      {relic.name}
                    </div>
                    <div style={{ color: 'var(--star-muted)', fontSize: '0.7rem', lineHeight: 1.5 }}>
                      来自 {relic.worldName}
                    </div>
                    {relic.used && (
                      <div style={{ color: 'var(--star-dim)', fontSize: '0.68rem', marginTop: '0.25rem' }}>
                        已消耗
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
