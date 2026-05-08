// ============================================================
// 万界拾遗 · API Key 简单加密工具（本地存储保护）
// 注意：前端加密无法防止有意查看的用户，
// 但可以防止 Key 以明文形式直接暴露在 localStorage 中。
// ============================================================

const CIPHER_KEY = 'wjsy_cipher_v1'

/** 简单 XOR + base64 加密 */
export function encryptKey(plaintext: string): string {
  if (!plaintext) return ''
  try {
    const key = CIPHER_KEY
    let result = ''
    for (let i = 0; i < plaintext.length; i++) {
      result += String.fromCharCode(
        plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }
    return btoa(result)
  } catch {
    return ''
  }
}

/** 解密 */
export function decryptKey(encrypted: string): string {
  if (!encrypted) return ''
  try {
    const key = CIPHER_KEY
    const decoded = atob(encrypted)
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }
    return result
  } catch {
    return ''
  }
}
