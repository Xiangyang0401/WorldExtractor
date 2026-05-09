// ============================================================
// 宇宙尽头 · IndexedDB 数据层
// ============================================================

import type { AchievementRecord, WorldHistory, AppSettings, WorldFrame } from '@/types'

const DB_NAME = 'wan-jie-shi-yi'
const DB_VERSION = 2  // 升级版本以触发新建 worldData 表

const STORES = {
  ACHIEVEMENTS: 'achievements',
  WORLD_HISTORY: 'worldHistory',
  WORLD_DATA: 'worldData',       // 新增：缓存AI生成的世界完整数据
  SETTINGS: 'settings',
} as const

let db: IDBDatabase | null = null

/** 初始化数据库 */
export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(new Error('数据库初始化失败'))

    request.onsuccess = () => {
      db = request.result
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // 成就记录表
      if (!database.objectStoreNames.contains(STORES.ACHIEVEMENTS)) {
        const achievementStore = database.createObjectStore(STORES.ACHIEVEMENTS, {
          keyPath: 'id',
        })
        achievementStore.createIndex('worldId', 'worldId', { unique: false })
        achievementStore.createIndex('completedAt', 'completedAt', { unique: false })
      }

      // 世界历史状态表（无界模式属性继承）
      if (!database.objectStoreNames.contains(STORES.WORLD_HISTORY)) {
        database.createObjectStore(STORES.WORLD_HISTORY, { keyPath: 'worldId' })
      }

      // 世界完整数据缓存表（无界模式世界持久化）
      if (!database.objectStoreNames.contains(STORES.WORLD_DATA)) {
        database.createObjectStore(STORES.WORLD_DATA, { keyPath: 'id' })
      }

      // 设置表
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
}

/** 获取数据库实例 */
function getDB(): IDBDatabase {
  if (!db) throw new Error('数据库未初始化，请先调用 initDB()')
  return db
}

/** 通用事务执行 */
function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = operation(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ============================================================
// 成就记录
// ============================================================

export async function saveAchievement(record: AchievementRecord): Promise<void> {
  await runTransaction(STORES.ACHIEVEMENTS, 'readwrite', (store) =>
    store.put(record)
  )
}

export async function getAllAchievements(): Promise<AchievementRecord[]> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(STORES.ACHIEVEMENTS, 'readonly')
    const store = transaction.objectStore(STORES.ACHIEVEMENTS)
    const index = store.index('completedAt')
    const request = index.openCursor(null, 'prev')
    const results: AchievementRecord[] = []

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        results.push(cursor.value as AchievementRecord)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getAchievementsByWorld(worldId: string): Promise<AchievementRecord[]> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(STORES.ACHIEVEMENTS, 'readonly')
    const store = transaction.objectStore(STORES.ACHIEVEMENTS)
    const index = store.index('worldId')
    const request = index.getAll(worldId)
    request.onsuccess = () => resolve(request.result as AchievementRecord[])
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllAchievements(): Promise<void> {
  await runTransaction(STORES.ACHIEVEMENTS, 'readwrite', (store) => store.clear())
}

// ============================================================
// 世界历史状态（无界模式属性继承）
// ============================================================

export async function saveWorldHistory(history: WorldHistory): Promise<void> {
  await runTransaction(STORES.WORLD_HISTORY, 'readwrite', (store) =>
    store.put(history)
  )
}

export async function getWorldHistory(worldId: string): Promise<WorldHistory | null> {
  const result = await runTransaction<WorldHistory | undefined>(
    STORES.WORLD_HISTORY,
    'readonly',
    (store) => store.get(worldId)
  )
  return result ?? null
}

export async function clearAllWorldHistory(): Promise<void> {
  await runTransaction(STORES.WORLD_HISTORY, 'readwrite', (store) => store.clear())
}

// ============================================================
// 世界完整数据缓存（无界模式，按名称查找）
// ============================================================

// ============================================================
// 世界框架缓存（无界模式，框架只生成一次）
// ============================================================

/** 保存世界框架，以 name 为唯一标识 */
export async function saveWorldFrame(frame: WorldFrame): Promise<void> {
  await runTransaction(STORES.WORLD_DATA, 'readwrite', (store) =>
    store.put(frame)
  )
}

/** 按世界名称查找框架 */
export async function getWorldFrameByName(name: string): Promise<WorldFrame | null> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(STORES.WORLD_DATA, 'readonly')
    const store = transaction.objectStore(STORES.WORLD_DATA)
    const request = store.openCursor()
    let found: WorldFrame | null = null

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        const frame = cursor.value as WorldFrame
        if (frame.name === name) {
          found = frame
        } else {
          cursor.continue()
          return
        }
      }
      resolve(found)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllWorldData(): Promise<void> {
  await runTransaction(STORES.WORLD_DATA, 'readwrite', (store) => store.clear())
}

// ============================================================
// 设置
// ============================================================

const SETTINGS_LS_KEY = 'wjsy_settings'

const DEFAULT_SETTINGS: AppSettings = {
  mode: 'ancient',
  aiApiUrl: '',
  aiApiKeyEncrypted: '',
  aiModel: 'gpt-4o',
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(settings))
}

// ============================================================
// 存储占用估算
// ============================================================

export async function estimateStorageUsage(): Promise<string> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage } = await navigator.storage.estimate()
      if (usage === undefined) return '未知'
      const kb = usage / 1024
      if (kb < 1024) return `${kb.toFixed(1)} KB`
      return `${(kb / 1024).toFixed(2)} MB`
    }
    return '未知'
  } catch {
    return '未知'
  }
}

// ============================================================
// 清除所有数据
// ============================================================

export async function clearAllData(): Promise<void> {
  await Promise.all([
    clearAllAchievements(),
    clearAllWorldHistory(),
    clearAllWorldData(),
  ])
  localStorage.removeItem(SETTINGS_LS_KEY)
}
