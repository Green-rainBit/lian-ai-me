/**
 * Composables 统一导出
 * 可复用的 Vue 3 Composition API 函数
 */

// 定时器和延迟
export { useTimer, useTimeout } from './useTimer'

// 本地存储
export { useLocalStorage, useSessionStorage } from './useLocalStorage'

// 异步数据
export {
  useAsyncData,
  useFetch,
  useAsyncAll,
  useDebouncedAsync
} from './useAsyncData'

// 事件监听
export {
  useEventListeners,
  useWindowEvents,
  useDocumentEvents,
  useKeyboard
} from './useEventListeners'

// 错误处理
export {
  useErrorHandler,
  useRetry,
  useFormValidation
} from './useErrorHandler'

// 加载状态
export {
  useLoading,
  useMultipleLoadings,
  usePagination,
  globalLoading,
  globalError,
  setGlobalLoading,
  setGlobalError
} from './useLoading'

// 虚拟滚动
export {
  useVirtualScroll,
  useDynamicVirtualScroll,
  useInfiniteScroll
} from './useVirtualScroll'
