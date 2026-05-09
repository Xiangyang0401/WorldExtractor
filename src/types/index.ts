// ============================================================
// 宇宙尽头 · 核心类型定义
// ============================================================

/** 游戏模式 */
export type GameMode = 'ancient' | 'boundless' // 古卷模式 | 无界模式

/** 世界属性 */
export interface WorldAttribute {
  key: string
  name: string
  value: number // 0-100
  description: string
}

/** 玩家选择 */
export interface Choice {
  id: number
  text: string
  /** 选择后的叙述 */
  consequence: string
  /** 属性变化 key->delta */
  attributeDeltas: Record<string, number>
  /** 触发的结局条件（可选） */
  outcomeCondition?: OutcomeCondition
}

/** 结局触发条件 */
export interface OutcomeCondition {
  attributeKey: string
  operator: '>=' | '<=' | '>' | '<' | '=='
  threshold: number
  outcomeId: string
}

/** 单次探索事件 */
export interface ExplorationEvent {
  /** 第几印 */
  index: number
  /** 时间描述（符合世界观） */
  time: string
  /** 事件叙述正文 */
  narrative: string
  /** 选项列表 */
  choices: Choice[]
}

/** 世界身份 */
export interface WorldIdentity {
  id: string
  /** 不直接告知玩家，通过叙事自然披露 */
  internalName: string
  /** 影响选择权重的描述（仅内部使用） */
  description: string
}

/** 世界结局 */
export interface WorldOutcome {
  id: string
  name: string
  /** 结局完整叙述 */
  narrative: string
  /** 成就名称 */
  achievementName: string
  /** 成就描述 */
  achievementDescription: string
  /** 触发条件：属性阈值组合 */
  conditions: OutcomeCondition[]
  /** 本结局给予玩家的遗物（可选） */
  relic?: OutcomeRelic
}

/** 预设世界数据 */
export interface WorldData {
  id: string
  name: string
  /** 世界简介（文学风格） */
  description: string
  /** 世界缩略图路径（仅时间废墟模式预设世界使用，相对于 public/） */
  thumbnail?: string
  /** 4个专属属性 */
  attributes: Omit<WorldAttribute, 'value'>[]
  /** 可随机分配的身份列表 */
  identities: WorldIdentity[]
  /** 5次探索事件 */
  events: ExplorationEvent[]
  /** 结局列表 */
  outcomes: WorldOutcome[]
}

/**
 * 世界框架（无界模式持久化部分）
 * 只包含不随历史演变的固定内容：简介、属性定义、身份、结局框架
 * 事件每次进入时根据历史重新生成
 */
export interface WorldFrame {
  id: string
  name: string
  description: string
  attributes: Omit<WorldAttribute, 'value'>[]
  identities: WorldIdentity[]
  outcomes: WorldOutcome[]
  /** 创建时间 */
  createdAt: number
}

/** 单次探索的选择记录 */
export interface ExplorationChoiceRecord {
  eventIndex: number
  choiceId: number
  choiceText: string
  consequence: string
  attributeSnapshots: Record<string, number> // 选择后的属性快照
  ripple: string
}

/** 成就记录（每次完整探索产生一条） */
export interface AchievementRecord {
  id: string
  worldId: string
  worldName: string
  /** 探索完成时间戳 */
  completedAt: number
  /** 本次身份内部名 */
  identityName: string
  /** 本次结局 */
  outcomeName: string
  outcomeNarrative: string
  achievementName: string
  achievementDescription: string
  /** 探索历史摘要 */
  choiceHistory: ExplorationChoiceRecord[]
  /** 探索结束后世界当前属性状态 */
  finalAttributes: Record<string, number>
}

/** 活跃探索会话（探索中，不可存档） */
export interface ActiveSession {
  worldId: string
  worldName: string
  mode: GameMode
  identityId: string
  /** 当前属性值 */
  currentAttributes: Record<string, number>
  /** 已完成的探索印次 */
  completedEvents: ExplorationChoiceRecord[]
  /** 当前第几印（0-indexed） */
  currentEventIndex: number
  /** 会话开始时间戳 */
  startedAt: number
}

