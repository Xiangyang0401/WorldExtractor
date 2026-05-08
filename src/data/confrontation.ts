// ============================================================
// 万界拾遗 · 对峙数据：虚无的五轮显现
// ============================================================

import type { VoidRound } from '@/types'

export const VOID_ROUNDS: VoidRound[] = [
  {
    round: 1,
    title: '降临',
    narrative: `虚无没有来。它一直都在。

只是这一刻，你终于感觉到了它——那种所有声音消失之前的安静，所有颜色褪去之前的苍白。不是黑暗，黑暗至少还是某种东西。这是比黑暗更彻底的东西，是一切事物在忘记如何存在之前最后的状态。

宇宙的边缘，有什么正在不再存在。

你感觉到了。所有还活着的世界也感觉到了。`,
    effectDescription: '1个世界在虚无的降临中悄然消失，没有任何征兆。',
    destroyCount: 1,
    canFullyBlock: true,
    maxBlock: 1,
  },
  {
    round: 2,
    title: '侵蚀',
    narrative: `你记得你来过的那些地方吗？

虚无不问你。它只是让你发现，你已经记不清某个世界的名字了。那个世界还在，但它在你的记忆里开始模糊，像一幅画被水浸湿，轮廓还在，颜色没了。然后你意识到，不只是颜色——那个世界在你身上留下的一切，那些你带到这里来的东西，虚无正在悄悄地、不动声色地把它们从存在里抹去。

你低头，看看自己手里还剩什么。`,
    effectDescription: '虚无的侵蚀让你失去1件道具或能力，它就这样从存在中消失了。',
    destroyCount: 0,
    canFullyBlock: true,
    maxBlock: 1,
    specialType: 'erosion',
  },
  {
    round: 3,
    title: '叩问',
    narrative: `虚无从来不说话。

但此刻你听见了一个问题，不是从外面来的，是从你自己内部升起的，像是某根你从来不知道存在的弦被拨动了：

如果所有世界都终将消失，如果这片宇宙从一开始就走向虚无，你此刻站在这里，用你带来的这些东西抵抗，是在保护什么？

不是质问，不是嘲讽。只是一个问题，悬在那里，等待一个答案。

没有答案，不是因为问题无解——而是因为你可能还没有找到那个答案。`,
    effectDescription: '若无法回应这个问题，2个世界在迷失中消散；若你手中有某种见证过"存在意义"的东西，它将自动回应虚无的叩问。',
    destroyCount: 2,
    canFullyBlock: true,
    maxBlock: 2,
    specialType: 'question',
  },
  {
    round: 4,
    title: '静默',
    narrative: `没有任何征兆。

没有声音，没有光的变化，没有任何你可以感知到的过程。两个世界消失了，就像它们从来没有存在过。不是被摧毁，不是被吞噬——它们只是停止了存在，像一个人停止呼吸，安静地，彻底地。

虚无不需要做任何事。它只需要等待。等到那些世界忘记如何存在，它们就自己回归虚无了。

你还能撑住多少？`,
    effectDescription: '2个世界在静默中消失。任何道具最多只能减免其中1个。',
    destroyCount: 2,
    canFullyBlock: false,
    maxBlock: 1,
  },
  {
    round: 5,
    title: '终焉',
    narrative: `虚无没有发动任何攻击。

它只是停止了退让。

此刻，它就是宇宙本身的重量，是所有事物走向终点的那条路，是时间尽头那扇永远敞开的门。它不需要消灭你，它只需要存在，而你需要证明，你带来的这一切，那些从无数世界里攫取的记忆、感知、气味、目光，足以在这一刻，撑住宇宙继续存在的理由。

你站在这里。

用你所有的一切。`,
    effectDescription: '虚无将当前存活世界数的一半（向上取整）卷入终焉。但此刻使用任何道具，其效果翻倍。',
    destroyCount: -1, // 动态计算：ceil(worldCount / 2)
    canFullyBlock: true,
    maxBlock: -1,
    specialType: 'final',
  },
]

