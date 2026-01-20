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
      <!-- 可爱装饰元素 -->
      <div class="cute-decorations">
        <span class="deco-heart deco-1">💕</span>
        <span class="deco-paw deco-2">🐾</span>
        <span class="deco-star deco-3">✨</span>
        <span class="deco-heart deco-4">💖</span>
        <span class="deco-star deco-5">⭐</span>
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
        <router-link to="/profile" class="settings-btn"> ⚙️ </router-link>
      </div>

      <!-- 计时器卡片 -->
      <div class="timer-card animate-fade-in-up">
        <div class="timer-label">单身时长</div>
        <div class="timer-display">{{ timeString }}</div>
        <div class="timer-stats">
          <div class="stat-item">
            <span class="stat-icon">🎯</span>
            <span class="stat-text">{{ singleDays }}天</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">{{ dogStore.dogInfo?.icon || "🐕" }}</span>
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

        <!-- 已放置的家具 -->
        <div class="placed-furniture">
          <div
            v-for="item in visibleFurniture"
            :key="item.instanceId || item.id"
            class="furniture-item"
            :class="getQualityClass(item.rarity)"
            :style="{
              left: (item.position?.x || 50) + '%',
              bottom: (item.position?.y || 10) + '%'
            }"
          >
            {{ item.icon }}
          </div>
        </div>

        <!-- 狗狗 -->
        <div
          class="dog-character"
          :class="dogAnimationClass"
          @click="interactWithDog"
        >
          <div class="dog-emoji">{{ dogStore.dogInfo?.emoji || "🐶" }}</div>
          <div
            class="dog-mood-indicator"
            :style="{ backgroundColor: dogStore.moodInfo?.color }"
          ></div>
          <!-- 心形效果 -->
          <div class="heart-float" v-if="showHeart">💕</div>
        </div>

        <!-- 狗狗状态 -->
        <div class="dog-status">
          <div class="energy-bar">
            <div
              class="energy-fill"
              :style="{ width: dogStore.energy + '%' }"
            ></div>
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
        <button @click="goToRoomDecorator" class="action-btn highlight-btn">
          <span class="action-icon">🏡</span>
          <span class="action-label">布置小屋</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useTimerStore } from "@/stores/timer";
import { useDogStore } from "@/stores/dog";
import { useCurrencyStore } from "@/stores/currency";
import { useRoomStore } from "@/stores/room";
import dayjs from "dayjs";

const router = useRouter();
const userStore = useUserStore();
const timerStore = useTimerStore();
const dogStore = useDogStore();
const currencyStore = useCurrencyStore();
const roomStore = useRoomStore();

// 场景状态
const isDay = ref(true);
const showHeart = ref(false);

// 用于强制更新的响应式变量
const timerKey = ref(0);

// 直接在组件中计算单身时长，确保实时更新
const singleDays = computed(() => {
  // 依赖 timerKey 以确保每秒都重新计算
  timerKey.value;
  if (!userStore.startDate) return 0;
  return dayjs().diff(dayjs(userStore.startDate), 'day');
});

const timeString = computed(() => {
  // 依赖 timerKey 以确保每秒都重新计算
  timerKey.value;
  if (!userStore.startDate) return '0天0小时0分0秒';

  const start = dayjs(userStore.startDate);
  const now = dayjs();

  const years = now.diff(start, 'year');
  const months = now.diff(start, 'month') % 12;
  const days = now.diff(start, 'day') % 30;
  const hours = now.diff(start, 'hour') % 24;
  const minutes = now.diff(start, 'minute') % 60;
  const seconds = now.diff(start, 'second') % 60;

  let result = [];
  if (years > 0) result.push(`${years}年`);
  if (months > 0) result.push(`${months}个月`);
  if (days > 0) result.push(`${days}天`);
  if (years === 0) {
    result.push(`${hours}小时`);
    result.push(`${minutes}分`);
    result.push(`${seconds}秒`);
  }

  return result.length > 0 ? result.join('') : '0天0小时0分0秒';
});

