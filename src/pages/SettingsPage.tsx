// ============================================================
// 设置面板页面
// ============================================================

import { useState, useEffect } from 'react'
import { useApp } from '@/store/AppContext'
import { TEXT } from '@/constants/text'
import { encryptKey, decryptKey } from '@/utils/crypto'
import { clearAllData, estimateStorageUsage } from '@/services/db'
import type { AppSettings } from '@/types'

export function SettingsPage() {
  const { state, updateSettings, navigateTo } = useApp()
  const { settings } = state
  const [apiUrl, setApiUrl] = useState(settings.aiApiUrl)
  const [apiKey, setApiKey] = useState(decryptKey(settings.aiApiKeyEncrypted))
  const [aiModel, setAiModel] = useState(settings.aiModel)
  const [mode, setMode] = useState(settings.mode)
  const [storageUsage, setStorageUsage] = useState('计算中…')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { void estimateStorageUsage().then(setStorageUsage) }, [])

  const handleSave = () => {
    const newSettings: AppSettings = {
      mode, aiApiUrl: apiUrl.trim(),
      aiApiKeyEncrypted: encryptKey(apiKey.trim()),
      aiModel: aiModel.trim() || 'gpt-4o',
    }
    updateSettings(newSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearData = async () => {
    await clearAllData()
    setShowClearConfirm(false)
    navigateTo('home')
  }

  return (
    <div className="game-container">
      <div className="parchment-card p-6 w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="world-title" style={{ fontSize: '1.3rem', letterSpacing: '0.3em', margin: 0 }}>
            {TEXT.SETTINGS_TITLE}
          </h2>
          <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => navigateTo('home')}>归返</button>
        </div>

        {/* 模式选择 */}
        <div className="mb-6">
          <p style={{ color: 'var(--star-muted)', fontSize: '0.72rem', letterSpacing: '0.18em', marginBottom: '0.75rem' }}>
            游历模式
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['ancient', 'boundless'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '0.875rem 1rem',
                background: mode === m ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${mode === m ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: mode === m ? '0 0 15px rgba(74,158,255,0.1)' : 'none',
              }}>
                <div style={{ color: mode === m ? 'var(--aurora-blue)' : 'var(--star-soft)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  {m === 'ancient' ? TEXT.MODE_ANCIENT : TEXT.MODE_BOUNDLESS}
                </div>
                <div style={{ color: 'var(--star-muted)', fontSize: '0.72rem', lineHeight: '1.5' }}>
                  {m === 'ancient' ? TEXT.MODE_ANCIENT_DESC : TEXT.MODE_BOUNDLESS_DESC}
                </div>
              </button>
            ))}
          </div>
        </div>

        <hr className="divider" />

        {/* AI配置 */}
        <div className="mb-6 space-y-4">
          <p style={{ color: 'var(--star-muted)', fontSize: '0.72rem', letterSpacing: '0.18em' }}>创世神典配置</p>
          {[
            { label: TEXT.AI_API_URL, val: apiUrl, set: setApiUrl, type: 'url', ph: TEXT.AI_API_URL_PLACEHOLDER },
            { label: TEXT.AI_API_KEY, val: apiKey, set: setApiKey, type: 'password', ph: TEXT.AI_API_KEY_PLACEHOLDER },
            { label: TEXT.AI_MODEL, val: aiModel, set: setAiModel, type: 'text', ph: TEXT.AI_MODEL_PLACEHOLDER },
          ].map(({ label, val, set, type, ph }) => (
            <div key={label}>
              <label style={{ color: 'var(--star-soft)', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                {label}
              </label>
              <input
                className="star-input"
                type={type}
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
              />
              {label === TEXT.AI_API_KEY && (
                <p style={{ color: 'var(--star-dim)', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                  令牌将加密存储于本地，不会上传至任何服务器
                </p>
              )}
            </div>
          ))}
        </div>

        <button className="btn-primary w-full mb-6" style={{ letterSpacing: '0.2em' }} onClick={handleSave}>
          {saved ? '已保存 ✓' : TEXT.SAVE_SETTINGS}
        </button>

        <hr className="divider" />

        <div className="flex justify-between items-center mb-4">
          <span style={{ color: 'var(--star-muted)', fontSize: '0.85rem' }}>{TEXT.STORAGE_USAGE}</span>
          <span style={{ color: 'var(--star-soft)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{storageUsage}</span>
        </div>

        {!showClearConfirm ? (
          <button className="btn-secondary w-full"
            style={{ color: 'var(--nova-red)', borderColor: 'rgba(239,68,68,0.2)', fontSize: '0.85rem' }}
            onClick={() => setShowClearConfirm(true)}>
            {TEXT.CLEAR_DATA}
          </button>
        ) : (
          <div style={{
            padding: '1rem', background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px',
          }}>
            <p style={{ color: 'var(--nova-red)', fontSize: '0.85rem', marginBottom: '0.75rem', textAlign: 'center' }}>
              {TEXT.CLEAR_DATA_WARNING}
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}
                onClick={() => setShowClearConfirm(false)}>取消</button>
              <button className="btn-primary" style={{ flex: 1, fontSize: '0.85rem', background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--nova-red)' }}
                onClick={() => void handleClearData()}>{TEXT.CLEAR_DATA_CONFIRM}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
