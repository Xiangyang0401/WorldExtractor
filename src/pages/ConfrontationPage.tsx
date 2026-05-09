// ============================================================
// 宇宙尽头 · 对峙页面：与虚无的对峙
// ============================================================

import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { VOID_ROUNDS, executeRound } from '@/data/confrontation'
import type { Relic } from '@/types'

/** 将 effectType + effectValue 转成一句具体说明 */
function relicEffectText(relic: Relic): string {
  const v = relic.effectValue
  switch (relic.effectType) {
    case 'shield':         return `抵挡虚无摧毁 ${v} 个世界`
    case 'revive':         return `复活 ${v} 个已消亡的世界`
    case 'answer':         return `回应虚无叩问，完全抵消第3轮伤害`
    case 'protect_relics': return `保护所有遗物免遭侵蚀（第2轮有效）`
    case 'auto':           return `第 ${relic.autoTriggerRound} 轮自动触发，抵挡 ${v} 个世界的消亡`
    case 'reduce_final':   return `减免终焉 ${v} 个世界的消亡（第5轮有效）`
    case 'delay':          return `将本轮伤害推迟到下一轮结算（慎用：下轮双倍承受）`
    case 'mirror':         return `照见虚无本体，完全抵消本轮全部伤害，但随机失去一件其他遗物`
    default:               return ''
  }
}

