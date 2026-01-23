/**
 * 全局错误处理器
 * 统一处理应用中的各类错误
 */

// 错误类型枚举
export const ErrorTypes = {
  STORAGE: 'STORAGE_ERROR',
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// 错误严重程度
export const ErrorSeverity = {
  LOW: 'low',       // 用户可继续使用
  MEDIUM: 'medium', // 影响部分功能
  HIGH: 'high'      // 严重影响使用
}

/**
 * 错误处理类
 */
class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 100 // 最多保存100条错误日志
  }

  /**
   * 记录错误
   */
  log(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      type: error.type || ErrorTypes.UNKNOWN,
      severity: error.severity || ErrorSeverity.MEDIUM,
      message: error.message || String(error),
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // 添加到日志
    this.errorLog.push(errorEntry)

    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    // 开发环境打印详细错误
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', errorEntry)
    }

    // 生产环境可以上报到错误追踪服务
    if (!import.meta.env.DEV) {
      this.reportToService(errorEntry)
    }

    return errorEntry
  }

  /**
   * 上报错误到追踪服务（可选）
   */
  reportToService(errorEntry) {
    // TODO: 集成错误追踪服务，如 Sentry
    // 目前只在控制台记录
    if (errorEntry.severity === ErrorSeverity.HIGH) {
      console.error('[Critical Error]', errorEntry)
    }
  }

  /**
   * 获取错误日志
   */
  getErrorLog() {
    return [...this.errorLog]
  }

  /**
   * 清空错误日志
   */
  clearErrorLog() {
    this.errorLog = []
  }

  /**
   * 处理 Vue 错误
   */
  handleVueError(err, instance, info) {
    this.log(err, {
      source: 'vue',
      component: instance?.$options?.name || 'Unknown',
      info
    })

    // 显示用户友好的错误提示
    if (window.$toast) {
      window.$toast.error('操作失败，请重试')
    }
  }

  /**
   * 处理未捕获的 Promise 错误
   */
  handleUnhandledRejection(event) {
    this.log(event.reason, {
      source: 'promise',
      type: ErrorTypes.UNKNOWN
    })

    // 防止默认的控制台错误输出
    event.preventDefault()

    if (window.$toast) {
      window.$toast.error('操作失败，请重试')
    }
  }

  /**
   * 处理全局 JavaScript 错误
   */
  handleGlobalError(message, source, lineno, colno, error) {
    this.log(error || new Error(message), {
      source: 'global',
      filename: source,
      line: lineno,
      column: colno
    })

    if (window.$toast) {
      window.$toast.error('应用出现错误，请刷新页面')
    }

    // 返回 true 阻止默认错误处理
    return true
  }

  /**
   * 创建分类的错误对象
   */
  createError(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.MEDIUM) {
    const error = new Error(message)
    error.type = type
    error.severity = severity
    return error
  }
}

// 创建全局单例
export const errorHandler = new ErrorHandler()

/**
 * 初始化全局错误处理
 */
export function initGlobalErrorHandler() {
  // Vue 错误处理在 main.js 中设置
  // 这里处理其他全局错误

  // 未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleUnhandledRejection(event)
  })

  // 全局 JavaScript 错误
  window.addEventListener('error', (event) => {
    errorHandler.handleGlobalError(
      event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error
    )
  })

  if (import.meta.env.DEV) {
    console.log('✅ 全局错误处理已初始化')
  }
}

/**
 * 捕获异步函数错误的包装器
 */
export function withErrorHandler(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.log(error, {
        ...context,
        args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg)
      })

      // 重新抛出错误，让调用者处理
      throw error
    }
  }
}
