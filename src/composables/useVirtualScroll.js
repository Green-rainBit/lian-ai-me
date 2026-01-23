import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 虚拟滚动 Composable
 * 用于优化长列表性能，只渲染可见区域的元素
 *
 * @param {Object} options - 配置选项
 * @param {Array|Function} options.items - 数据数组或返回数组的函数
 * @param {number} options.itemHeight - 单个项目高度（px）
 * @param {number} options.containerHeight - 容器高度（px）
 * @param {number} options.overscan - 预渲染的上下数量（默认3）
 * @returns {Object} 虚拟滚动状态和方法
 */
export function useVirtualScroll(options) {
  const {
    items: itemsOrFn,
    itemHeight = 100,
    containerHeight = 600,
    overscan = 3
  } = options

  const scrollTop = ref(0)
  const containerRef = ref(null)

  // 计算属性：获取数据数组
  const items = computed(() => {
    return typeof itemsOrFn === 'function' ? itemsOrFn() : itemsOrFn.value || itemsOrFn
  })

  // 总高度
  const totalHeight = computed(() => {
    return items.value.length * itemHeight
  })

  // 可见的起始索引
  const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight) - overscan
    return Math.max(0, start)
  })

  // 可见的结束索引
  const endIndex = computed(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = startIndex.value + visibleCount + overscan * 2
    return Math.min(items.value.length, end)
  })

  // 可见的项目
  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value)
  })

  // 偏移量
  const offsetY = computed(() => {
    return startIndex.value * itemHeight
  })

  // 滚动处理
  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
  }

  // 滚动到指定位置
  const scrollTo = (position) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = position
      scrollTop.value = position
    }
  }

  // 滚动到指定索引
  const scrollToIndex = (index) => {
    scrollTo(index * itemHeight)
  }

  // 滚动到顶部
  const scrollToTop = () => {
    scrollTo(0)
  }

  // 滚动到底部
  const scrollToBottom = () => {
    scrollTo(totalHeight.value - containerHeight)
  }

  return {
    scrollTop,
    containerRef,
    totalHeight,
    startIndex,
    endIndex,
    visibleItems,
    offsetY,
    handleScroll,
    scrollTo,
    scrollToIndex,
    scrollToTop,
    scrollToBottom
  }
}

/**
 * 动态高度的虚拟滚动 Composable
 * 适用于不同高度的项目
 *
 * @param {Object} options - 配置选项
 * @param {Array|Function} options.items - 数据数组
 * @param {number} options.containerHeight - 容器高度
 * @param {number} options.estimatedItemHeight - 估计的项目高度
 * @param {number} options.overscan - 预渲染数量
 * @returns {Object} 虚拟滚动状态和方法
 */
export function useDynamicVirtualScroll(options) {
  const {
    items: itemsOrFn,
    containerHeight = 600,
    estimatedItemHeight = 100,
    overscan = 3
  } = options

  const scrollTop = ref(0)
  const containerRef = ref(null)
  const itemHeights = ref(new Map()) // 存储每个项目的实际高度

  // 计算属性：获取数据数组
  const items = computed(() => {
    return typeof itemsOrFn === 'function' ? itemsOrFn() : itemsOrFn.value || itemsOrFn
  })

  // 计算总高度
  const totalHeight = computed(() => {
    let total = 0

    for (let i = 0; i < items.value.length; i++) {
      const height = itemHeights.value.get(i) || estimatedItemHeight
      total += height
    }

    return total
  })

  // 查找指定位置的索引
  const findIndexByPosition = (position) => {
    let currentPos = 0

    for (let i = 0; i < items.value.length; i++) {
      const height = itemHeights.value.get(i) || estimatedItemHeight
      if (currentPos + height >= position) {
        return i
      }
      currentPos += height
    }

    return items.value.length - 1
  }

  // 可见的起始索引
  const startIndex = computed(() => {
    const start = findIndexByPosition(scrollTop.value) - overscan
    return Math.max(0, start)
  })

  // 计算结束索引
  const findEndIndex = () => {
    let currentPos = 0
    const endPosition = scrollTop.value + containerHeight

    for (let i = 0; i < items.value.length; i++) {
      const height = itemHeights.value.get(i) || estimatedItemHeight
      currentPos += height

      if (currentPos >= endPosition) {
        return Math.min(items.value.length, i + overscan)
      }
    }

    return items.value.length
  }

  const endIndex = computed(() => {
    return findEndIndex()
  })

  // 计算偏移量
  const calculateOffset = () => {
    let offset = 0

    for (let i = 0; i < startIndex.value; i++) {
      const height = itemHeights.value.get(i) || estimatedItemHeight
      offset += height
    }

    return offset
  }

  const offsetY = computed(() => {
    return calculateOffset()
  })

  // 可见项目
  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value)
  })

  // 滚动处理
  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
  }

  // 更新项目高度
  const updateItemHeight = (index, height) => {
    if (itemHeights.value.get(index) !== height) {
      itemHeights.value.set(index, height)
    }
  }

  // 滚动到指定索引
  const scrollToIndex = (index) => {
    let position = 0

    for (let i = 0; i < index; i++) {
      const height = itemHeights.value.get(i) || estimatedItemHeight
      position += height
    }

    if (containerRef.value) {
      containerRef.value.scrollTop = position
      scrollTop.value = position
    }
  }

  return {
    scrollTop,
    containerRef,
    totalHeight,
    startIndex,
    endIndex,
    visibleItems,
    offsetY,
    handleScroll,
    updateItemHeight,
    scrollToIndex,
    itemHeights
  }
}

/**
 * 无限滚动 Composable
 * 结合虚拟滚动和分页加载
 *
 * @param {Function} fetchFn - 获取数据的函数
 * @param {Object} options - 配置选项
 * @returns {Object} 无限滚动状态和方法
 */
export function useInfiniteScroll(fetchFn, options = {}) {
  const {
    itemHeight = 100,
    containerHeight = 600,
    overscan = 3,
    pageSize = 20
  } = options

  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const hasMore = ref(true)

  // 使用虚拟滚动
  const virtualScroll = useVirtualScroll({
    items: data,
    itemHeight,
    containerHeight,
    overscan
  })

  // 加载更多数据
  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    error.value = null

    try {
      const page = Math.floor(data.value.length / pageSize) + 1
      const result = await fetchFn(page, pageSize)

      if (result.length === 0) {
        hasMore.value = false
      } else {
        data.value = [...data.value, ...result]

        if (result.length < pageSize) {
          hasMore.value = false
        }
      }

      loading.value = false
    } catch (err) {
      error.value = err
      loading.value = false
    }
  }

  // 刷新数据
  const refresh = async () => {
    data.value = []
    hasMore.value = true
    await loadMore()
  }

  // 检测是否滚动到底部
  const { handleScroll } = virtualScroll
  let isFetching = false

  const handleScrollWithLoad = async (event) => {
    handleScroll(event)

    const { scrollTop, containerRef } = virtualScroll
    const scrollBottom = scrollTop.value + containerHeight
    const isNearBottom = totalHeight.value - scrollBottom < itemHeight * 2

    if (isNearBottom && !isFetching && hasMore.value && !loading.value) {
      isFetching = true
      await loadMore()
      isFetching = false
    }
  }

  return {
    ...virtualScroll,
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    handleScroll: handleScrollWithLoad
  }
}
