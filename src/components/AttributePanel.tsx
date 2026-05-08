// ============================================================
// 属性面板组件
// ============================================================

import type { WorldData } from '@/types'
import { formatDelta } from '@/utils'

interface AttributePanelProps {
  world: WorldData
  currentAttributes: Record<string, number>
  deltas?: Record<string, number>
  compact?: boolean
}

export function AttributePanel({ world, currentAttributes, deltas, compact = false }: AttributePanelProps) {
  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {world.attributes.map((attr) => {
        const value = currentAttributes[attr.key] ?? 50
        const delta = deltas?.[attr.key]
        return (
          <div key={attr.key}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ color: 'var(--star-muted)', fontSize: '0.82rem', letterSpacing: '0.05em' }} title={attr.description}>
                {attr.name}
              </span>
              <div className="flex items-center gap-2">
                {delta !== undefined && delta !== 0 && (
                  <span style={{
                    fontSize: '0.75rem', fontFamily: 'monospace',
                    color: delta > 0 ? 'var(--aurora-cyan)' : 'var(--nova-red)',
                  }}>
                    {formatDelta(delta)}
                  </span>
                )}
                <span style={{ color: 'var(--star-white)', fontSize: '0.82rem', fontFamily: 'monospace', minWidth: '2rem', textAlign: 'right' }}>
                  {value}
                </span>
              </div>
            </div>
            <div className="attr-bar">
              <div className="attr-bar-fill" style={{ width: `${value}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
