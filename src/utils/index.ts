// ============================================================
// 宇宙尽头 · 通用工具函数
// ============================================================

/** 生成唯一ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** 从数组中随机取一个元素 */
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 将属性值限制在 0-100 之间 */
export function clampAttribute(value: number): number {
  return Math.max(0, Math.min(100, value))
}

/** 应用属性变化，返回新的属性快照 */
export function applyAttributeDeltas(
  current: Record<string, number>,
  deltas: Record<string, number>
): Record<string, number> {
  const next = { ...current }
  for (const [key, delta] of Object.entries(deltas)) {
    if (key in next) {
      next[key] = clampAttribute(next[key] + delta)
    }
  }
  return next
}

/** 格式化时间戳为可读时间 */
export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 属性变化的显示文本，如 +8 ▲ 或 -5 ▼ */
export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta} ▲`
  if (delta < 0) return `${delta} ▼`
  return `0 →`
}

/** 检查结局触发条件是否满足 */
export function checkOutcomeCondition(
  attributes: Record<string, number>,
  conditions: Array<{ attributeKey: string; operator: string; threshold: number }>
): boolean {
  return conditions.every(({ attributeKey, operator, threshold }) => {
    const value = attributes[attributeKey] ?? 50
    switch (operator) {
      case '>=': return value >= threshold
      case '<=': return value <= threshold
      case '>': return value > threshold
      case '<': return value < threshold
      case '==': return value === threshold
      default: return false
    }
  })
}

/** 延迟函数 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
