// ============================================================
// 万界拾遗 · AI 服务（无界模式）
// ============================================================

import type { WorldData, WorldHistory, WorldFrame, AppSettings } from '@/types'
import { decryptKey } from '@/utils/crypto'
import { sleep } from '@/utils'

const MAX_RETRIES = 3
const RETRY_DELAY = 1500

export type ProgressCallback = (step: string, percent: number) => void

async function callAI(
  settings: AppSettings,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = decryptKey(settings.aiApiKeyEncrypted)

  if (!settings.aiApiUrl || !apiKey) {
    throw new Error('请先在行囊中配置渡界通道和渡界令牌')
  }

  const url = settings.aiApiUrl.replace(/\/$/, '') + '/chat/completions'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: settings.aiModel || 'gpt-4o',
      messages,
      temperature: 0.85,
      max_tokens: 8192,
    }),
    signal,
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '未知错误')
    throw new Error(`AI接口返回错误 ${response.status}: ${errText}`)
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI返回内容为空')
  return content
}

function safeParseJSON<T>(text: string): T | null {
  try {
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    const arrStart = text.indexOf('[')
    const arrEnd = text.lastIndexOf(']')

    let jsonStr: string
    if (arrStart !== -1 && (jsonStart === -1 || arrStart < jsonStart)) {
      jsonStr = text.slice(arrStart, arrEnd + 1)
    } else if (jsonStart !== -1) {
      jsonStr = text.slice(jsonStart, jsonEnd + 1)
    } else {
      jsonStr = text.trim()
    }

    jsonStr = escapeStringValues(jsonStr)
    jsonStr = jsonStr
      .replace(/\u201c/g, '"')
      .replace(/\u201d/g, '"')

    return JSON.parse(jsonStr) as T
  } catch (e) {
    console.error('[万界拾遗] JSON解析失败:', e)
    const posMatch = String(e).match(/position (\d+)/)
    if (posMatch) {
      const pos = parseInt(posMatch[1])
      console.log(`[万界拾遗] 失败位置附近 (pos=${pos}):`, JSON.stringify(text.slice(Math.max(0, pos - 100), pos + 100)))
    }
    console.log('[万界拾遗] 完整原始内容:', text)
    return null
  }
}

function escapeStringValues(json: string): string {
  let result = ''
  let inString = false
  let i = 0
  while (i < json.length) {
    const ch = json[i]
    if (inString) {
      if (ch === '\\') {
        result += ch + (json[i + 1] ?? '')
        i += 2
        continue
      } else if (ch === '"') {
        inString = false
        result += ch
      } else if (ch === '\n') {
        result += '\\n'
      } else if (ch === '\r') {
        result += '\\r'
      } else if (ch === '\t') {
        result += '\\t'
      } else {
        result += ch
      }
    } else {
      if (ch === '"') inString = true
      result += ch
    }
    i++
  }
  return result
}

async function callAIWithRetry(
  settings: AppSettings,
  messages: Array<{ role: string; content: string }>,
  onRetry?: (attempt: number) => void,
  signal?: AbortSignal
): Promise<string> {
  let lastError: Error = new Error('未知错误')
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callAI(settings, messages, signal)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < MAX_RETRIES) {
        onRetry?.(attempt)
        await sleep(RETRY_DELAY * attempt)
      }
    }
  }
  throw lastError
}

function sanitizeDeltas(deltas: unknown, validKeys: string[]): Record<string, number> {
  if (!deltas || typeof deltas !== 'object') return {}
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(deltas as Record<string, unknown>)) {
    if (validKeys.includes(k) && typeof v === 'number') {
      result[k] = Math.max(-20, Math.min(25, v))
    }
  }
  return result
}

const FRAME_SCHEMA = `{
  "id": "unique-kebab-case-id",
  "name": "世界名称",
  "description": "世界简介300-500字文学风格",
  "attributes": [
    { "key": "attr1", "name": "属性名", "description": "属性含义" },
    { "key": "attr2", "name": "属性名", "description": "属性含义" },
    { "key": "attr3", "name": "属性名", "description": "属性含义" },
    { "key": "attr4", "name": "属性名", "description": "属性含义" }
  ],
  "identities": [
    { "id": "identity1", "internalName": "身份名", "description": "身份描述" },
    { "id": "identity2", "internalName": "身份名", "description": "身份描述" }
  ],
  "outcomes": [
    {
      "id": "outcome1",
      "name": "结局名称",
      "narrative": "结局叙述200-400字",
      "achievementName": "渡痕·世界名：成就名",
      "achievementDescription": "成就描述",
      "conditions": [
        { "attributeKey": "attr1", "operator": ">=", "threshold": 65, "outcomeId": "outcome1" }
      ]
    }
  ]
}`

const EVENTS_SCHEMA = `[
  {
    "index": 1,
    "time": "符合世界观的时间描述",
    "narrative": "事件叙述200-400字第二人称文学风格",
    "choices": [
      {
        "id": 1,
        "text": "选项文字简短",
        "consequence": "选择后的结果叙述100-200字",
        "attributeDeltas": { "attr1": 5, "attr2": -3 }
      }
    ]
  }
]`

