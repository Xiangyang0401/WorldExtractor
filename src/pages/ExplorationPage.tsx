// ============================================================
// 探索页面
// ============================================================

import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { useGameLogic } from '@/hooks/useGameLogic'
import { AttributePanel } from '@/components/AttributePanel'
import { ExitConfirmDialog } from '@/components/ExitConfirmDialog'
import { TEXT } from '@/constants/text'
import type { Choice } from '@/types'
import { applyAttributeDeltas } from '@/utils'

export function ExplorationPage() {
  const { state } = useApp()
  const { makeChoice, abandonExploration } = useGameLogic()
  const { activeSession, currentWorld } = state

  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null)
  const [phase, setPhase] = useState<'choosing' | 'consequence'>('choosing')
  const [showExitDialog, setShowExitDialog] = useState(false)

  if (!activeSession || !currentWorld) return null
  const currentEvent = currentWorld.events[activeSession.currentEventIndex]
  if (!currentEvent) return null

  const eventNumber = activeSession.currentEventIndex + 1
  const isLastEvent = activeSession.currentEventIndex >= currentWorld.events.length - 1
  const previewAttributes = selectedChoice
    ? applyAttributeDeltas(activeSession.currentAttributes, selectedChoice.attributeDeltas)
    : null

  const handleSelectChoice = (choice: Choice) => {
    if (phase !== 'choosing') return
    setSelectedChoice(choice)
    setPhase('consequence')
  }

  const handleConfirmConsequence = () => {
    if (!selectedChoice) return
    commitChoice()
  }

  const commitChoice = () => {
    if (!selectedChoice) return
    makeChoice(selectedChoice)
    setSelectedChoice(null)
    setPhase('choosing')
  }

  // 底部固定区域：选择阶段是选项列表，其他阶段是确认按钮
  const renderBottom = () => {
    if (phase === 'choosing') {
      return (
        <div className="space-y-1.5">
          {currentEvent.choices.map((choice) => (
            <button key={choice.id} className="choice-btn" onClick={() => handleSelectChoice(choice)}>
              {choice.text}
            </button>
          ))}
        </div>
      )
    }
    if (phase === 'consequence' && selectedChoice) {
      return (
        <button className="btn-primary w-full" onClick={handleConfirmConsequence}>
          {isLastEvent ? '走向归宿' : '继续探索'}
        </button>
      )
    }
    return null
  }

  // 中间滚动内容
  const renderScrollContent = () => {
    if (phase === 'choosing') {
      return <div className="narrative-text">{currentEvent.narrative}</div>
    }
    if (phase === 'consequence' && selectedChoice) {
      return (
        <div className="animate-fadeIn">
          <p style={{ color: 'var(--star-muted)', fontSize: '0.78rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            你选择了：{selectedChoice.text}
          </p>
          <div className="narrative-text mb-5">{selectedChoice.consequence}</div>
          {Object.keys(selectedChoice.attributeDeltas).length > 0 && previewAttributes && (
            <div className="attr-change-panel">
              <p style={{ color: 'var(--aurora-blue)', fontSize: '0.72rem', letterSpacing: '0.18em', marginBottom: '0.75rem' }}>
                {TEXT.ATTRIBUTE_CHANGE}
              </p>
              <AttributePanel
                world={currentWorld}
                currentAttributes={previewAttributes}
                deltas={selectedChoice.attributeDeltas}
                compact
              />
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="game-container" style={{ padding: '6rem 1.5rem 2rem' }}>
      <div className="w-full animate-fadeIn" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '1.25rem',
        maxWidth: 1100,
        alignItems: 'stretch',
        height: 700,
      }}>

        {/* ── 左栏：三层结构 ── */}
        <div className="parchment-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* 第一层：顶部固定 — 世界名 + 进度条 + 时间 */}
          <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid rgba(74,158,255,0.08)', flexShrink: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 style={{ color: 'var(--star-white)', fontSize: '1.2rem', letterSpacing: '0.15em', margin: 0 }}>
                  {currentWorld.name}
                </h3>
                <p style={{ color: 'var(--star-muted)', fontSize: '0.78rem', margin: '0.2rem 0 0', letterSpacing: '0.1em' }}>
                  {TEXT.EXPLORATION_INDEX(eventNumber)} / 5
                </p>
              </div>
              <button
                onClick={() => setShowExitDialog(true)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--star-muted)',
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.875rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.08em',
                  transition: 'all 0.2s',
                }}
              >
                {TEXT.EXIT_WARNING_TITLE}
              </button>
            </div>
            <div className="progress-bar mb-3">
              <div className="progress-bar-fill"
                style={{ width: `${(activeSession.currentEventIndex / currentWorld.events.length) * 100}%` }}
              />
            </div>
            <p style={{ color: 'var(--star-muted)', fontSize: '0.78rem', letterSpacing: '0.18em', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
              {currentEvent.time}
            </p>
          </div>

          {/* 第二层：中间可滚动内容 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem', paddingRight: '1.25rem' }}
            className="animate-fadeIn"
            key={`${phase}-${currentEvent.index}`}
          >
            {renderScrollContent()}
          </div>

          {/* 第三层：底部固定 — 选项 / 按钮 */}
          <div style={{ padding: '0.75rem 1.75rem 1.25rem', borderTop: '1px solid rgba(74,158,255,0.08)', flexShrink: 0 }}>
            {renderBottom()}
          </div>
        </div>

        {/* ── 右栏：四维属性 ── */}
        <div className="parchment-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <p style={{ color: 'var(--star-muted)', fontSize: '0.7rem', letterSpacing: '0.2em', textAlign: 'center', marginBottom: '1.25rem' }}>
              此界四维
            </p>
            <AttributePanel
              world={currentWorld}
              currentAttributes={previewAttributes ?? activeSession.currentAttributes}
            />
            <hr className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {currentWorld.attributes.map((attr) => (
                <div key={attr.key} style={{
                  padding: '0.6rem 0.75rem',
                  background: 'rgba(74,158,255,0.04)',
                  border: '1px solid rgba(74,158,255,0.1)',
                  borderRadius: '5px',
                }}>
                  <div style={{ color: 'var(--aurora-blue)', fontSize: '0.82rem', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>
                    {attr.name}
                  </div>
                  <div style={{ color: 'var(--star-muted)', fontSize: '0.7rem', lineHeight: 1.6 }}>
                    {attr.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {showExitDialog && (
        <ExitConfirmDialog
          onConfirm={abandonExploration}
          onCancel={() => setShowExitDialog(false)}
        />
      )}
    </div>
  )
}