export function ConfrontationPage() {
  const { state, dispatch, navigateTo } = useApp()
  const { confrontationSession } = state

  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  // phase: 'void-speaks' 读叙事+做选择 | 'pick-relic' 选遗物 | 'result' 展示结果
  const [phase, setPhase] = useState<'void-speaks' | 'pick-relic' | 'result'>('void-speaks')
  // result 阶段用的快照，避免 session 更新后数据变化
  const [roundSnapshot, setRoundSnapshot] = useState<{
    round: number
    worldBefore: number
    worldAfter: number
    action: string
    useNarrative: string | null
  } | null>(null)

  if (!confrontationSession) { navigateTo('home'); return null }

  const { currentRound, worldCount, relics: sessionRelics, finished } = confrontationSession

  if (finished) { navigateTo('confrontation-result'); return null }

  const currentVoidRound = VOID_ROUNDS[currentRound - 1]
  if (!currentVoidRound) return null

  const isErosionRound = currentVoidRound.specialType === 'erosion'
  const isPickingRelic = phase === 'pick-relic'

  // 侵蚀轮：只有 protect_relics 类型有效；其他轮：除 auto 外都可用
  const availableRelics = sessionRelics.filter(r => {
    if (r.used) return false
    if (r.effectType === 'auto') return false
    if (isErosionRound) return r.effectType === 'protect_relics'
    return true
  })

  const handleConfirmAct = (relic: Relic | null) => {
    const snapshot = {
      round: currentRound,
      worldBefore: confrontationSession.worldCount,
      worldAfter: 0,
      action: '',
      useNarrative: relic ? relic.useNarrative : null,
    }
    const newSession = executeRound(confrontationSession, relic)
    const lastRecord = newSession.roundHistory[newSession.roundHistory.length - 1]
    snapshot.worldAfter = lastRecord.worldCountAfter
    snapshot.action = lastRecord.playerAction

    setRoundSnapshot(snapshot)
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
      setRoundSnapshot(null)
      setSelectedRelic(null)
    }
  }

  return (
    <div className="game-container" style={{ padding: '4rem 1.5rem 2rem' }}>
      <div className="w-full animate-fadeIn" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '1.25rem',
        maxWidth: 1000,
        alignItems: 'stretch',
        minHeight: 600,
      }}>

        {/* ── 左栏：主内容 ── */}
        <div className="parchment-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* 顶部状态栏 */}
          <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid rgba(74,158,255,0.08)', flexShrink: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 style={{ color: 'var(--star-white)', fontSize: '1.1rem', letterSpacing: '0.15em', margin: 0 }}>
                  与虚无的对峙
                </h3>
                <p style={{ color: 'var(--star-muted)', fontSize: '0.78rem', margin: '0.2rem 0 0', letterSpacing: '0.1em' }}>
                  第 {phase === 'result' && roundSnapshot ? roundSnapshot.round : currentRound} 轮 / 共 5 轮
                </p>
              </div>
              <div className="text-center">
                <p style={{ color: 'var(--aurora-cyan)', fontSize: '0.7rem', letterSpacing: '0.15em', margin: 0 }}>存活世界</p>
                <p style={{ color: 'var(--star-white)', fontSize: '1.8rem', fontFamily: 'monospace', margin: 0, lineHeight: 1.2 }}>
                  {phase === 'result' && roundSnapshot ? roundSnapshot.worldAfter : worldCount}
                </p>
              </div>
            </div>
            <div className="progress-bar mt-3">
              <div className="progress-bar-fill" style={{
                width: `${(((phase === 'result' && roundSnapshot ? roundSnapshot.round : currentRound) - 1) / 5) * 100}%`
              }} />
            </div>
          </div>

          {/* 中间内容区 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', paddingRight: '1.25rem' }}>

            {/* result 阶段：只展示本轮结果 */}
            {phase === 'result' && roundSnapshot && (
              <div className="animate-fadeIn">
                <p style={{ color: 'var(--aurora-blue)', fontSize: '0.7rem', letterSpacing: '0.25em', marginBottom: '1.25rem' }}>
                  ── 第 {roundSnapshot.round} 轮结果 ──
                </p>

                {roundSnapshot.useNarrative && (
                  <div className="ripple-block" style={{ borderColor: 'rgba(74,158,255,0.3)', marginBottom: '1.25rem' }}>
                    {roundSnapshot.useNarrative}
                  </div>
                )}

                <div style={{
                  padding: '1.25rem',
                  background: 'rgba(74,158,255,0.04)',
                  border: '1px solid rgba(74,158,255,0.12)',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--star-muted)', fontSize: '0.8rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                    {roundSnapshot.action}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                    <div>
                      <p style={{ color: 'var(--star-dim)', fontSize: '0.68rem', margin: '0 0 0.2rem' }}>原有</p>
                      <span style={{ color: 'var(--star-soft)', fontSize: '2rem', fontFamily: 'monospace' }}>
                        {roundSnapshot.worldBefore}
                      </span>
                    </div>
                    <span style={{ color: 'var(--star-muted)', fontSize: '1rem' }}>→</span>
                    <div>
                      <p style={{ color: 'var(--star-dim)', fontSize: '0.68rem', margin: '0 0 0.2rem' }}>现存</p>
                      <span style={{
                        fontSize: '2rem',
                        fontFamily: 'monospace',
                        color: roundSnapshot.worldAfter < roundSnapshot.worldBefore
                          ? 'var(--nova-red)'
                          : roundSnapshot.worldAfter > roundSnapshot.worldBefore
                            ? 'var(--aurora-cyan)'
                            : 'var(--star-white)',
                      }}>
                        {roundSnapshot.worldAfter}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* void-speaks / pick-relic 阶段：展示虚无叙事和效果说明 */}
            {phase !== 'result' && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: 'var(--aurora-blue)', fontSize: '0.7rem', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>
                    ── {currentVoidRound.title} ──
                  </p>
                  <div className="narrative-text" style={{ fontSize: '0.95rem', lineHeight: 2.1, color: 'var(--star-soft)' }}>
                    {currentVoidRound.narrative}
                  </div>
                </div>

                <div className="ripple-block" style={{ marginBottom: '1.5rem' }}>
                  {currentVoidRound.effectDescription}
                  {currentVoidRound.specialType === 'final' && (
                    <span style={{ color: 'var(--aurora-cyan)', display: 'block', marginTop: '0.5rem', fontSize: '0.82rem' }}>
                      此轮使用任何遗物，效果翻倍。
                    </span>
                  )}
                  {confrontationSession.pendingDelayDamage > 0 && (
                    <span style={{ color: 'var(--nova-red)', display: 'block', marginTop: '0.5rem', fontSize: '0.82rem' }}>
                      ⚠ 上轮延迟的 {confrontationSession.pendingDelayDamage} 点伤害将在本轮一并结算。
                    </span>
                  )}
                </div>

                {/* 侵蚀轮专属提示 */}
                {isErosionRound && phase === 'void-speaks' && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--star-soft)',
                    lineHeight: 1.7,
                  }}>
                    若不作为，虚无将随机摧毁你携带的一件遗物。<br />
                    持有「保护遗物」类遗物可完全抵御侵蚀。
                  </div>
                )}

                {/* 选遗物提示 */}
                {isPickingRelic && (
                  <div className="animate-fadeIn" style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: '6px',
                  }}>
                    <p style={{ color: 'var(--aurora-purple)', fontSize: '0.8rem', letterSpacing: '0.1em', margin: 0 }}>
                      {availableRelics.length > 0
                        ? isErosionRound
                          ? '在右侧选择「保护遗物」类遗物使用'
                          : '在右侧遗物面板中选择一件遗物使用'
                        : isErosionRound
                          ? '没有可用的保护遗物，只能承受侵蚀'
                          : '没有可用的遗物，只能不作为'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 底部按钮 */}
          <div style={{ padding: '1rem 1.75rem 1.5rem', borderTop: '1px solid rgba(74,158,255,0.08)', flexShrink: 0 }}>
            {phase === 'void-speaks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="btn-primary w-full"
                  style={{ letterSpacing: '0.15em' }}
                  onClick={() => setPhase('pick-relic')}
                >
                  使用世界遗物
                </button>
                <button
                  className="btn-secondary w-full"
                  style={{ fontSize: '0.88rem' }}
                  onClick={() => handleConfirmAct(null)}
                >
                  {isErosionRound ? '承受侵蚀' : '不作为'}
                </button>
              </div>
            )}
            {phase === 'pick-relic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedRelic ? (
                  <button
                    className="btn-primary w-full"
                    style={{ letterSpacing: '0.1em' }}
                    onClick={() => handleConfirmAct(selectedRelic)}
                  >
                    确认使用「{selectedRelic.name}」
                  </button>
                ) : (
                  <button className="btn-primary w-full" disabled style={{ opacity: 0.4, letterSpacing: '0.1em' }}>
                    在右侧选择遗物
                  </button>
                )}
                <button
                  className="btn-secondary w-full"
                  style={{ fontSize: '0.88rem' }}
                  onClick={() => { setPhase('void-speaks'); setSelectedRelic(null) }}
                >
                  返回
                </button>
              </div>
            )}
            {phase === 'result' && roundSnapshot && (
              <button
                className="btn-primary w-full"
                style={{ letterSpacing: '0.2em' }}
                onClick={handleNextRound}
              >
                {state.confrontationSession?.finished
                  ? '见证结局'
                  : `迎接第 ${roundSnapshot.round + 1} 轮`}
              </button>
            )}
          </div>
        </div>

        {/* ── 右栏：遗物栏 ── */}
        <div className="parchment-card" style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          borderColor: isPickingRelic ? 'rgba(139,92,246,0.5)' : undefined,
          boxShadow: isPickingRelic
            ? '0 0 0 1px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.15)'
            : undefined,
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <p style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textAlign: 'center',
              marginBottom: '1.25rem',
              color: isPickingRelic ? 'var(--aurora-purple)' : 'var(--star-muted)',
              transition: 'color 0.3s ease',
            }}>
              {isPickingRelic ? '选择一件遗物' : '携带的遗物'}
            </p>

            {sessionRelics.length === 0 ? (
              <p style={{ color: 'var(--star-dim)', fontSize: '0.8rem', textAlign: 'center', lineHeight: 2, opacity: 0.5 }}>
                你两手空空来到这里
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessionRelics.map(relic => {
                  const isAvailable = !relic.used && relic.effectType !== 'auto'
                  const isClickable = isPickingRelic && availableRelics.some(r => r.id === relic.id)
                  const isSelected = selectedRelic?.id === relic.id
                  // 侵蚀轮时，可用但类型不对的遗物显示为不可用状态
                  const isWrongType = isPickingRelic && isAvailable && !isClickable

                  return (
                    <div
                      key={relic.id}
                      onClick={() => {
                        if (!isClickable) return
                        setSelectedRelic(prev => prev?.id === relic.id ? null : relic)
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '5px',
                        cursor: isClickable ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        opacity: relic.used || isWrongType ? 0.35 : 1,
                        background: isSelected
                          ? 'rgba(139,92,246,0.12)'
                          : isPickingRelic && isClickable
                            ? 'rgba(139,92,246,0.04)'
                            : relic.used ? 'rgba(255,255,255,0.01)' : 'rgba(74,158,255,0.04)',
                        border: isSelected
                          ? '1px solid rgba(139,92,246,0.6)'
                          : isPickingRelic && isClickable
                            ? '1px solid rgba(139,92,246,0.25)'
                            : `1px solid ${relic.used ? 'rgba(255,255,255,0.04)' : 'rgba(74,158,255,0.15)'}`,
                        boxShadow: isSelected ? '0 0 12px rgba(139,92,246,0.2)' : undefined,
                      }}
                    >
                      <div style={{
                        color: relic.used ? 'var(--star-dim)' : isSelected ? 'var(--aurora-purple)' : 'var(--star-white)',
                        fontSize: '0.82rem',
                        marginBottom: '0.3rem',
                        textDecoration: relic.used ? 'line-through' : 'none',
                      }}>
                        {relic.name}
                      </div>
                      <div style={{ color: 'var(--star-muted)', fontSize: '0.68rem', marginBottom: '0.4rem' }}>
                        来自 {relic.worldName}
                      </div>
                      {!relic.used && (
                        <div style={{
                          color: isSelected ? 'rgba(139,92,246,0.9)' : 'var(--aurora-cyan)',
                          fontSize: '0.7rem',
                          lineHeight: 1.5,
                          padding: '0.3rem 0.5rem',
                          background: 'rgba(34,211,238,0.04)',
                          border: '1px solid rgba(34,211,238,0.1)',
                          borderRadius: '3px',
                        }}>
                          {relicEffectText(relic)}
                        </div>
                      )}
                      {relic.used && (
                        <div style={{ color: 'var(--star-dim)', fontSize: '0.68rem', marginTop: '0.1rem' }}>已消耗</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
