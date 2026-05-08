// ============================================================
// 万界拾遗 · 对峙结果页面
// ============================================================

import { useApp } from '@/store/AppContext'

export function ConfrontationResultPage() {
  const { state, dispatch, navigateTo } = useApp()
  const { confrontationSession } = state

  if (!confrontationSession) {
    navigateTo('home')
    return null
  }

  const { victory, worldCount, initialWorldCount, roundHistory } = confrontationSession

  const handleReturn = () => {
    if (!victory) {
      dispatch({ type: 'RESET_CYCLE' })
    }
    dispatch({ type: 'SET_CONFRONTATION', session: null })
    navigateTo('home')
  }

  return (
    <div className="game-container" style={{ padding: '6rem 1.5rem 2rem' }}>
      <div className="parchment-card p-8 w-full max-w-2xl animate-fadeIn">

        {/* 装饰 */}
        <div className="text-center mb-6">
          <div
            className="animate-twinkle mb-4"
            style={{
              color: victory ? 'rgba(74,158,255,0.6)' : 'rgba(239,68,68,0.5)',
              fontSize: '1rem',
              letterSpacing: '0.8rem',
            }}
          >
            {victory ? '✦ ✦ ✦' : '· · ·'}
          </div>
          <h2
            className="world-title"
            style={{ fontSize: '1.6rem', letterSpacing: '0.35em' }}
          >
            {victory ? '片刻喘息' : '归于虚无'}
          </h2>
        </div>

        <hr className="divider" />

        {/* 结局叙事 */}
        <div className="narrative-text mb-6" style={{ lineHeight: '2.2' }}>
          {victory ? `你撑住了。

不是战胜，不是消灭，只是撑住了。虚无还在那里，它从来没有离开过，它只是暂时停止了蔓延——就像潮水退去，只是退去，不是消失。

${worldCount} 个世界还活着。它们不知道刚刚发生了什么，它们只是继续存在着，就像它们一直做的那样。也许这就够了。也许存在本身，就是对虚无最有力的回答。

宇宙得到了片刻喘息。` : `你没能撑住。

不是失败，是不够。你带来的一切，你从那些世界里带走的记忆、感知、气味、目光——在虚无面前，还不够重。

所有世界在虚无的静默里，慢慢忘记了如何存在。

但你还在。你见过那些世界，你知道它们存在过。也许下一次，你能带来更多。`}
        </div>

        <hr className="divider" />

        {/* 对峙记录 */}
        <div className="mb-6">
          <p style={{ color: 'var(--star-muted)', fontSize: '0.72rem', letterSpacing: '0.18em', marginBottom: '1rem' }}>
            对峙记录
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {roundHistory.map((record) => (
              <div
                key={record.round}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(74,158,255,0.08)',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: 'var(--star-muted)', minWidth: '3rem' }}>第{record.round}轮</span>
                <span style={{ color: 'var(--star-soft)', flex: 1 }}>{record.playerAction}</span>
                <span style={{ fontFamily: 'monospace', color: record.worldCountAfter < record.worldCountBefore ? 'var(--nova-red)' : 'var(--aurora-cyan)' }}>
                  {record.worldCountBefore} → {record.worldCountAfter}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 统计 */}
        <div
          className="mb-6 p-4 text-center"
          style={{
            background: victory ? 'rgba(74,158,255,0.05)' : 'rgba(239,68,68,0.05)',
            border: `1px solid ${victory ? 'rgba(74,158,255,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '6px',
          }}
        >
          <p style={{ color: 'var(--star-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            {victory ? `${initialWorldCount} 个世界参与了这场对峙，${worldCount} 个存活至今` : `${initialWorldCount} 个世界，最终归于虚无`}
          </p>
          {!victory && (
            <p style={{ color: 'var(--nova-red)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
              本周目的积累已清零，成就记录永久保留
            </p>
          )}
        </div>

        <button
          className="btn-primary w-full"
          style={{ letterSpacing: '0.2em' }}
          onClick={handleReturn}
        >
          {victory ? '归返' : '重新启程'}
        </button>
      </div>
    </div>
  )
}
