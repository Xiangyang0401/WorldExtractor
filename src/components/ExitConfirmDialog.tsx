// ============================================================
// 退出确认弹窗
// ============================================================

import { TEXT } from '@/constants/text'

interface ExitConfirmDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ExitConfirmDialog({ onConfirm, onCancel }: ExitConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="parchment-card p-8 max-w-sm w-full mx-4 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: 'var(--star-white)', letterSpacing: '0.2em', textAlign: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
          {TEXT.EXIT_WARNING_TITLE}
        </h3>
        <p style={{ color: 'var(--star-soft)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.88rem', lineHeight: '1.8' }}>
          {TEXT.EXIT_WARNING_BODY}
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn-secondary" onClick={onCancel}>{TEXT.EXIT_CANCEL}</button>
          <button
            className="btn-primary"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--nova-red)' }}
            onClick={onConfirm}
          >
            {TEXT.EXIT_CONFIRM}
          </button>
        </div>
      </div>
    </div>
  )
}