// 计算属性
const sceneClass = computed(() => {
  const hour = new Date().getHours();
  isDay.value = hour >= 6 && hour < 18;
  return isDay.value ? "day-scene" : "night-scene";
});

const dogAnimationClass = computed(() => {
  const animations = {
    happy: "animate-tail-wag",
    excited: "animate-jump",
    calm: "animate-breathe",
    sad: "",
    bored: "",
    sleepy: "animate-breathe",
  };
  return animations[dogStore.mood] || "animate-breathe";
});

const moodText = computed(() => {
  const moodTexts = {
    happy: "很开心",
    excited: "超兴奋",
    calm: "很平静",
    sad: "有点难过",
    bored: "有点无聊",
    sleepy: "想睡觉",
    proud: "很自豪",
    grateful: "很感恩",
  };
  return moodTexts[dogStore.mood] || "心情不错";
});

// 获取已放置的家具（按位置排序，y值小的在前面）
const visibleFurniture = computed(() => {
  return [...(dogStore.houseItems || [])].sort((a, b) => {
    return (a.position?.y || 0) - (b.position?.y || 0);
  });
});

// 获取稀有度样式类
const getQualityClass = (rarity) => {
  return `quality-${rarity}`;
};

// 方法
const interactWithDog = () => {
  dogStore.interact("pet");
  // 显示心形效果
  showHeart.value = true;
  setTimeout(() => {
    showHeart.value = false;
  }, 1000);
};

const openDiary = () => {
  router.push("/diary");
};

const goToTasks = () => {
  router.push("/tasks");
};

const goToShop = () => {
  router.push("/shop");
};

const goToRoomDecorator = () => {
  router.push("/room");
};

// 定时更新
let timerInterval = null;

onMounted(() => {
  // 每秒更新计时器
  timerInterval = setInterval(() => {
    timerKey.value++; // 强制触发响应式更新
    timerStore.checkMilestones();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
.scene-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background 1s ease;
}

.scene-container.day-scene {
  background: linear-gradient(
    180deg,
    #ffe5ec 0%,
    #fff0f5 30%,
    #e8f4fd 60%,
    #d4f1f9 100%
  );
}

.scene-container.night-scene {
  background: linear-gradient(180deg, #2d1b4e 0%, #1a1a2e 50%, #0f0f1a 100%);
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
  top: 40px;
  right: 40px;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ffe066, #ffb347);
  border-radius: 50%;
  box-shadow: 0 0 80px rgba(255, 217, 61, 0.5),
    0 0 120px rgba(255, 179, 71, 0.3);
  animation: breathe 2.5s ease-in-out infinite;
}

.sun::before {
  content: "☀️";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
}

.moon {
  position: absolute;
  top: 40px;
  right: 40px;
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #fffacd, #f5f5f5);
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(255, 250, 205, 0.5),
    0 0 100px rgba(245, 245, 245, 0.3);
}

.moon::before {
  content: "🌙";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 35px;
}

/* 可爱装饰元素 */
.cute-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cute-decorations span {
  position: absolute;
  font-size: 24px;
  opacity: 0.6;
  animation: float-up 8s ease-in-out infinite;
}

.deco-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}
.deco-2 {
  top: 60%;
  left: 5%;
  animation-delay: 2s;
  font-size: 18px;
}
.deco-3 {
  top: 30%;
  right: 15%;
  animation-delay: 1s;
}
.deco-4 {
  top: 70%;
  right: 10%;
  animation-delay: 3s;
  font-size: 20px;
}
.deco-5 {
  top: 15%;
  left: 30%;
  animation-delay: 4s;
  font-size: 16px;
}

@keyframes float-up {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-15px) rotate(10deg);
    opacity: 0.7;
  }
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-cute);
  border: 2px solid rgba(255, 182, 193, 0.3);
  transition: all var(--transition-base);
}