/** AI生成的世界数据（无界模式） */
export interface AIWorldData extends WorldData {
  /** 继承的历史状态（如有） */
  inheritedState?: {
    attributes: Record<string, number>
    lastOutcomeName: string
    explorationCount: number
  }
}

/** 世界历史状态（无界模式持久化） */
export interface WorldHistory {
  worldId: string
  worldName: string
  /** 该世界被探索的总次数 */
  explorationCount: number
  /** 当前属性状态（继承给下次探索） */
  currentAttributes: Record<string, number>
  /** 最后一次结局 */
  lastOutcomeName: string
  /** 最后探索时间戳 */
  lastExploredAt: number
}

/** 应用设置 */
export interface AppSettings {
  mode: GameMode
  /** 无界模式：渡界通道 URL */
  aiApiUrl: string
  /** 无界模式：渡界令牌（加密存储） */
  aiApiKeyEncrypted: string
  /** 无界模式：模型名称 */
  aiModel: string
}

/** 加载状态 */
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error'

// ============================================================
// 终局系统：对峙虚无
// ============================================================

/** 道具/能力 */
export interface Relic {
  id: string
  /** 名称 */
  name: string
  /** 来源世界 */
  worldName: string
  /** 叙事描述 */
  description: string
  /** 使用时的叙事 */
  useNarrative: string
  /** 效果类型 */
  effectType:
    | 'shield'          // 抵消N个世界的摧毁
    | 'revive'          // 复活N个世界
    | 'answer'          // 自动回答虚无的叩问
    | 'protect_relics'  // 保护道具不被摧毁
    | 'auto'            // 自动触发，不可主动使用
    | 'reduce_final'    // 减免第5轮效果
    | 'delay'           // 将本轮伤害推迟到下一轮结算（下轮双倍承受）
    | 'mirror'          // 照见虚无本体，完全抵消本轮伤害，但随机失去一件其他遗物
  /** 效果数值 */
  effectValue: number
  /** 自动触发的回合（effectType为auto时有效） */
  autoTriggerRound?: number
  /** 是否已使用 */
  used: boolean
}

/** 虚无单轮显现 */
export interface VoidRound {
  round: number
  /** 显现名称 */
  title: string
  /** 叙事文字 */
  narrative: string
  /** 基础效果描述 */
  effectDescription: string
  /** 基础摧毁世界数 */
  destroyCount: number
  /** 是否可以被完全抵消 */
  canFullyBlock: boolean
  /** 最多可减免数量（-1表示无限制） */
  maxBlock: number
  /** 特殊类型 */
  specialType?: 'question' | 'erosion' | 'final'
}

/** 对峙会话 */
export interface ConfrontationSession {
  /** 当前回合（1-5） */
  currentRound: number
  /** 存活世界数 */
  worldCount: number
  /** 初始世界数 */
  initialWorldCount: number
  /** 玩家持有的道具列表 */
  relics: Relic[]
  /** 每轮的行动记录 */
  roundHistory: ConfrontationRoundRecord[]
  /** 是否已结束 */
  finished: boolean
  /** 是否胜利 */
  victory: boolean
  /** 被 delay 推迟到下一轮的额外伤害（0表示无） */
  pendingDelayDamage: number
}

/** 单轮行动记录 */
export interface ConfrontationRoundRecord {
  round: number
  voidNarrative: string
  voidEffect: string
  playerAction: string  // 使用的道具名，或"无所为"
  worldCountBefore: number
  worldCountAfter: number
  relicUsed: Relic | null
}

/** 世界结局奖励 */
export interface OutcomeRelic {
  relicId: string
  name: string
  worldName: string
  description: string
  useNarrative: string
  effectType: Relic['effectType']
  effectValue: number
  autoTriggerRound?: number
}
