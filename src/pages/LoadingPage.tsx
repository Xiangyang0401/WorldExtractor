// ============================================================
// 加载页面
// ============================================================

import { useApp } from '@/store/AppContext'

export function LoadingPage() {
  const { state } = useApp()
  const { loadingText, loadingPercent } = state

  return (
    <div className="game-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="text-center animate-fadeInSlow">

        {/* 星环动画 */}
        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 2rem' }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '1px solid rgba(74,158,255,0.2)',
            borderTopColor: 'rgba(74,158,255,0.8)',
            borderRadius: '50%',
            animation: 'spin 1.5s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 8,
            border: '1px solid rgba(139,92,246,0.15)',
            borderBottomColor: 'rgba(139,92,246,0.6)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite reverse',
          }} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'rgba(74,158,255,0.6)', fontSize: '1.2rem',
          }}>
            ✦
          </div>
        </div>

        {/* 进度条 */}
        <div className="progress-bar mb-5" style={{ width: 200, margin: '0 auto 1.5rem' }}>
          <div className="progress-bar-fill" style={{ width: `${loadingPercent}%` }} />
        </div>

        <p style={{ color: 'var(--star-soft)', fontSize: '0.88rem', letterSpacing: '0.2em', opacity: 0.8 }}>
          {loadingText}
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