.currency-display:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

.coin-icon {
  font-size: var(--font-xl);
  animation: wiggle 2s ease-in-out infinite;
}

.coin-amount {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-cute-pink)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-cute);
  border: 2px solid rgba(255, 182, 193, 0.3);
  font-size: var(--font-xl);
  text-decoration: none;
  transition: all var(--transition-bounce);
}

.settings-btn:hover {
  transform: rotate(90deg) scale(1.1);
  box-shadow: var(--shadow-glow);
}

/* 计时器卡片 */
.timer-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl) var(--space-lg);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-cute);
  text-align: center;
  border: 2px solid rgba(255, 182, 193, 0.25);
  position: relative;
  overflow: hidden;
}

.timer-card::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 182, 193, 0.1),
    transparent
  );
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.timer-label {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  letter-spacing: 2px;
  position: relative;
}

.timer-display {
  font-size: clamp(24px, 6vw, 36px);
  font-weight: var(--font-bold);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-cute-pink-dark),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-md);
  line-height: 1.3;
  position: relative;
}

.timer-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  background: rgba(255, 182, 193, 0.15);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
}

.stat-icon {
  font-size: var(--font-lg);
}

.stat-text {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
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
  background: #d4a574;
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
  background: #8b4513;
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
  content: "";
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
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes blink {
  0%,
  45%,
  55%,
  100% {
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

/* 已放置的家具 */
.placed-furniture {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.furniture-item {
  position: absolute;
  transform: translate(-50%, 50%);
  font-size: clamp(24px, 5vw, 36px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.furniture-item.quality-common {
  filter: drop-shadow(0 0 2px rgba(168, 180, 192, 0.5));
}

.furniture-item.quality-rare {
  filter: drop-shadow(0 0 4px rgba(107, 179, 224, 0.5));
}

.furniture-item.quality-epic {
  filter: drop-shadow(0 0 6px rgba(184, 141, 214, 0.5));
}

.furniture-item.quality-legendary {
  filter: drop-shadow(0 0 8px rgba(255, 183, 77, 0.5));
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), sparkle 2s ease-in-out infinite;
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
  background: linear-gradient(90deg, #6bcb77, #ffd93d);
  transition: width 0.3s ease;
}

.status-text {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-md);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 2px solid rgba(255, 182, 193, 0.25);
  cursor: pointer;
  box-shadow: var(--shadow-cute);
  transition: all var(--transition-bounce);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-cute-pink);
}

.action-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.action-icon {
  font-size: 36px;
  transition: transform var(--transition-base);
}

.action-btn:hover .action-icon {
  animation: wiggle 0.5s ease-in-out;
}

.action-label {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

/* 布置小屋按钮高亮样式 */
.action-btn.highlight-btn {
  background: linear-gradient(
    135deg,
    rgba(255, 140, 66, 0.1),
    rgba(255, 182, 193, 0.1)
  );
  border-color: var(--color-primary);
}

.action-btn.highlight-btn:hover {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-cute-pink)
  );
  border-color: transparent;
}

.action-btn.highlight-btn:hover .action-label {
  color: white;
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .scene-content {
    padding: var(--space-md);
    padding-bottom: 100px;
  }

  .timer-card {
    padding: var(--space-lg) var(--space-md);
  }

  .timer-display {
    font-size: 24px;
  }

  .quick-actions {
    gap: var(--space-sm);
  }

  .action-btn {
    padding: var(--space-md) var(--space-sm);
  }

  .action-icon {
    font-size: 28px;
  }

  .action-label {
    font-size: var(--font-xs);
  }

  .dog-emoji {
    font-size: 90px;
  }

  .dog-scene {
    height: 240px;
  }

  .house-roof {
    font-size: 60px;
  }

  .house-body {
    width: 120px;
    height: 80px;
  }
}
</style>
