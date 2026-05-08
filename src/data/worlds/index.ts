// ============================================================
// 万界拾遗 · 预设世界注册表
// ============================================================

import type { WorldData } from '@/types'
import { JING_YUAN } from './jingYuan'
import { SHI_WEI_JI } from './shiWeiJi'

export const PRESET_WORLDS: WorldData[] = [JING_YUAN, SHI_WEI_JI]

export const PRESET_WORLD_MAP: Record<string, WorldData> = Object.fromEntries(
  PRESET_WORLDS.map((w) => [w.id, w])
)

/** 随机抽取一个预设世界 */
export function drawRandomWorld(excludeId?: string): WorldData {
  const pool = excludeId
    ? PRESET_WORLDS.filter((w) => w.id !== excludeId)
    : PRESET_WORLDS
  const target = pool.length > 0 ? pool : PRESET_WORLDS
  return target[Math.floor(Math.random() * target.length)]
}
