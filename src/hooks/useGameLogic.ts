// ============================================================
// 宇宙尽头 · 核心游戏逻辑 Hook
// ============================================================

import { useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import type {
  WorldData,
  Choice,
  ExplorationChoiceRecord,
  AchievementRecord,
  WorldHistory,
  ActiveSession,
  Relic,
} from '@/types'
import {
  applyAttributeDeltas,
  generateId,
  checkOutcomeCondition,
  randomPick,
} from '@/utils'
import {
  saveAchievement,
  getAllAchievements,
  saveWorldHistory,
  getWorldHistory,
} from '@/services/db'

export function useGameLogic() {
  const {
    state,
    dispatch,
    navigateTo,
    setAchievements,
    setWorldHistories,
    worldHistories,
  } = useApp()

  // ============================================================
  // 开始探索
  // ============================================================
  const startExploration = useCallback(
    async (world: WorldData) => {
      // 随机分配身份
      const identity = randomPick(world.identities)

      // 初始化属性
      const initialAttributes: Record<string, number> = {}
      for (const attr of world.attributes) {
        initialAttributes[attr.key] = 50
      }

      // 无界模式：从历史状态继承属性
      if (state.mode === 'boundless') {
        const history = await getWorldHistory(world.id).catch(() => null)
        if (history?.currentAttributes) {
          Object.assign(initialAttributes, history.currentAttributes)
        }
      }

      const session: ActiveSession = {
        worldId: world.id,
        worldName: world.name,
        mode: state.mode,
        identityId: identity.id,
        currentAttributes: initialAttributes,
        completedEvents: [],
        currentEventIndex: 0,
        startedAt: Date.now(),
      }

      dispatch({ type: 'SET_CURRENT_WORLD', world })
      dispatch({ type: 'SET_ACTIVE_SESSION', session })
      navigateTo('exploration')
    },
    [state.mode, dispatch, navigateTo]
  )

  // ============================================================
  // 做出选择
  // ============================================================
  const makeChoice = useCallback(
    (choice: Choice) => {
      const { activeSession, currentWorld } = state
      if (!activeSession || !currentWorld) return

      const event = currentWorld.events[activeSession.currentEventIndex]
      if (!event) return

      // 计算新属性
      const newAttributes = applyAttributeDeltas(
        activeSession.currentAttributes,
        choice.attributeDeltas
      )

      // 记录选择
      const record: ExplorationChoiceRecord = {
        eventIndex: event.index,
        choiceId: choice.id,
        choiceText: choice.text,
        consequence: choice.consequence,
        attributeSnapshots: newAttributes,
        ripple: '',
      }

      const updatedEvents = [...activeSession.completedEvents, record]
      const nextIndex = activeSession.currentEventIndex + 1

      const updatedSession: ActiveSession = {
        ...activeSession,
        currentAttributes: newAttributes,
        completedEvents: updatedEvents,
        currentEventIndex: nextIndex,
      }

      dispatch({ type: 'SET_ACTIVE_SESSION', session: updatedSession })

      // 第5次探索完成，触发结局
      if (nextIndex >= currentWorld.events.length) {
        void resolveOutcome(updatedSession, currentWorld)
      }
    },
    [state, dispatch]
  )

  // ============================================================
  // 解算结局
  // ============================================================
  const resolveOutcome = useCallback(
    async (session: ActiveSession, world: WorldData) => {
      const { currentAttributes, completedEvents, identityId } = session

      // 找到第一个满足条件的结局
      let matchedOutcome = world.outcomes.find((outcome) =>
        checkOutcomeCondition(currentAttributes, outcome.conditions)
      )

      // 如果没有找到，取最后一个作为默认
      if (!matchedOutcome) {
        matchedOutcome = world.outcomes[world.outcomes.length - 1]
      }

      const identity = world.identities.find((i) => i.id === identityId)

      // 构建成就记录
      const achievement: AchievementRecord = {
        id: generateId(),
        worldId: world.id,
        worldName: world.name,
        completedAt: Date.now(),
        identityName: identity?.internalName ?? '未知身份',
        outcomeName: matchedOutcome.name,
        outcomeNarrative: matchedOutcome.narrative,
        achievementName: matchedOutcome.achievementName,
        achievementDescription: matchedOutcome.achievementDescription,
        choiceHistory: completedEvents,
        finalAttributes: currentAttributes,
      }

      // 保存成就
      await saveAchievement(achievement).catch((err) =>
        console.error('保存成就失败:', err)
      )

      // 增加世界计数
      dispatch({ type: 'INCREMENT_WORLD_COUNT' })

      // 发放结局遗物
      if (matchedOutcome.relic) {
        const relic: Relic = {
          ...matchedOutcome.relic,
          id: generateId(),
          used: false,
        }
        dispatch({ type: 'ADD_RELIC', relic })
      }

      // 无界模式：更新世界历史状态
      if (session.mode === 'boundless') {
        const prevHistory = worldHistories.find((h) => h.worldId === world.id)
        const history: WorldHistory = {
          worldId: world.id,
          worldName: world.name,
          explorationCount: (prevHistory?.explorationCount ?? 0) + 1,
          currentAttributes,
          lastOutcomeName: matchedOutcome.name,
          lastExploredAt: Date.now(),
        }
        await saveWorldHistory(history).catch((err) =>
          console.error('保存世界历史失败:', err)
        )
        setWorldHistories([
          ...worldHistories.filter((h) => h.worldId !== world.id),
          history,
        ])
      }

      // 刷新成就列表
      const allAchievements = await getAllAchievements().catch(() => [])
      setAchievements(allAchievements)

      // 将结局信息存入 session，导航到结局页
      dispatch({
        type: 'SET_ACTIVE_SESSION',
        session: { ...session, currentAttributes },
      })

      // 临时用 currentWorld 存储结局，供 OutcomePage 读取
      dispatch({
        type: 'SET_CURRENT_WORLD',
        world: {
          ...world,
          // 用一个特殊字段传递结局（类型扩展）
          _resolvedOutcome: matchedOutcome,
          _achievement: achievement,
        } as WorldData & {
          _resolvedOutcome: typeof matchedOutcome
          _achievement: AchievementRecord
        },
      })

      navigateTo('outcome')
    },
    [worldHistories, dispatch, navigateTo, setAchievements, setWorldHistories]
  )

  // ============================================================
  // 放弃探索（世界消散）
  // ============================================================
  const abandonExploration = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_SESSION', session: null })
    dispatch({ type: 'SET_CURRENT_WORLD', world: null })
    navigateTo('home')
  }, [dispatch, navigateTo])

  // ============================================================
  // 加载成就列表
  // ============================================================
  const loadAchievements = useCallback(async () => {
    const records = await getAllAchievements().catch(() => [])
    setAchievements(records)
  }, [setAchievements])

  return {
    startExploration,
    makeChoice,
    abandonExploration,
    loadAchievements,
  }
}
