// ============================================================
// 万界拾遗 · 文本常量
// ============================================================

export const TEXT = {
  // 游戏标题
  GAME_TITLE: '万界拾遗',
  GAME_SUBTITLE: '每一个世界，都是一段无法重演的旅途',

  // 主界面
  DRAW_WORLD: '渡界',
  CREATE_WORLD: '以名造界',
  ACHIEVEMENTS: '渡痕',
  SETTINGS: '行囊',
  CREATE_WORLD_PLACEHOLDER: '为这个世界命名…',
  CREATE_WORLD_CONFIRM: '造界',

  // 世界简介页
  ENTER_WORLD: '踏入此界',
  SKIP_WORLD: '此界与我无缘',

  // 探索界面
  EXPLORATION_INDEX: (n: number) => `第 ${n} 印`,
  ATTRIBUTE_CHANGE: '界变',
  WORLD_RIPPLE: '余波',
  CONFIRM_CHOICE: '做出选择',

  // 退出提示
  EXIT_WARNING_TITLE: '离界',
  EXIT_WARNING_BODY: '离开后此界将永远消散，确定要离开吗？',
  EXIT_CONFIRM: '离界',
  EXIT_CANCEL: '继续探索',

  // 结局页
  OUTCOME_TITLE: '归宿',
  ACHIEVEMENT_UNLOCKED: '留痕',
  BACK_TO_HOME: '归返',

  // 成就页
  ACHIEVEMENTS_TITLE: '渡痕',
  ACHIEVEMENTS_EMPTY: '尚无渡痕，踏入一个世界开始你的旅途',
  EXPLORATION_HISTORY: '探索历史',
  FINAL_STATE: '世界终态',

  // 设置页
  SETTINGS_TITLE: '行囊',
  MODE_ANCIENT: '古卷模式',
  MODE_BOUNDLESS: '无界模式',
  MODE_ANCIENT_DESC: '离线游玩，探索预设世界',
  MODE_BOUNDLESS_DESC: '接入大模型，以名造界，探索无限世界',
  AI_API_URL: '渡界通道',
  AI_API_KEY: '渡界令牌',
  AI_MODEL: '模型名称',
  AI_API_URL_PLACEHOLDER: 'https://api.example.com/v1',
  AI_API_KEY_PLACEHOLDER: '输入你的 API Key',
  AI_MODEL_PLACEHOLDER: 'gpt-4o',
  SAVE_SETTINGS: '保存',
  CLEAR_DATA: '抹去所有渡痕',
  CLEAR_DATA_CONFIRM: '确认抹去',
  CLEAR_DATA_WARNING: '此操作将清除所有本地记录，无法恢复',
  STORAGE_USAGE: '行囊已用',

  // 加载
  LOADING_WORLD: '此界正在成形…',
  LOADING_RETRY: (n: number) => `第 ${n} 次尝试…`,
  LOADING_FAILED: '此界尚未成形，请检查行囊配置',
  LOADING_RETRY_BTN: '重试',

  // 模式标签
  MODE_TAG_ANCIENT: '古卷',
  MODE_TAG_BOUNDLESS: '无界',

  // 错误
  ERROR_NO_WORLDS: '古卷模式下暂无可用世界',
  ERROR_AI_NOT_CONFIGURED: '请先在行囊中配置渡界通道和渡界令牌',
  ERROR_WORLD_NAME_EMPTY: '请为此界命名',
} as const
