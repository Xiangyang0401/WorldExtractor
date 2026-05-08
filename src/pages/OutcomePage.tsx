// ============================================================
// 结局页面
// ============================================================

import { useApp } from '@/store/AppContext'
import { AttributePanel } from '@/components/AttributePanel'
import { TEXT } from '@/constants/text'
import type { WorldOutcome, AchievementRecord } from '@/types'

export function OutcomePage() {
  const { state, dispatch, navigateTo } = useApp()
  const { currentWorld } = state

  if (!currentWorld) { navigateTo('home'); return null }

  const world = currentWorld as typeof currentWorld & {
    _resolvedOutcome?: WorldOutcome
    _achievement?: AchievementRecord
  }
  const outcome = world._resolvedOutcome
  const achievement = world._achievement

  if (!outcome) { navigateTo('home'); return null }

  const finalAttributes = achievement?.finalAttributes ?? {}

  // 找到本次获得的遗物（刚刚加入 relics 的最后一个）
  const newRelic = outcome.relic ?? null

  return (
    <div className="game-container" style={{ padding: '4rem 1.5rem 2rem' }}>
      <div className="parchment-card p-8 w-full max-w-lg animate-fadeIn">

        {/* 顶部装饰 */}
        <div className="text-center mb-6">
          <div className="animate-twinkle mb-3" style={{ color: 'rgba(74,158,255,0.5)', fontSize: '0.8rem', letterSpacing: '0.8rem' }}>
            ✦ ✦ ✦
          </div>
          <p style={{ color: 'var(--star-muted)', fontSize: '0.75rem', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>
            {TEXT.OUTCOME_TITLE}
          </p>
          <h2 className="world-title" style={{ fontSize: '1.8rem', letterSpacing: '0.35em' }}>
            {outcome.name}
          </h2>
        </div>

        <hr className="divider" />

        <div className="narrative-text mb-6">{outcome.narrative}</div>

        <hr className="divider" />

        {/* 成就解锁 */}
        {achievement && (
          <div className="mb-4 p-4 text-center" style={{
            background: 'rgba(74,158,255,0.05)',
            border: '1px solid rgba(74,158,255,0.2)',
            borderRadius: '6px',
          }}>
            <p style={{ color: 'var(--aurora-blue)', fontSize: '0.72rem', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>
              {TEXT.ACHIEVEMENT_UNLOCKED}
            </p>
            <p style={{ color: 'var(--star-white)', fontSize: '1rem', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              {achievement.achievementName}
            </p>
            <p style={{ color: 'var(--star-soft)', fontSize: '0.85rem', lineHeight: '1.7' }}>
              {achievement.achievementDescription}
            </p>
          </div>
        )}

        {/* 获得遗物 */}
        {newRelic && (
          <div className="mb-4 p-4" style={{
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '6px',
          }}>
            <p style={{ color: 'rgba(139,92,246,0.9)', fontSize: '0.72rem', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>
              获得遗物
            </p>
            <p style={{ color: 'var(--star-white)', fontSize: '0.95rem', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              {newRelic.name}
            </p>
            <p style={{ color: 'var(--star-soft)', fontSize: '0.82rem', lineHeight: '1.7' }}>
              {newRelic.description}
            </p>
          </div>
        )}

        {/* 世界终态 */}
        <div className="mb-6">
          <p style={{ color: 'var(--star-muted)', fontSize: '0.72rem', letterSpacing: '0.2em', marginBottom: '1rem' }}>
            {TEXT.FINAL_STATE}
          </p>
          <AttributePanel world={currentWorld} currentAttributes={finalAttributes} />
        </div>

        <button
          className="btn-primary w-full"
          style={{ letterSpacing: '0.25em' }}
          onClick={() => {
            dispatch({ type: 'SET_CURRENT_WORLD', world: null })
            dispatch({ type: 'SET_ACTIVE_SESSION', session: null })
            navigateTo('home')
          }}
        >
          {TEXT.BACK_TO_HOME}
        </button>
      </div>
    </div>
  )
}
