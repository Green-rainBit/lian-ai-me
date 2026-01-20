import { defineStore } from 'pinia'
import { saveToStorage, loadFromStorage } from '@/utils/helpers'
import { generateId } from '@/utils/helpers'
import { SHOP_ITEMS, SHOP_CATEGORIES } from '@/data/shopItems'
import { HOUSE_ZONES } from '@/data/houseZones'
import { useCurrencyStore } from './currency'
import { useDogStore } from './dog'
import { useAchievementStore } from './achievements'

export const useShopStore = defineStore('shop', {
  state: () => ({
    categories: SHOP_CATEGORIES,
    items: SHOP_ITEMS,
    ownedItems: [],
    selectedCategory: 'furniture'
  }),

  getters: {
    itemsByCategory() {
      return (categoryId) => {
        return this.items.filter(item => item.category === categoryId)
      }
    },

    ownedItemsByCategory() {
      return (categoryId) => {
        return this.ownedItems.filter(
          item => item.category === categoryId
        )
      }
    },

    isItemOwned() {
      return (itemId) => {
        return this.ownedItems.some(item => item.id === itemId)
      }
    },

    totalPurchased() {
      return this.ownedItems.length
    }
  },

  actions: {
    async initShop() {
      const saved = await loadFromStorage('shop')
      if (saved) {
        this.$patch(saved)
      }
    },

    async purchaseItem(itemId) {
      const item = this.items.find(i => i.id === itemId)

      if (!item) {
        throw new Error('商品不存在')
      }

      if (this.isItemOwned(itemId)) {
        throw new Error('已拥有此商品')
      }

      const currencyStore = useCurrencyStore()

      try {
        await currencyStore.spend(item.price, item, `购买: ${item.name}`)

        this.ownedItems.push({
          ...item,
          purchasedAt: new Date().toISOString()
        })

        // 如果是家具或饰品，自动放置/装备
        if (item.type === 'furniture' || item.type === 'upgrade') {
          const dogStore = useDogStore()

          if (item.type === 'upgrade') {
            // 升级狗屋
            dogStore.upgradeHouse(dogStore.houseLevel + 1)
          } else {
            // 放置家具 - 自动分配到指定区域和默认位置
            const zone = item.placementZone || 'ground'
            const zoneConfig = HOUSE_ZONES[zone]

            // 添加随机偏移避免物品重叠
            const offsetX = (Math.random() - 0.5) * 10
            const offsetY = (Math.random() - 0.5) * 10

            dogStore.addHouseItem({
              ...item,
              instanceId: generateId(),
              itemId: item.id,
              zone: zone,
              position: {
                x: zoneConfig.defaultPosition.x + offsetX,
                y: zoneConfig.defaultPosition.y + offsetY
              },
              placedAt: new Date().toISOString()
            })
          }
        } else if (item.type === 'accessory') {
          const dogStore = useDogStore()
          dogStore.addAccessory(item)
        } else if (item.type === 'consumable') {
          // 消耗品使用效果
          const dogStore = useDogStore()
          if (item.effect === 'restore_energy') {
            dogStore.restoreEnergy()
          }
        }

        // 检查成就
        const achievementStore = useAchievementStore()
        await achievementStore.checkAchievements('items_purchased', this.totalPurchased)

        await saveToStorage('shop', this.$state)

        return item
      } catch (error) {
        throw error
      }
    },

    selectCategory(categoryId) {
      this.selectedCategory = categoryId
      saveToStorage('shop', this.$state)
    }
  }
})
