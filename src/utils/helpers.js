// 工具函数

// 生成唯一ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 本地存储辅助函数

// 内存存储降级方案（当 localStorage 配额满时使用）
const memoryStorage = new Map()
const MEMORY_STORAGE_PREFIX = '_memory_'

/**
 * 保存到本地存储（自动降级到内存存储）
 * @param {string} key - 存储键
 * @param {*} data - 要存储的数据
 * @param {boolean} forceMemory - 是否强制使用内存存储
 * @returns {boolean} 是否成功
 */
export function saveToStorage(key, data, forceMemory = false) {
  try {
    // 强制使用内存存储或正常存储
    if (forceMemory) {
      memoryStorage.set(key, data)
      return true
    }

    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    // localStorage 配额超限，降级到内存存储
    if (error.name === 'QuotaExceededError') {
      console.warn(`[Storage] localStorage 配额超限，"${key}" 已降级到内存存储`)
      memoryStorage.set(key, data)

      // 通知用户（仅首次降级时）
      if (!memoryStorage.has(MEMORY_STORAGE_PREFIX + 'warned')) {
        memoryStorage.set(MEMORY_STORAGE_PREFIX + 'warned', true)
        if (window.$toast) {
          window.$toast.warning('存储空间不足，数据将保存在内存中，刷新页面后会丢失')
        }
      }
      return true
    }

    console.error(`[Storage] 保存 "${key}" 失败:`, error)
    return false
  }
}

/**
 * 从本地存储加载数据（自动从内存存储降级）
 * @param {string} key - 存储键
 * @returns {*} 存储的数据，失败返回 null
 */
export function loadFromStorage(key) {
  try {
    // 先尝试从 localStorage 读取
    const data = localStorage.getItem(key)
    if (data !== null) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn(`[Storage] 从 localStorage 读取 "${key}" 失败:`, error)
  }

  // localStorage 读取失败或不存在，尝试从内存存储读取
  if (memoryStorage.has(key)) {
    return memoryStorage.get(key)
  }

  return null
}

/**
 * 从本地存储删除数据
 * @param {string} key - 存储键
 * @returns {boolean} 是否成功
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`[Storage] 从 localStorage 删除 "${key}" 失败:`, error)
  }

  // 同时从内存存储删除
  if (memoryStorage.has(key)) {
    memoryStorage.delete(key)
    return true
  }

  return true
}

/**
 * 获取内存存储中的所有键
 * @returns {Array<string>} 所有键
 */
export function getMemoryStorageKeys() {
  return Array.from(memoryStorage.keys()).filter(key => !key.startsWith(MEMORY_STORAGE_PREFIX))
}

/**
 * 清空内存存储（慎用）
 */
export function clearMemoryStorage() {
  memoryStorage.clear()
}

/**
 * 检查数据是否在内存存储中（表示 localStorage 不可用）
 * @param {string} key - 存储键
 * @returns {boolean} 是否在内存存储中
 */
export function isInMemoryStorage(key) {
  return memoryStorage.has(key) && !localStorage.getItem(key)
}

// ===== 新增工具函数 =====

/**
 * 格式化日期为相对时间
 * @param {string|Date} date - 日期
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now - target
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  // 超过一周显示具体日期
  return formatDate(date, 'MM-DD')
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间(ms)
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制(ms)
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))

  const clonedObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

/**
 * 延迟函数
 * @param {number} ms - 延迟时间(ms)
 * @returns {Promise} Promise对象
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 随机数组元素
 * @param {Array} array - 数组
 * @returns {*} 随机元素
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 获取随机数范围
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
export function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 数字格式化（添加千分位）
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀（默认为...）
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}
