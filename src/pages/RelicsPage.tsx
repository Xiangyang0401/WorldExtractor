// ============================================================
// 万界拾遗 · 遗物背包页面
// ============================================================

import { useApp } from '@/store/AppContext'

export function RelicsPage() {
  const { state, navigateTo } = useApp()
  const { relics } = state

  return (
    <div className="game-container" style={{ padding: '4rem 1.5rem 2rem' }}>
      <div className="parchment-card p-6 w-full max-w-lg animate-fadeIn">

        <div className="flex items-center justify-between mb-6">
          <h2 className="world-title" style={{ fontSize: '1.3rem', letterSpacing: '0.3em', margin: 0 }}>
            遗物
          </h2>
          <button
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => navigateTo('home')}
          >
            归返
          </button>
        </div>

        {relics.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--star-muted)', fontSize: '0.9rem', lineHeight: 2 }}>
              你尚未从任何世界带回遗物
            </p>
            <p style={{ color: 'var(--star-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              探索世界，在结局中获得遗物，带往宇宙尽头
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {relics.map((relic) => (
              <div
                key={relic.id}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(139,92,246,0.04)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '6px',
                }}
              >
                {/* 名称和来源 */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p style={{ color: 'var(--star-white)', fontSize: '0.95rem', letterSpacing: '0.05em', margin: 0 }}>
                    {relic.name}
                  </p>
                  <span style={{
                    color: 'rgba(139,92,246,0.8)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    border: '1px solid rgba(139,92,246,0.3)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    来自 {relic.worldName}
                  </span>
                </div>

                {/* 描述 */}
                <p style={{ color: 'var(--star-soft)', fontSize: '0.83rem', lineHeight: '1.7', marginBottom: '0.75rem' }}>
                  {relic.description}
                </p>

                {/* 使用叙事 */}
                <div style={{
                  padding: '0.6rem 0.875rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: 'var(--star-muted)',
                  fontStyle: 'italic',
                  lineHeight: '1.7',
                }}>
                  {relic.useNarrative}
                </div>

                {/* 效果标签 */}
                <div className="mt-2 flex gap-2">
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--aurora-cyan)',
                    border: '1px solid rgba(34,211,238,0.2)',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '20px',
                  }}>
                    {effectTypeLabel(relic.effectType)}
                  </span>
                  {relic.effectType === 'auto' && (
                    <span style={{
                      fontSize: '0.68rem',
                      color: 'var(--star-muted)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '0.1rem 0.5rem',
                      borderRadius: '20px',
                    }}>
                      第{relic.autoTriggerRound}轮自动触发
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {relics.length > 0 && (
          <p style={{
            color: 'var(--star-dim)',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '1.5rem',
            letterSpacing: '0.1em',
          }}>
            共 {relics.length} 件遗物将随你前往宇宙尽头
          </p>
        )}
      </div>
    </div>
  )
}

function effectTypeLabel(type: string): string {
  const map: Record<string, string> = {
    shield: '抵挡伤害',
    revive: '复活世界',
    answer: '回应叩问',
    protect_relics: '保护遗物',
    auto: '自动触发',
    reduce_final: '减免终焉',
  }
  return map[type] ?? type
}
