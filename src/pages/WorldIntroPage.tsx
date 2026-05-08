// ============================================================
// 世界简介页
// ============================================================

import { useApp } from '@/store/AppContext'
import { useGameLogic } from '@/hooks/useGameLogic'
import { TEXT } from '@/constants/text'

export function WorldIntroPage() {
  const { state, dispatch, navigateTo } = useApp()
  const { startExploration } = useGameLogic()
  const world = state.currentWorld

  if (!world) { navigateTo('home'); return null }

  return (
    <div className="game-container">
      <div className="parchment-card p-8 w-full max-w-lg animate-fadeIn">

        <div className="text-center mb-6">
          <span className="stamp mb-4 block">{state.mode === 'ancient' ? TEXT.MODE_TAG_ANCIENT : TEXT.MODE_TAG_BOUNDLESS}</span>
          <h2 className="world-title mt-3">{world.name}</h2>
        </div>

        <hr className="divider" />

        <div className="narrative-text mb-8">{world.description}</div>

        <hr className="divider" />

        {/* 属性预览 */}
        <div className="mb-8">
          <p style={{ color: 'var(--star-muted)', fontSize: '0.75rem', letterSpacing: '0.2em', textAlign: 'center', marginBottom: '1rem' }}>
            此界将以四维度记录你的旅途
          </p>
          <div className="grid grid-cols-2 gap-3">
            {world.attributes.map((attr) => (
              <div key={attr.key} style={{
                padding: '0.75rem 1rem',
                background: 'rgba(74,158,255,0.04)',
                border: '1px solid rgba(74,158,255,0.12)',
                borderRadius: '6px',
                textAlign: 'center',
              }}>
                <div style={{ color: 'var(--star-white)', fontSize: '0.9rem', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  {attr.name}
                </div>
                <div style={{ color: 'var(--star-muted)', fontSize: '0.75rem', lineHeight: '1.5' }}>
                  {attr.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            className="btn-primary"
            style={{ letterSpacing: '0.25em', padding: '1rem' }}
            onClick={() => void startExploration(world)}
          >
            {TEXT.ENTER_WORLD}
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              dispatch({ type: 'SET_CURRENT_WORLD', world: null })
              navigateTo('home')
            }}
          >
            {TEXT.SKIP_WORLD}
          </button>
        </div>
      </div>
    </div>
  )
}
