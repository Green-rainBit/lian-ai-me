import { defineStore } from 'pinia'
import { saveToStorage, loadFromStorage } from '@/utils/helpers'
import { DOG_BREEDS } from '@/data/dogBreeds'
import { MOODS, MOOD_ANIMATIONS } from '@/data/moods'

export const useDogStore = defineStore('dog', {
  state: () => ({
    breed: 'golden-retriever', // 品种ID
    name: '旺财',
    mood: 'happy', // 当前心情
    energy: 100, // 活力值
    accessories: [], // 已购买的饰品
    currentAnimation: 'idle', // 当前动画
    houseLevel: 1, // 狗屋等级
    houseItems: [], // 已放置的家具
    lastInteraction: null, // 最后互动时间
    interactionCount: 0, // 互动次数
    affectionLevel: 0, // 好感度等级
    affectionPoints: 0, // 好感度点数
    achievements: [], // 狗狗相关成就
    tricks: ['sit', 'stay'], // 已学会的技能
    lastTrickTime: null, // 最后表演技能时间
    dailyInteractions: 0, // 今日互动次数
    lastInteractionDate: null // 最后互动日期
  }),

  getters: {
    dogInfo() {
      return DOG_BREEDS.find(b => b.id === this.breed)
    },

    moodVariant() {
      const moodMap = {
        happy: 'happy',
        excited: 'happy',
        calm: 'calm',
        sad: 'sad',
        bored: 'bored',
        sleepy: 'sleeping'
      }
      return moodMap[this.mood] || 'idle'
    },

    moodInfo() {
      return MOODS.find(m => m.id === this.mood)
    },

    needsAttention() {
      if (!this.lastInteraction) return true
      const hoursSinceInteraction = Math.floor(
        (Date.now() - new Date(this.lastInteraction).getTime()) / (1000 * 60 * 60)
      )
      return hoursSinceInteraction > 24
    },

    unlockedBreeds() {
      const userStore = import('./user').then(m => m.useUserStore)
      // 简化版本，实际中需要从user store获取单身天数
      return DOG_BREEDS.filter(b => b.unlockAt === 0)
    },

    // 计算好感度等级
    affectionLevel() {
      return Math.floor(this.affectionPoints / 100) + 1
    },

    // 下个等级所需点数
    nextLevelPoints() {
      const level = this.affectionLevel
      return level * 100
    },

    // 是否需要休息
    needsRest() {
      return this.energy < 30
    },

    // 今日是否可以互动
    canInteract() {
      const today = new Date().toDateString()
      return this.lastInteractionDate !== today || this.dailyInteractions < 10
    }
  },

  actions: {
    async initDog() {
      const saved = await loadFromStorage('dog')
      if (saved) {
        this.$patch(saved)
      }

      // 检查日期是否是新的一天
      const today = new Date().toDateString()
      if (this.lastInteractionDate !== today) {
        this.dailyInteractions = 0
        this.lastInteractionDate = today
      }
    },

    async selectBreed(breedId) {
      this.breed = breedId
      this.currentAnimation = 'happy'
      await saveToStorage('dog', this.$state)
    },

    updateMood(mood) {
      this.mood = mood
      this.currentAnimation = MOOD_ANIMATIONS[mood] || 'idle'
      saveToStorage('dog', this.$state)
    },

    // 增强版互动系统
    interact(action, options = {}) {
      const today = new Date().toDateString()

      // 检查是否是新的一天
      if (this.lastInteractionDate !== today) {
        this.dailyInteractions = 0
        this.lastInteractionDate = today
      }

      // 检查今日互动次数
      if (this.dailyInteractions >= 10 && !options.unlimited) {
        throw new Error('今天互动次数已达上限，明天再来吧！')
      }

      this.lastInteraction = new Date().toISOString()
      this.interactionCount++
      this.dailyInteractions++

      // 消耗活力
      const energyCost = options.energyCost || 5
      this.energy = Math.max(0, this.energy - energyCost)

      // 增加好感度
      const affectionGain = options.affectionGain || 10
      this.affectionPoints += affectionGain

      // 根据互动类型设置动画
      const interactionAnimations = {
        pet: 'happy',
        feed: 'happy',
        play: 'jump',
        talk: 'tail-wag',
        trick: 'jump',
        groom: 'happy'
      }

      this.currentAnimation = interactionAnimations[action] || 'happy'

      // 3秒后恢复idle状态
      setTimeout(() => {
        this.currentAnimation = 'idle'
      }, 3000)

      saveToStorage('dog', this.$state)

      // 返回奖励信息
      return {
        affectionGained: affectionGain,
        energyUsed: energyCost,
        levelUp: this.affectionPoints % 100 === 0
      }
    },

    // 教狗狗新技能
    learnTrick(trickId) {
      if (!this.tricks.includes(trickId)) {
        this.tricks.push(trickId)
        saveToStorage('dog', this.$state)
        return true
      }
      return false
    },

    // 表演技能
    performTrick(trickId) {
      if (this.tricks.includes(trickId) && this.energy >= 15) {
        this.energy -= 15
        this.lastTrickTime = new Date().toISOString()
        this.currentAnimation = 'jump'
        this.affectionPoints += 20

        setTimeout(() => {
          this.currentAnimation = 'idle'
        }, 3000)

        saveToStorage('dog', this.$state)
        return true
      }
      return false
    },

    addAccessory(item) {
      this.accessories.push({
        ...item,
        equippedAt: new Date().toISOString()
      })
      saveToStorage('dog', this.$state)
    },

    // 装备饰品
    equipAccessory(accessoryId) {
      const accessory = this.accessories.find(a => a.id === accessoryId)
      if (accessory) {
        accessory.equipped = true
        saveToStorage('dog', this.$state)
      }
    },

    // 卸下饰品
    unequipAccessory(accessoryId) {
      const accessory = this.accessories.find(a => a.id === accessoryId)
      if (accessory) {
        accessory.equipped = false
        saveToStorage('dog', this.$state)
      }
    },

    upgradeHouse(level) {
      this.houseLevel = level
      saveToStorage('dog', this.$state)
    },

    addHouseItem(item) {
      // 支持放置多个相同物品（使用 instanceId 区分）
      // 如果传入的数据已经包含 instanceId，直接使用
      const houseItem = {
        ...item,
        placedAt: item.placedAt || new Date().toISOString()
      }
      this.houseItems.push(houseItem)
      saveToStorage('dog', this.$state)
    },

    // 更新已放置物品的位置或区域
    updateHouseItem(instanceId, updates) {
      const index = this.houseItems.findIndex(i => i.instanceId === instanceId)
      if (index !== -1) {
        this.houseItems[index] = {
          ...this.houseItems[index],
          ...updates
        }
        saveToStorage('dog', this.$state)
      }
    },

    // 移除已放置的物品
    removeHouseItem(instanceId) {
      const index = this.houseItems.findIndex(i => i.instanceId === instanceId)
      if (index !== -1) {
        this.houseItems.splice(index, 1)
        saveToStorage('dog', this.$state)
      }
    },

    consumeEnergy(amount) {
      this.energy = Math.max(0, this.energy - amount)
      saveToStorage('dog', this.$state)
    },

    restoreEnergy() {
      this.energy = 100
      saveToStorage('dog', this.$state)
    },

    // 喂食
    feed(foodType = 'snack') {
      const foodEnergy = {
        snack: 10,
        meal: 30,
        treat: 15
      }

      const energy = foodEnergy[foodType] || 10
      this.energy = Math.min(100, this.energy + energy)
      this.mood = 'happy'

      saveToStorage('dog', this.$state)

      return {
        energyRestored: energy,
        newEnergy: this.energy
      }
    }
  }
})