export async function generateWorldFrame(
  worldName: string,
  settings: AppSettings,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<WorldFrame> {
  onProgress?.('此界轮廓正在成形…', 15)

  const messages = [
    {
      role: 'system',
      content: `你是一个世界构建者，为文字探索游戏「万界拾遗」生成世界框架数据。框架包含：世界简介、4个专属属性、2个玩家身份、2-3个结局。文风：文学性强，偏诗意。
请严格按照如下JSON格式输出：
${FRAME_SCHEMA}

重要：只输出JSON，字符串内换行用\\n，不要使用中文引号，outcomes必须2-3个。`,
    },
    {
      role: 'user',
      content: `请为名叫「${worldName}」的世界生成框架数据。只输出JSON，字符串内换行用\\n。`,
    },
  ]

  const raw = await callAIWithRetry(
    settings, messages,
    (attempt) => onProgress?.(`第 ${attempt + 1} 次尝试…`, 15),
    signal
  )

  onProgress?.('解析世界框架…', 40)

  const parsed = safeParseJSON<Partial<WorldFrame>>(raw)
  if (!parsed) throw new Error('世界框架解析失败，请重试')

  const frame: WorldFrame = {
    id: parsed.id || `ai-${worldName}-${Date.now()}`,
    name: parsed.name || worldName,
    description: parsed.description || '',
    attributes: Array.isArray(parsed.attributes) && parsed.attributes.length === 4
      ? parsed.attributes
      : [
          { key: 'attr1', name: '属性一', description: '' },
          { key: 'attr2', name: '属性二', description: '' },
          { key: 'attr3', name: '属性三', description: '' },
          { key: 'attr4', name: '属性四', description: '' },
        ],
    identities: Array.isArray(parsed.identities) && parsed.identities.length >= 1
      ? parsed.identities.slice(0, 2)
      : [{ id: 'default', internalName: '旅人', description: '一个来自未知之地的旅人' }],
    outcomes: Array.isArray(parsed.outcomes) && parsed.outcomes.length >= 1
      ? parsed.outcomes
      : [],
    createdAt: Date.now(),
  }

  onProgress?.('世界框架成形', 50)
  return frame
}

export async function generateWorldEvents(
  frame: WorldFrame,
  history: WorldHistory | null,
  settings: AppSettings,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
) {
  onProgress?.('此界事件正在涌现…', 55)

  const historyContext = history
    ? `此世界已被探索 ${history.explorationCount} 次。上一次结局是「${history.lastOutcomeName}」。当前属性：${JSON.stringify(history.currentAttributes)}。请在新一轮5个事件中体现历史影响，让玩家感受到世界在真实演变。`
    : '这是第一次有人踏入此界，世界尚未被任何人影响。'

  const attrKeys = frame.attributes.map(a => a.key).join(', ')

  const messages = [
    {
      role: 'system',
      content: `你是一个世界构建者，为文字探索游戏「万界拾遗」生成本次探索的5个事件。
世界名称：${frame.name}
世界简介：${frame.description}
属性：${frame.attributes.map(a => `${a.key}(${a.name})`).join(', ')}
${historyContext}

请按如下JSON数组格式输出5个事件：
${EVENTS_SCHEMA}

重要：只输出JSON数组，字符串内换行用\\n，不要中文引号，必须5个事件，attributeDeltas的key必须是：${attrKeys}，值域-15到+20。`,
    },
    {
      role: 'user',
      content: `请为「${frame.name}」生成本次探索的5个事件。只输出JSON数组，字符串内换行用\\n。`,
    },
  ]

  const raw = await callAIWithRetry(
    settings, messages,
    (attempt) => onProgress?.(`第 ${attempt + 1} 次尝试…`, 55),
    signal
  )

  onProgress?.('解析事件数据…', 85)

  let parsed: unknown = safeParseJSON(raw)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>
    parsed = obj['events'] ?? obj['data'] ?? parsed
  }

  const attrKeyList = frame.attributes.map(a => a.key)
  const rawEvents = Array.isArray(parsed) ? parsed : []

  const events = Array.from({ length: 5 }, (_, i) => {
    const existing = rawEvents.find((e: { index?: number }) => e.index === i + 1) || rawEvents[i]
    if (existing) {
      return {
        index: i + 1,
        time: existing.time || `第${i + 1}章`,
        narrative: existing.narrative || '',
        choices: Array.isArray(existing.choices)
          ? existing.choices.map((c: {
              id?: number; text?: string
              consequence?: string; attributeDeltas?: unknown
            }, ci: number) => ({
              id: c.id || ci + 1,
              text: c.text || `选择${ci + 1}`,
              consequence: c.consequence || '',
              attributeDeltas: sanitizeDeltas(c.attributeDeltas, attrKeyList),
            }))
          : [],
      }
    }
    return {
      index: i + 1,
      time: `第${i + 1}章`,
      narrative: '（此章节生成失败，请重试）',
      choices: [],
    }
  })

  onProgress?.('世界成形完毕', 100)
  return events
}

export async function generateFullWorldData(
  worldName: string,
  settings: AppSettings,
  existingFrame: WorldFrame | null,
  history: WorldHistory | null,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<{ world: WorldData; frame: WorldFrame }> {
  let frame = existingFrame
  if (!frame) {
    frame = await generateWorldFrame(worldName, settings, onProgress, signal)
  } else {
    onProgress?.('读取世界框架…', 45)
  }

  const events = await generateWorldEvents(frame, history, settings, onProgress, signal)

  const world: WorldData = {
    id: frame.id,
    name: frame.name,
    description: frame.description,
    attributes: frame.attributes,
    identities: frame.identities,
    outcomes: frame.outcomes,
    events,
  }

  return { world, frame }
}
