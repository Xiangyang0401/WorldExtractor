// ============================================================
// 万界拾遗 · 全局状态管理（使用 React Context + useReducer）
// ============================================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  AppSettings,
  ActiveSession,
  WorldData,
  GameMode,
  AchievementRecord,
  WorldHistory,
  Relic,
  ConfrontationSession,
} from '@/types'
import { loadSettings, saveSettings, initDB } from '@/services/db'

// ============================================================
// 页面路由
// ============================================================
export type Page =
  | 'home'
  | 'world-intro'
  | 'exploration'
  | 'outcome'
  | 'achievements'
  | 'settings'
  | 'loading'
  | 'confrontation'
  | 'confrontation-result'
  | 'relics'

// ============================================================
// 全局状态
// ============================================================
export interface AppState {
  page: Page
  settings: AppSettings
  mode: GameMode
  currentWorld: WorldData | null
  activeSession: ActiveSession | null
  dbReady: boolean
  loadingText: string
  loadingPercent: number
  /** 玩家当前持有的遗物列表（跨世界积累） */
  relics: Relic[]
  /** 已探索的世界数量（对峙时的血量基础） */
  exploredWorldCount: number
  /** 当前周目（从1开始） */
  cycle: number
  /** 当前对峙会话 */
  confrontationSession: ConfrontationSession | null
}

// ============================================================
// Actions
// ============================================================
export type AppAction =
  | { type: 'SET_PAGE'; page: Page }
  | { type: 'SET_SETTINGS'; settings: AppSettings }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_CURRENT_WORLD'; world: WorldData | null }
  | { type: 'SET_ACTIVE_SESSION'; session: ActiveSession | null }
  | { type: 'SET_DB_READY'; ready: boolean }
  | { type: 'SET_LOADING'; text: string; percent: number }
  | { type: 'UPDATE_SESSION_ATTRIBUTES'; attributes: Record<string, number> }
  | { type: 'ADD_RELIC'; relic: Relic }
  | { type: 'REMOVE_RELIC'; relicId: string }
  | { type: 'INCREMENT_WORLD_COUNT' }
  | { type: 'SET_CONFRONTATION'; session: ConfrontationSession | null }
  | { type: 'UPDATE_CONFRONTATION'; session: ConfrontationSession }
  | { type: 'RESET_CYCLE' }  // 失败后重置本周目积累

// ============================================================
// Reducer
// ============================================================
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.page }
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings, mode: action.settings.mode }
    case 'SET_MODE':
      return { ...state, mode: action.mode }
    case 'SET_CURRENT_WORLD':
      return { ...state, currentWorld: action.world }
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.session }
    case 'SET_DB_READY':
      return { ...state, dbReady: action.ready }
    case 'SET_LOADING':
      return { ...state, loadingText: action.text, loadingPercent: action.percent }
    case 'UPDATE_SESSION_ATTRIBUTES':
      if (!state.activeSession) return state
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          currentAttributes: action.attributes,
        },
      }
    case 'ADD_RELIC':
      return { ...state, relics: [...state.relics, action.relic] }
    case 'REMOVE_RELIC':
      return { ...state, relics: state.relics.filter(r => r.id !== action.relicId) }
    case 'INCREMENT_WORLD_COUNT':
      return { ...state, exploredWorldCount: state.exploredWorldCount + 1 }
    case 'SET_CONFRONTATION':
      return { ...state, confrontationSession: action.session }
    case 'UPDATE_CONFRONTATION':
      return { ...state, confrontationSession: action.session }
    case 'RESET_CYCLE':
      return { ...state, relics: [], exploredWorldCount: 5, confrontationSession: null, cycle: state.cycle + 1 }
    default:
      return state
  }
}

// ============================================================
// 初始状态
// ============================================================
const initialSettings = loadSettings()

const initialState: AppState = {
  page: 'home',
  settings: initialSettings,
  mode: initialSettings.mode,
  currentWorld: null,
  activeSession: null,
  dbReady: false,
  loadingText: '此界正在成形…',
  loadingPercent: 0,
  relics: [],
  exploredWorldCount: 5,
  cycle: 1,
  confrontationSession: null,
}

// ============================================================
// Context
// ============================================================
interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  updateSettings: (settings: AppSettings) => void
  navigateTo: (page: Page) => void
  startLoading: (text: string, percent?: number) => void
  achievements: AchievementRecord[]
  setAchievements: (records: AchievementRecord[]) => void
  worldHistories: WorldHistory[]
  setWorldHistories: (histories: WorldHistory[]) => void
}

const AppContext = createContext<AppContextValue | null>(null)

// ============================================================
// Provider
// ============================================================
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [achievements, setAchievements] = useReducerState<AchievementRecord[]>([])
  const [worldHistories, setWorldHistories] = useReducerState<WorldHistory[]>([])

  useEffect(() => {
    initDB()
      .then(() => dispatch({ type: 'SET_DB_READY', ready: true }))
      .catch((err) => console.error('数据库初始化失败:', err))
  }, [])

  const updateSettings = useCallback((settings: AppSettings) => {
    saveSettings(settings)
    dispatch({ type: 'SET_SETTINGS', settings })
  }, [])

  const navigateTo = useCallback((page: Page) => {
    dispatch({ type: 'SET_PAGE', page })
  }, [])

  const startLoading = useCallback((text: string, percent = 0) => {
    dispatch({ type: 'SET_LOADING', text, percent })
    dispatch({ type: 'SET_PAGE', page: 'loading' })
  }, [])

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        updateSettings,
        navigateTo,
        startLoading,
        achievements,
        setAchievements,
        worldHistories,
        setWorldHistories,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

function useReducerState<T>(initial: T): [T, (val: T) => void] {
  const [state, setState] = useReducer((_: T, next: T) => next, initial)
  return [state, setState]
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp 必须在 AppProvider 内部使用')
  return ctx
}
