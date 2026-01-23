/**
 * Pinia Stores 统一管理
 * 解决循环依赖问题，提供统一的初始化接口
 */

import { defineStore } from 'pinia'

// 导出所有 stores
export { useUserStore } from './user'
export { useTimerStore } from './timer'
export { useDogStore } from './dog'
export { useCurrencyStore } from './currency'
export { useShopStore } from './shop'
export { useRoomStore } from './room'
export { useTasksStore } from './tasks'
export { useDiaryStore } from './diary'
export { useCommunityStore } from './community'
export { useAchievementStore } from './achievements'

/**
 * 初始化所有 stores
 * 按照依赖关系顺序初始化，避免循环依赖
 */
export async function initAllStores() {
  // 定义初始化顺序（依赖关系：user → timer/currency → dog → shop/room → tasks/diary/community → achievements）
  const initOrder = [
    'user',
    'timer',
    'currency',
    'dog',
    'shop',
    'room',
    'tasks',
    'diary',
    'community',
    'achievements'
  ]

  // 动态导入所有 stores
  const stores = {
    user: (await import('./user')).useUserStore(),
    timer: (await import('./timer')).useTimerStore(),
    currency: (await import('./currency')).useCurrencyStore(),
    dog: (await import('./dog')).useDogStore(),
    shop: (await import('./shop')).useShopStore(),
    room: (await import('./room')).useRoomStore(),
    tasks: (await import('./tasks')).useTasksStore(),
    diary: (await import('./diary')).useDiaryStore(),
    community: (await import('./community')).useCommunityStore(),
    achievements: (await import('./achievements')).useAchievementStore()
  }

  // 按顺序初始化每个 store
  for (const storeName of initOrder) {
    const store = stores[storeName]
    if (!store) {
      console.warn(`[Stores] Store "${storeName}" not found`)
      continue
    }

    // 构建初始化方法名（如 initUser, initTimer 等）
    const initMethod = `init${storeName.charAt(0).toUpperCase() + storeName.slice(1)}`

    if (typeof store[initMethod] === 'function') {
      try {
        await store[initMethod]()
        if (import.meta.env.DEV) {
          console.log(`✅ [Stores] ${storeName} initialized`)
        }
      } catch (error) {
        console.error(`❌ [Stores] Failed to initialize ${storeName}:`, error)
        throw error
      }
    } else {
      if (import.meta.env.DEV) {
        console.log(`ℹ️  [Stores] ${storeName} has no init method`)
      }
    }
  }

  return stores
}

/**
 * 获取所有 store 实例
 * 用于在组件中访问多个 stores
 */
export async function getAllStores() {
  return {
    user: (await import('./user')).useUserStore(),
    timer: (await import('./timer')).useTimerStore(),
    currency: (await import('./currency')).useCurrencyStore(),
    dog: (await import('./dog')).useDogStore(),
    shop: (await import('./shop')).useShopStore(),
    room: (await import('./room')).useRoomStore(),
    tasks: (await import('./tasks')).useTasksStore(),
    diary: (await import('./diary')).useDiaryStore(),
    community: (await import('./community')).useCommunityStore(),
    achievements: (await import('./achievements')).useAchievementStore()
  }
}

/**
 * 重置所有 stores（用于测试或登出）
 */
export async function resetAllStores() {
  const stores = await getAllStores()

  for (const [name, store] of Object.entries(stores)) {
    if (typeof store.$reset === 'function') {
      store.$reset()
      if (import.meta.env.DEV) {
        console.log(`🔄 [Stores] ${name} reset`)
      }
    }
  }
}
