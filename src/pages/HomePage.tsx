// ============================================================
// 主页 — 左右布局，世界详情内嵌展示
// ============================================================

import { useState, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { useGameLogic } from '@/hooks/useGameLogic'
import { PRESET_WORLDS, drawRandomWorld } from '@/data/worlds'
import { generateFullWorldData } from '@/services/ai'
import { getWorldHistory, getWorldFrameByName, saveWorldFrame } from '@/services/db'
import { TEXT } from '@/constants/text'
import { AttributePanel } from '@/components/AttributePanel'
import { initConfrontationSession } from '@/data/confrontation'
import type { WorldData } from '@/types'

export function HomePage() {
  const { state, dispatch, navigateTo } = useApp()
  const { loadAchievements, startExploration } = useGameLogic()

  const [worldNameInput, setWorldNameInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [previewWorld, setPreviewWorld] = useState<WorldData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateProgress, setGenerateProgress] = useState({ text: '', percent: 0 })

  // ── 生成世界（无界模式）──────────────────────────────────
  const handleGenerateWorld = useCallback(async (name: string) => {
    setInputError('')
    setIsGenerating(true)
    setPreviewWorld(null)
    setGenerateProgress({ text: TEXT.LOADING_WORLD, percent: 0 })
    try {
      // 无界模式：查找已有框架（复用）和历史状态
      const [existingFrame, history] = state.mode === 'boundless'
        ? await Promise.all([
            getWorldFrameByName(name).catch(() => null),
            getWorldHistory(name).catch(() => null),
          ])
        : [null, null]

      console.log('[宇宙尽头] 世界名称:', name)
      console.log('[宇宙尽头] 本地框架:', existingFrame ? `已找到(id=${existingFrame.id})` : '无')
      console.log('[宇宙尽头] 历史状态:', history ? `已找到(探索${history.explorationCount}次，上次结局=${history.lastOutcomeName})` : '无')

      const { world, frame } = await generateFullWorldData(
        name,
        state.settings,
        existingFrame,   // 已有框架则复用，否则 AI 新生成
        history,         // 历史状态传给 AI 生成事件
        (text, percent) => setGenerateProgress({ text, percent })
      )

      // 无界模式：保存框架（首次创建时才会是新的）
      if (state.mode === 'boundless' && !existingFrame) {
        await saveWorldFrame(frame).catch((e) =>
          console.warn('[宇宙尽头] 框架存储失败:', e)
        )
        console.log('[宇宙尽头] 框架已存储:', frame.id, frame.name)
      } else {
        console.log('[宇宙尽头] 复用已有框架，跳过存储')
      }

      setPreviewWorld(world)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      setInputError(`${TEXT.LOADING_FAILED}：${msg}`)
    } finally {
      setIsGenerating(false)
    }
  }, [state.mode, state.settings])

  // ── 渡界（随机抽取）────────────────────────────────────
  const handleDraw = useCallback(async () => {
    setInputError('')
    if (state.mode === 'ancient') {
      const world = drawRandomWorld(previewWorld?.id)
      setPreviewWorld(world)
    } else {
      if (!state.settings.aiApiUrl || !state.settings.aiApiKeyEncrypted) {
        setInputError(TEXT.ERROR_AI_NOT_CONFIGURED)
        return
      }
      const names = ['虚空之境', '时光回廊', '星骸大陆', '幽灵港湾', '彼岸花园', '暗流之城', '沉默山脉', '织梦之海']
      await handleGenerateWorld(names[Math.floor(Math.random() * names.length)])
    }
  }, [state.mode, state.settings, previewWorld, handleGenerateWorld])

  // ── 以名造界────────────────────────────────────────────
  const handleCreateWorld = useCallback(async () => {
    const name = worldNameInput.trim()
    if (!name) { setInputError(TEXT.ERROR_WORLD_NAME_EMPTY); return }
    if (state.mode === 'ancient') {
      const found = PRESET_WORLDS.find((w) => w.name === name)
      if (found) { setPreviewWorld(found); return }
      setInputError('时间废墟模式仅支持预设世界，请切换创世神典模式以创世')
      return
    }
    await handleGenerateWorld(name)
  }, [worldNameInput, state.mode, handleGenerateWorld])

  // ── 确认进入────────────────────────────────────────────
  const handleEnterWorld = useCallback(async () => {
    if (!previewWorld) return
    dispatch({ type: 'SET_CURRENT_WORLD', world: previewWorld })
    await startExploration(previewWorld)
  }, [previewWorld, dispatch, startExploration])

  const handleGoAchievements = useCallback(async () => {
    await loadAchievements()
    navigateTo('achievements')
  }, [loadAchievements, navigateTo])

  const handleGoConfront = useCallback(() => {
    const session = initConfrontationSession(
      state.worldCount,
      state.relics.map(r => ({ ...r, used: false }))
    )
    dispatch({ type: 'SET_CONFRONTATION', session })
    navigateTo('confrontation')
  }, [state.worldCount, state.relics, dispatch, navigateTo])

  return (
    <div className="game-container" style={{ padding: '2rem 1.5rem' }}>

      {/* 漂浮粒子 */}
      <div className="particle animate-float" style={{ width: 3, height: 3, background: 'rgba(74,158,255,0.4)', top: '15%', left: '8%', animationDelay: '0s' }} />
      <div className="particle animate-float" style={{ width: 2, height: 2, background: 'rgba(139,92,246,0.5)', top: '65%', left: '92%', animationDelay: '2s' }} />
      <div className="particle animate-float" style={{ width: 2, height: 2, background: 'rgba(34,211,238,0.4)', top: '40%', left: '96%', animationDelay: '4s' }} />

      {/* 标题 */}
      <div className="text-center mb-8 animate-fadeInSlow w-full">
        <div className="animate-twinkle mb-3" style={{ color: 'rgba(74,158,255,0.5)', fontSize: '0.85rem', letterSpacing: '1rem' }}>
          ✦ ✦ ✦
        </div>
        <h1 className="world-title mb-2" style={{ fontSize: '2.6rem', letterSpacing: '0.5em' }}>
          {TEXT.GAME_TITLE}
        </h1>
        <p style={{ color: 'var(--star-muted)', fontSize: '0.8rem', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>
          {TEXT.GAME_SUBTITLE}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            color: 'var(--aurora-blue)',
            fontSize: '0.9rem',
            letterSpacing: '0.15em',
            border: '1px solid rgba(74,158,255,0.25)',
            padding: '0.2rem 0.85rem',
            borderRadius: '20px',
            background: 'rgba(74,158,255,0.06)',
          }}>
            第 {state.cycle} 周目
          </span>
          <span style={{ color: 'rgba(74,158,255,0.2)', fontSize: '0.7rem' }}>·</span>
          <span style={{
            color: 'var(--star-soft)',
            fontSize: '0.9rem',
            letterSpacing: '0.15em',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '0.2rem 0.85rem',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.03)',
          }}>
            {state.mode === 'ancient' ? TEXT.MODE_TAG_ANCIENT : TEXT.MODE_TAG_BOUNDLESS}
          </span>
        </div>
      </div>

      {/* 主体：四栏布局，固定等高 */}
      <div className="w-full animate-fadeIn" style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px 300px',
        gap: '1.25rem',
        maxWidth: 1400,
        alignItems: 'stretch',
        height: 560,
      }}>

        {/* ── 左栏：操作面板 ── */}
        <div className="parchment-card p-6 animate-glow" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* 宇宙状态面板 */}
          <div style={{
            padding: '0.875rem 1rem',
            background: 'rgba(74,158,255,0.04)',
            border: '1px solid rgba(74,158,255,0.1)',
            borderRadius: '6px',
            marginBottom: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ color: 'var(--star-muted)', fontSize: '0.68rem', letterSpacing: '0.1em', margin: 0 }}>存活世界</p>
                <p style={{ color: 'var(--star-white)', fontSize: '1.4rem', fontFamily: 'monospace', margin: 0, lineHeight: 1.2 }}>
                  {state.worldCount}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--star-muted)', fontSize: '0.68rem', letterSpacing: '0.1em', margin: 0 }}>虚无逼近</p>
                <p style={{
                  fontSize: '1.4rem',
                  fontFamily: 'monospace',
                  margin: 0,
                  lineHeight: 1.2,
                  color: state.exploredWorldCount >= 1 ? 'var(--nova-red)' : 'var(--aurora-cyan)',
                }}>
                  {Math.max(0, 2 - state.exploredWorldCount)} 次后
                </p>
              </div>
            </div>
            {state.exploredWorldCount >= 2 && (
              <p style={{ color: 'var(--nova-red)', fontSize: '0.72rem', textAlign: 'center', marginTop: '0.5rem', letterSpacing: '0.1em' }}>
                虚无已至，必须前往宇宙尽头
              </p>
            )}
          </div>

          {/* 游历 */}
          <div className="mb-3">
            <p style={{ color: 'var(--star-muted)', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '0.5rem', textAlign: 'center' }}>
              随机游历
            </p>
            <button
              className="btn-primary w-full"
              style={{ letterSpacing: '0.4em', padding: '0.7rem', fontSize: '1rem' }}
              onClick={() => void handleDraw()}
              disabled={isGenerating || state.exploredWorldCount >= 2}
            >
              {isGenerating ? '…' : TEXT.DRAW_WORLD}
            </button>
          </div>

          <hr className="divider" style={{ margin: '0.75rem 0' }} />

          {/* 创世 */}
          <div className="mb-3">
            <p style={{ color: 'var(--star-muted)', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '0.5rem', textAlign: 'center' }}>
              {TEXT.CREATE_WORLD}
            </p>
            <div className="space-y-2">
              <input
                className="star-input"
                type="text"
                value={worldNameInput}
                onChange={(e) => { setWorldNameInput(e.target.value); setInputError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleCreateWorld() }}
                placeholder={TEXT.CREATE_WORLD_PLACEHOLDER}
                maxLength={20}
                disabled={isGenerating}
              />
              {inputError && (
                <p style={{ color: 'var(--nova-red)', fontSize: '0.78rem', lineHeight: 1.5 }}>{inputError}</p>
              )}
              <button
                className="btn-secondary w-full"
                onClick={() => void handleCreateWorld()}
                disabled={isGenerating || state.exploredWorldCount >= 2}
              >
                {TEXT.CREATE_WORLD}
              </button>
            </div>
          </div>

          <hr className="divider" style={{ margin: '0.75rem 0' }} />

          {/* 底部导航 — 撑到底部 */}
          <div style={{ marginTop: 'auto' }}>
            {/* 前往宇宙尽头 — 始终占位，exploredWorldCount>=1 才可见可点击 */}
            <div className="mb-3" style={{ visibility: state.exploredWorldCount >= 1 ? 'visible' : 'hidden' }}>
              <button
                className="btn-primary w-full"
                style={{
                  letterSpacing: '0.15em',
                  fontSize: '0.88rem',
                  padding: '0.75rem',
                  background: 'rgba(139,92,246,0.12)',
                  borderColor: 'rgba(139,92,246,0.4)',
                }}
                onClick={handleGoConfront}
              >
                前往宇宙尽头
              </button>
              <p style={{ color: 'var(--star-dim)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.4rem', letterSpacing: '0.1em' }}>
                {state.relics.length} 件遗物 · {state.worldCount} 个世界
              </p>
            </div>
            <div className="flex justify-between gap-1">
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.78rem' }}
                onClick={() => void handleGoAchievements()}
              >
                {TEXT.ACHIEVEMENTS}
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.78rem' }}
                onClick={() => navigateTo('relics')}
              >
                {TEXT.RELICS_TITLE}
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.78rem' }}
                onClick={() => navigateTo('settings')}
              >
                {TEXT.SETTINGS}
              </button>
            </div>
          </div>
        </div>

        {/* ── 右栏：世界详情 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 生成中 */}
          {isGenerating && (
            <div className="parchment-card animate-fadeIn" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 1.5rem' }}>
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
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(74,158,255,0.6)', fontSize: '1rem' }}>✦</div>
              </div>
              <div className="progress-bar mb-4" style={{ width: 160, margin: '0 auto 1rem' }}>
                <div className="progress-bar-fill" style={{ width: `${generateProgress.percent}%` }} />
              </div>
              <p style={{ color: 'var(--star-soft)', fontSize: '0.85rem', letterSpacing: '0.18em' }}>
                {generateProgress.text}
              </p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* 世界详情 */}
          {!isGenerating && previewWorld && (
            <div className="parchment-card animate-fadeIn" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '1.75rem 1.75rem 0' }}>
                {/* 世界名 */}
                <div className="text-center mb-5">
                  <h2 className="world-title" style={{ fontSize: '1.8rem', letterSpacing: '0.4em' }}>
                    {previewWorld.name}
                  </h2>
                </div>
                <hr className="divider" style={{ margin: '0 0 1.25rem' }} />
              </div>

              {/* 只有简介区可滚动 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.75rem 0 1.75rem', paddingRight: '1.25rem' }}>
                <div className="narrative-text" style={{ fontSize: '0.93rem', lineHeight: '2.1' }}>
                  {previewWorld.description}
                </div>
              </div>

              {/* 操作按钮 — 固定底部 */}
              <div style={{ padding: '1rem 1.75rem 1.75rem', borderTop: '1px solid rgba(74,158,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  style={{ letterSpacing: '0.25em', padding: '0.875rem' }}
                  onClick={() => void handleEnterWorld()}
                >
                  {TEXT.ENTER_WORLD}
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => void handleDraw()}
                >
                  {TEXT.SKIP_WORLD}
                </button>
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!isGenerating && !previewWorld && (
            <div className="parchment-card animate-fadeIn" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <div className="animate-twinkle mb-4" style={{ color: 'rgba(74,158,255,0.3)', fontSize: '2rem', letterSpacing: '0.5rem' }}>
                ✦ ✧ ✦
              </div>
              <p style={{ color: 'var(--star-dim)', fontSize: '0.85rem', letterSpacing: '0.15em', lineHeight: 2 }}>
                游历，或创世<br />此处将展示你选择的世界
              </p>
            </div>
          )}
        </div>

        {/* ── 图片栏：世界缩略图（时间废墟模式专属） ── */}
        <div className="parchment-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {state.mode === 'ancient' && previewWorld?.thumbnail ? (
            <img
              src={previewWorld.thumbnail}
              alt={previewWorld.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                borderRadius: '7px',
              }}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--star-dim)', fontSize: '0.75rem', letterSpacing: '0.12em', textAlign: 'center', lineHeight: 2, opacity: 0.4 }}>
                {state.mode === 'ancient' ? '此界尚无图像' : '创世神典\n不支持图像'}
              </p>
            </div>
          )}
        </div>

        {/* ── 右栏：四维属性 ── */}
        <div className="parchment-card p-5" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <p style={{ color: 'var(--star-muted)', fontSize: '0.7rem', letterSpacing: '0.2em', marginBottom: '1rem', textAlign: 'center' }}>
            此界四维
          </p>

          {previewWorld ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
              {/* 属性条 */}
              <AttributePanel
                world={previewWorld}
                currentAttributes={Object.fromEntries(previewWorld.attributes.map(a => [a.key, 50]))}
                compact
              />

          {/* 前往宇宙尽头 */}
          {state.exploredWorldCount >= 2 && (
            <div className="mb-4">
              <button
                className="btn-primary w-full"
                style={{
                  letterSpacing: '0.15em',
                  fontSize: '0.88rem',
                  padding: '0.75rem',
                  background: 'rgba(139,92,246,0.12)',
                  borderColor: 'rgba(139,92,246,0.4)',
                }}
                onClick={handleGoConfront}
              >
                前往宇宙尽头
              </button>
              <p style={{ color: 'var(--star-dim)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.4rem', letterSpacing: '0.1em' }}>
                携带 {state.relics.length} 件遗物 · {state.worldCount} 个世界
              </p>
            </div>
          )}

          <hr className="divider" />

              {/* 属性名片 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {previewWorld.attributes.map((attr) => (
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
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--star-dim)', fontSize: '0.75rem', letterSpacing: '0.12em', textAlign: 'center', lineHeight: 2, opacity: 0.5 }}>
                抽取世界后<br />此处显示<br />维度信息
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
