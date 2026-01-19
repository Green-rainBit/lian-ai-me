<template>
  <div class="scene-container" :class="sceneClass">
    <!-- 背景装饰 -->
    <div class="scene-background">
      <div class="sun" v-if="isDay"></div>
      <div class="moon" v-else></div>
      <div class="clouds">
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
        <div class="cloud cloud-3"></div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="scene-content">
      <!-- 顶部状态栏 -->
      <div class="top-bar">
        <!-- 骨头币显示 -->
        <div class="currency-display">
          <span class="coin-icon">🦴</span>
          <span class="coin-amount">{{ currencyStore.balance }}</span>
        </div>

        <!-- 设置按钮 -->
        <router-link to="/profile" class="settings-btn">
          ⚙️
        </router-link>
      </div>

      <!-- 计时器卡片 -->
      <div class="timer-card animate-fade-in-up">
        <div class="timer-label">单身时长</div>
        <div class="timer-display">{{ timerStore.timeString }}</div>
        <div class="timer-stats">
          <div class="stat-item">
            <span class="stat-icon">🎯</span>
            <span class="stat-text">{{ userStore.singleDays }}天</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">{{ dogStore.dogInfo?.icon || '🐕' }}</span>
            <span class="stat-text">{{ dogStore.name }}</span>
          </div>
        </div>
      </div>

      <!-- 狗狗场景 -->
      <div class="dog-scene">
        <!-- 狗屋 -->
        <div class="dog-house" :class="`house-level-${dogStore.houseLevel}`">
          <div class="house-roof">🏠</div>
          <div class="house-body">
            <div class="house-door"></div>
          </div>
        </div>

        <!-- 狗狗 -->
        <div
          class="dog-character"
          :class="dogAnimationClass"
          @click="interactWithDog"
        >
          <div class="dog-emoji">{{ dogStore.dogInfo?.emoji || '🐶' }}</div>
          <div class="dog-mood-indicator" :style="{ backgroundColor: dogStore.moodInfo?.color }"></div>
          <!-- 心形效果 -->
          <div class="heart-float" v-if="showHeart">💕</div>
        </div>

        <!-- 狗狗状态 -->
        <div class="dog-status">
          <div class="energy-bar">
            <div class="energy-fill" :style="{ width: dogStore.energy + '%' }"></div>
          </div>
          <div class="status-text">{{ moodText }}</div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <button @click="openDiary" class="action-btn">
          <span class="action-icon">📝</span>
          <span class="action-label">记心情</span>
        </button>
        <button @click="goToTasks" class="action-btn">
          <span class="action-icon">⭐</span>
          <span class="action-label">做任务</span>
        </button>
        <button @click="goToShop" class="action-btn">
          <span class="action-icon">🛒</span>
          <span class="action-label">逛商店</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTimerStore } from '@/stores/timer'
import { useDogStore } from '@/stores/dog'
import { useCurrencyStore } from '@/stores/currency'

const router = useRouter()
const userStore = useUserStore()
const timerStore = useTimerStore()
const dogStore = useDogStore()
const currencyStore = useCurrencyStore()

// 场景状态
const isDay = ref(true)
const showHeart = ref(false)

// 计算属性
const sceneClass = computed(() => {
  const hour = new Date().getHours()
  isDay.value = hour >= 6 && hour < 18
  return isDay.value ? 'day-scene' : 'night-scene'
})

const dogAnimationClass = computed(() => {
  const animations = {
    happy: 'animate-tail-wag',
    excited: 'animate-jump',
    calm: 'animate-breathe',
    sad: '',
    bored: '',
    sleepy: 'animate-breathe'
  }
  return animations[dogStore.mood] || 'animate-breathe'
})

const moodText = computed(() => {
  const moodTexts = {
    happy: '很开心',
    excited: '超兴奋',
    calm: '很平静',
    sad: '有点难过',
    bored: '有点无聊',
    sleepy: '想睡觉',
    proud: '很自豪',
    grateful: '很感恩'
  }
  return moodTexts[dogStore.mood] || '心情不错'
})

// 方法
const interactWithDog = () => {
  dogStore.interact('pet')
  // 显示心形效果
  showHeart.value = true
  setTimeout(() => {
    showHeart.value = false
  }, 1000)
}

