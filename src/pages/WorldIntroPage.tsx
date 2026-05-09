// ============================================================
// 世界简介页
// ============================================================

import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { useGameLogic } from '@/hooks/useGameLogic'
import { drawRandomWorld } from '@/data/worlds'
import { generateFullWorldData } from '@/services/ai'
import { getWorldHistory, getWorldFrameByName, saveWorldFrame } from '@/services/db'
import { TEXT } from '@/constants/text'

export function WorldIntroPage() {
  const { state, dispatch, navigateTo } = useApp()
  const { startExploration } = useGameLogic()
  const [isRerolling, setIsRerolling] = useState(false)

  const world = state.currentWorld
  if (!world) { navigateTo('home'); return null }

  const handleReroll = async () => {
    if (isRerolling) return

    if (state.mode === 'ancient') {
      const next = drawRandomWorld(world.id)
      dispatch({ type: 'SET_CURRENT_WORLD', world: next })
    } else {
      if (!state.settings.aiApiUrl || !state.settings.aiApiKeyEncrypted) {
        navigateTo('home')
        return
      }
      setIsRerolling(true)
      try {
        const names = ['虚空之境', '时光回廊', '星骸大陆', '幽灵港湾', '彼岸花园', '暗流之城', '沉默山脉', '织梦之海']
        const name = names[Math.floor(Math.random() * names.length)]
        const [existingFrame, history] = await Promise.all([
          getWorldFrameByName(name).catch(() => null),
          getWorldHistory(name).catch(() => null),
        ])
        const { world: next, frame } = await generateFullWorldData(
          name, state.settings, existingFrame, history, () => {}
        )
        if (!existingFrame) {
          await saveWorldFrame(frame).catch(() => {})
        }
        dispatch({ type: 'SET_CURRENT_WORLD', world: next })
      } catch {
        navigateTo('home')
      } finally {
        setIsRerolling(false)
      }
    }
  }

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
            disabled={isRerolling}
          >
            {TEXT.ENTER_WORLD}
          </button>
          <button
            className="btn-secondary"
            onClick={() => void handleReroll()}
            disabled={isRerolling}
          >
            {isRerolling ? '正在选择…' : '重新选择'}
          </button>
        </div>
      </div>
    </div>
  )
}
