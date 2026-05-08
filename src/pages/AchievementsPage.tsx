// ============================================================
// 渡痕（成就）页面
// ============================================================

import { useState, useEffect } from 'react'
import { useApp } from '@/store/AppContext'
import { useGameLogic } from '@/hooks/useGameLogic'
import { TEXT } from '@/constants/text'
import { formatTimestamp } from '@/utils'
import type { AchievementRecord } from '@/types'

export function AchievementsPage() {
  const { state, navigateTo, achievements } = useApp()
  const { loadAchievements } = useGameLogic()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { void loadAchievements() }, [])

  if (!state.dbReady) return null

  return (
    <div className="game-container">
      <div className="parchment-card p-6 w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="world-title" style={{ fontSize: '1.3rem', letterSpacing: '0.3em', margin: 0 }}>
            {TEXT.ACHIEVEMENTS_TITLE}
          </h2>
          <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => navigateTo('home')}>归返</button>
        </div>

        {achievements.length === 0 ? (
          <p className="text-center py-12" style={{ color: 'var(--star-muted)', fontSize: '0.9rem', lineHeight: '2' }}>
            {TEXT.ACHIEVEMENTS_EMPTY}
          </p>
        ) : (
          <div className="space-y-3">
            {achievements.map((record) => (
              <AchievementCard
                key={record.id}
                record={record}
                expanded={expandedId === record.id}
                onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AchievementCard({ record, expanded, onToggle }: {
  record: AchievementRecord; expanded: boolean; onToggle: () => void
}) {
  return (
    <div className="achievement-card" onClick={onToggle}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="stamp" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
              {record.worldName}
            </span>
          </div>
          <p style={{ color: 'var(--star-white)', fontSize: '0.95rem', letterSpacing: '0.05em', margin: 0 }}>
            {record.achievementName}
          </p>
          <p style={{ color: 'var(--star-muted)', fontSize: '0.78rem', margin: '0.25rem 0 0' }}>
            {record.outcomeName} · {record.identityName}
          </p>
        </div>
        <span style={{ color: 'var(--star-dim)', fontSize: '0.72rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {formatTimestamp(record.completedAt)}
        </span>
      </div>

      {expanded && (
        <div className="mt-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <hr className="divider" style={{ margin: '0.75rem 0' }} />
          <p style={{ color: 'var(--star-soft)', fontSize: '0.85rem', lineHeight: '1.7', marginBottom: '1rem' }}>
            {record.achievementDescription}
          </p>

          <p style={{ color: 'var(--star-muted)', fontSize: '0.72rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            {TEXT.EXPLORATION_HISTORY}
          </p>
          <div className="space-y-2 mb-4">
            {record.choiceHistory.map((event, i) => (
              <div key={i} style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(74,158,255,0.08)',
                borderRadius: '4px',
                fontSize: '0.82rem',
                color: 'var(--star-soft)',
              }}>
                <span style={{ color: 'var(--star-muted)', fontSize: '0.72rem' }}>第 {event.eventIndex} 印</span>
                {' · '}{event.choiceText}
              </div>
            ))}
          </div>

          <p style={{ color: 'var(--star-muted)', fontSize: '0.72rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            {TEXT.FINAL_STATE}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(record.finalAttributes).map(([key, value]) => (
              <div key={key} style={{
                padding: '0.4rem 0.75rem',
                background: 'rgba(74,158,255,0.04)',
                border: '1px solid rgba(74,158,255,0.1)',
                borderRadius: '4px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.82rem',
              }}>
                <span style={{ color: 'var(--star-muted)' }}>{key}</span>
                <span style={{ color: 'var(--aurora-blue)', fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
