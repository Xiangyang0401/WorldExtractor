// ============================================================
// 宇宙尽头 · 文本常量
// ============================================================

export const TEXT = {
  // 游戏标题
  GAME_TITLE: '宇宙尽头',
  GAME_SUBTITLE: '每一个世界，都在走向它的终点',

  // 主界面
  DRAW_WORLD: '游历',
  CREATE_WORLD: '创世',
  ACHIEVEMENTS: '游历笔记',
  SETTINGS: '设置面板',
  CREATE_WORLD_PLACEHOLDER: '为这个世界命名…',
  CREATE_WORLD_CONFIRM: '创世',

  // 世界简介页
  ENTER_WORLD: '踏入此界',
  SKIP_WORLD: '重新选择',

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
  ACHIEVEMENTS_TITLE: '游历笔记',
  ACHIEVEMENTS_EMPTY: '尚无游历记录，踏入一个世界开始你的旅途',
  EXPLORATION_HISTORY: '探索历史',
  FINAL_STATE: '世界终态',

  // 设置页
  SETTINGS_TITLE: '设置面板',
  MODE_ANCIENT: '时间废墟',
  MODE_BOUNDLESS: '创世神典',
  MODE_ANCIENT_DESC: '离线游玩，探索预设世界',
  MODE_BOUNDLESS_DESC: '接入大模型，以创世之名，开辟无限世界',
  AI_API_URL: '渡界通道',
  AI_API_KEY: '渡界令牌',
  AI_MODEL: '模型名称',
  AI_API_URL_PLACEHOLDER: 'https://api.example.com/v1',
  AI_API_KEY_PLACEHOLDER: '输入你的 API Key',
  AI_MODEL_PLACEHOLDER: 'gpt-4o',
  SAVE_SETTINGS: '保存',
  CLEAR_DATA: '抹去所有游历记录',
  CLEAR_DATA_CONFIRM: '确认抹去',
  CLEAR_DATA_WARNING: '此操作将清除所有本地记录，无法恢复',
  STORAGE_USAGE: '已用空间',

  // 加载
  LOADING_WORLD: '此界正在成形…',
  LOADING_RETRY: (n: number) => `第 ${n} 次尝试…`,
  LOADING_FAILED: '此界尚未成形，请检查设置面板配置',
  LOADING_RETRY_BTN: '重试',

  // 模式标签
  MODE_TAG_ANCIENT: '时间废墟',
  MODE_TAG_BOUNDLESS: '创世神典',

  // 错误
  ERROR_NO_WORLDS: '时间废墟模式下暂无可用世界',
  ERROR_AI_NOT_CONFIGURED: '请先在设置面板中配置渡界通道和渡界令牌',
  ERROR_WORLD_NAME_EMPTY: '请为此界命名',

  // 遗物
  RELICS_TITLE: '世界遗物',
  RELICS_EMPTY: '尚无世界遗物，完成探索后获取',
} as const