// ============================================================
// 对峙辅助函数
// ============================================================

import type { ConfrontationSession, Relic } from '@/types'

/** 计算当前回合虚无实际摧毁的世界数 */
export function calcDestroyCount(round: VoidRound, worldCount: number): number {
  if (round.specialType === 'final') {
    return Math.ceil(worldCount / 2)
  }
  return round.destroyCount
}

/** 初始化对峙会话 */
export function initConfrontationSession(
  worldCount: number,
  relics: Relic[]
): ConfrontationSession {
  return {
    currentRound: 1,
    worldCount,
    initialWorldCount: worldCount,
    relics,
    roundHistory: [],
    finished: false,
    victory: false,
  }
}

/** 执行一轮对峙，返回更新后的会话 */
export function executeRound(
  session: ConfrontationSession,
  relicUsed: Relic | null
): ConfrontationSession {
  const round = VOID_ROUNDS[session.currentRound - 1]
  if (!round) return session

  let worldCountBefore = session.worldCount
  let worldCountAfter = session.worldCount
  let relics = session.relics.map(r => ({ ...r }))

  const baseDestroy = calcDestroyCount(round, session.worldCount)
  let actualDestroy = baseDestroy
  let playerAction = '无所为'

  // 处理自动触发的道具
  const autoRelic = relics.find(
    r => !r.used && r.effectType === 'auto' && r.autoTriggerRound === session.currentRound
  )
  if (autoRelic) {
    autoRelic.used = true
    if (autoRelic.effectType === 'auto') {
      actualDestroy = Math.max(0, actualDestroy - autoRelic.effectValue)
      playerAction = `【自动触发】${autoRelic.name}`
    }
  }

  // 处理侵蚀回合（摧毁道具）
  if (round.specialType === 'erosion' && !relicUsed) {
    const availableRelics = relics.filter(r => !r.used && r.effectType !== 'auto')
    if (availableRelics.length > 0) {
      const target = availableRelics[Math.floor(Math.random() * availableRelics.length)]
      relics = relics.map(r => r.id === target.id ? { ...r, used: true } : r)
      playerAction = `失去了「${target.name}」`
    }
  }

  // 处理玩家主动使用的道具
  if (relicUsed && !relicUsed.used) {
    relics = relics.map(r => r.id === relicUsed.id ? { ...r, used: true } : r)
    playerAction = `使用了「${relicUsed.name}」`

    const multiplier = round.specialType === 'final' ? 2 : 1

    switch (relicUsed.effectType) {
      case 'shield': {
        const block = Math.min(
          relicUsed.effectValue * multiplier,
          round.maxBlock === -1 ? actualDestroy : round.maxBlock
        )
        actualDestroy = Math.max(0, actualDestroy - block)
        break
      }
      case 'revive': {
        worldCountAfter += relicUsed.effectValue * multiplier
        break
      }
      case 'answer': {
        if (round.specialType === 'question') {
          actualDestroy = 0
        }
        break
      }
      case 'protect_relics': {
        if (round.specialType === 'erosion') {
          actualDestroy = 0
          playerAction = `使用了「${relicUsed.name}」，道具免遭侵蚀`
        }
        break
      }
      case 'reduce_final': {
        if (round.specialType === 'final') {
          actualDestroy = Math.max(0, actualDestroy - relicUsed.effectValue * multiplier)
        }
        break
      }
    }
  }

  // 应用摧毁效果
  worldCountAfter = Math.max(0, worldCountAfter - actualDestroy)

  const record = {
    round: session.currentRound,
    voidNarrative: round.narrative,
    voidEffect: round.effectDescription,
    playerAction,
    worldCountBefore,
    worldCountAfter,
    relicUsed,
  }

  const nextRound = session.currentRound + 1
  const finished = worldCountAfter <= 0 || nextRound > 5
  const victory = finished && worldCountAfter > 0

  return {
    ...session,
    currentRound: nextRound,
    worldCount: worldCountAfter,
    relics,
    roundHistory: [...session.roundHistory, record],
    finished,
    victory,
  }
}