const openDiary = () => {
  router.push('/diary')
}

const goToTasks = () => {
  router.push('/tasks')
}

const goToShop = () => {
  router.push('/shop')
}

// 定时更新
let timerInterval = null

onMounted(() => {
  // 每秒更新计时器
  timerInterval = setInterval(() => {
    timerStore.checkMilestones()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.scene-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background 1s ease;
}

.scene-container.day-scene {
  background: linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%);
}

.scene-container.night-scene {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

/* 背景装饰 */
.scene-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.sun {
  position: absolute;
  top: 50px;
  right: 50px;
  width: 80px;
  height: 80px;
  background: #FFD93D;
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(255, 217, 61, 0.6);
  animation: breathe 3s ease-in-out infinite;
}

.moon {
  position: absolute;
  top: 50px;
  right: 50px;
  width: 60px;
  height: 60px;
  background: #F5F5F5;
  border-radius: 50%;
  box-shadow: 0 0 40px rgba(245, 245, 245, 0.4);
}

.clouds {
  position: absolute;
  inset: 0;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  animation: float 20s linear infinite;
}

.cloud-1 {
  width: 100px;
  height: 40px;
  top: 15%;
  left: -100px;
  animation-duration: 25s;
}

.cloud-2 {
  width: 80px;
  height: 30px;
  top: 25%;
  left: -80px;
  animation-duration: 30s;
  animation-delay: 5s;
}

.cloud-3 {
  width: 120px;
  height: 50px;
  top: 10%;
  left: -120px;
  animation-duration: 35s;
  animation-delay: 10s;
}

@keyframes float {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(100vw + 200px));
  }
}

/* 主内容 */
.scene-content {
  position: relative;
  z-index: 1;
  padding: var(--space-lg);
  padding-bottom: 100px;
}

/* 顶部状态栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.currency-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-bg-card);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
}

.coin-icon {
  font-size: var(--font-xl);
}

.coin-amount {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.settings-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-card);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  font-size: var(--font-xl);
  text-decoration: none;
  transition: transform var(--transition-base);
}

.settings-btn:hover {
  transform: rotate(45deg);
}

/* 计时器卡片 */
.timer-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.timer-label {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.timer-display {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
  line-height: 1.2;
}

.timer-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.stat-icon {
  font-size: var(--font-lg);
}

.stat-text {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

/* 狗狗场景 */
.dog-scene {
  position: relative;
  height: 300px;
  margin-bottom: var(--space-xl);
}

.dog-house {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.house-roof {
  font-size: 80px;
  margin-bottom: -20px;
}

.house-body {
  background: #D4A574;
  width: 150px;
  height: 100px;
  margin: 0 auto;
  border-radius: var(--radius-md);
  position: relative;
}

.house-door {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 70px;
  background: #8B4513;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.dog-character {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  transition: transform var(--transition-base);
}

.dog-character:hover {
  transform: translateX(-50%) scale(1.1);
}

/* 心形浮动效果 */
.heart-float {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32px;
  animation: heart-float-up 1s ease-out forwards;
  pointer-events: none;
}

@keyframes heart-float-up {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) translateY(-30px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-60px) scale(1);
  }
}

.dog-emoji {
  font-size: 120px;
  display: block;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
  animation: cute-bounce 2s ease-in-out infinite;
  position: relative;
}

/* 可爱眨眼动画 */
.dog-emoji::after {
  content: '';
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  animation: blink 4s ease-in-out infinite;
}

@keyframes cute-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes blink {
  0%, 45%, 55%, 100% {
    transform: translateX(-50%) scaleY(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) scaleY(0.1);
    opacity: 0.5;
  }
}

.dog-mood-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin: 8px auto 0;
  box-shadow: 0 0 10px currentColor;
}

.dog-status {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 200px;
}

.energy-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-xs);
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #6BCB77, #FFD93D);
  transition: width 0.3s ease;
}

.status-text {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.action-btn:active {
  transform: translateY(-2px);
}

.action-icon {
  font-size: var(--font-3xl);
}

.action-label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}
</style>
