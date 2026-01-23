<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>
          <!-- 头部 -->
          <div class="modal-header">
            <h2 class="modal-title">和{{ dogStore.name }}互动</h2>
            <button class="close-btn" @click="handleClose" aria-label="关闭">
              ✕
            </button>
          </div>

          <!-- 狗狗状态 -->
          <div class="dog-status-panel">
            <div class="status-item">
              <span class="status-icon">💕</span>
              <div class="status-info">
                <span class="status-label">好感度</span>
                <span class="status-value">Lv.{{ dogStore.affectionLevel }}</span>
                <span class="status-progress">{{ dogStore.affectionPoints % 100 }}/100</span>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">⚡</span>
              <div class="status-info">
                <span class="status-label">活力值</span>
                <span class="status-value">{{ dogStore.energy }}%</span>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">🎯</span>
              <div class="status-info">
                <span class="status-label">今日互动</span>
                <span class="status-value">{{ dogStore.dailyInteractions }}/10</span>
              </div>
            </div>
          </div>

          <!-- 互动选项 -->
          <div class="interaction-grid">
            <button
              class="interaction-btn"
              :class="{ disabled: !canInteract }"
              @click="handleInteract('pet')"
              :disabled="!canInteract"
            >
              <span class="btn-icon">🤚</span>
              <span class="btn-label">抚摸</span>
              <span class="btn-cost">-5 活力</span>
            </button>

            <button
              class="interaction-btn feed"
              :class="{ disabled: !canInteract }"
              @click="showFeedMenu"
              :disabled="!canInteract"
            >
              <span class="btn-icon">🍖</span>
              <span class="btn-label">喂食</span>
              <span class="btn-cost">+活力</span>
            </button>

            <button
              class="interaction-btn"
              :class="{ disabled: !canInteract || dogStore.energy < 15 }"
              @click="handleInteract('play')"
              :disabled="!canInteract || dogStore.energy < 15"
            >
              <span class="btn-icon">🎾</span>
              <span class="btn-label">玩耍</span>
              <span class="btn-cost">-15 活力</span>
            </button>

            <button
              class="interaction-btn"
              :class="{ disabled: !canInteract }"
              @click="handleInteract('talk')"
              :disabled="!canInteract"
            >
              <span class="btn-icon">💬</span>
              <span class="btn-label">说话</span>
              <span class="btn-cost">-3 活力</span>
            </button>

            <button
              class="interaction-btn trick"
              :class="{ disabled: !canInteract || dogStore.energy < 15 }"
              @click="handlePerformTrick"
              :disabled="!canInteract || dogStore.energy < 15"
            >
              <span class="btn-icon">🎪</span>
              <span class="btn-label">表演技能</span>
              <span class="btn-cost">-15 活力</span>
            </button>

            <button
              class="interaction-btn groom"
              :class="{ disabled: !canInteract || dogStore.energy < 10 }"
              @click="handleInteract('groom')"
              :disabled="!canInteract || dogStore.energy < 10"
            >
              <span class="btn-icon">✨</span>
              <span class="btn-label">梳毛</span>
              <span class="btn-cost">-10 活力</span>
            </button>
          </div>

          <!-- 提示信息 -->
          <div v-if="!canInteract" class="limit-warning">
            ⚠️ 今天互动次数已达上限，明天再来吧！
          </div>

          <!-- 喂食菜单 -->
          <transition name="fade">
            <div v-if="showFeedOptions" class="feed-menu">
              <h3 class="feed-menu-title">选择食物</h3>
              <div class="feed-options">
                <button class="feed-btn" @click="handleFeed('snack')">
                  <span class="feed-icon">🍪</span>
                  <span class="feed-name">零食</span>
                  <span class="feed-effect">+10 活力</span>
                </button>
                <button class="feed-btn" @click="handleFeed('meal')">
                  <span class="feed-icon">🍲</span>
                  <span class="feed-name">正餐</span>
                  <span class="feed-effect">+30 活力</span>
                </button>
                <button class="feed-btn" @click="handleFeed('treat')">
                  <span class="feed-icon">🦴</span>
                  <span class="feed-name">骨头奖励</span>
                  <span class="feed-effect">+15 活力</span>
                </button>
              </div>
              <button class="feed-close-btn" @click="hideFeedMenu">取消</button>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDogStore } from '@/stores/dog'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const dogStore = useDogStore()
const showFeedOptions = ref(false)

// 是否可以互动
const canInteract = computed(() => dogStore.canInteract)

// 关闭模态框
const handleClose = () => {
  emit('close')
}

// 互动处理
const handleInteract = (action) => {
  if (!canInteract.value) return

  try {
    const energyCosts = {
      pet: 5,
      feed: 0,
      play: 15,
      talk: 3,
      trick: 15,
      groom: 10
    }

    const affectionGains = {
      pet: 10,
      feed: 5,
      play: 20,
      talk: 8,
      trick: 25,
      groom: 12
    }

    const result = dogStore.interact(action, {
      energyCost: energyCosts[action],
      affectionGain: affectionGains[action]
    })

    // 显示结果反馈
    if (result.levelUp) {
      window.$toast?.success(`🎉 好感度升级到 Lv.${dogStore.affectionLevel}！`)
    } else {
      window.$toast?.success(`💕 好感度 +${result.affectionGained}`)
    }

    // 如果活力过低，提示休息
    if (dogStore.needsRest) {
      window.$toast?.warning('⚠️ ' + dogStore.name + ' 累了，需要休息')
    }
  } catch (error) {
    window.$toast?.error(error.message)
  }
}

// 显示喂食菜单
const showFeedMenu = () => {
  if (!canInteract.value) return
  showFeedOptions.value = true
}

// 隐藏喂食菜单
const hideFeedMenu = () => {
  showFeedOptions.value = false
}

// 喂食处理
const handleFeed = (foodType) => {
  const result = dogStore.feed(foodType)

  window.$toast?.success(`🍖 ${dogStore.name} 吃得很开心，活力 +${result.energyRestored}`)

  hideFeedMenu()
}

// 表演技能
const handlePerformTrick = () => {
  if (!canInteract.value || dogStore.energy < 15) return

  const trick = dogStore.tricks[0] // 使用第一个技能
  if (trick) {
    const success = dogStore.performTrick(trick)
    if (success) {
      window.$toast?.success(`🎪 ${dogStore.name} 表演了技能，好感度 +20`)
    }
  } else {
    window.$toast?.info('📚 还没有学会技能哦')
  }
}
</script>

<style scoped>
/* 模态框覆盖层 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* 模态框内容 */
.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  position: relative;
}

/* 头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: rotate(90deg);
}

/* 狗狗状态面板 */
.dog-status-panel {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 182, 193, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 182, 193, 0.3);
}

.status-icon {
  font-size: 24px;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.status-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.status-progress {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 互动网格 */
.interaction-grid {
  padding: 0 24px 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.interaction-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.interaction-btn:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(255, 140, 148, 0.3);
  border-color: var(--color-primary);
}

.interaction-btn:active:not(.disabled) {
  transform: translateY(-2px);
}

.interaction-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.btn-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.btn-cost {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* 特殊按钮样式 */
.interaction-btn.feed {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 255, 255, 0.9));
}

.interaction-btn.trick {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(255, 255, 255, 0.9));
}

.interaction-btn.groom {
  background: linear-gradient(135deg, rgba(236, 64, 122, 0.1), rgba(255, 255, 255, 0.9));
}

/* 警告信息 */
.limit-warning {
  margin: 0 24px 24px;
  padding: 12px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 12px;
  text-align: center;
  font-size: 13px;
  color: #e65100;
  font-weight: 500;
}

/* 喂食菜单 */
.feed-menu {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.feed-menu-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 20px 0;
  text-align: center;
}

.feed-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.feed-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.feed-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  border-color: #ffc107;
}

.feed-icon {
  font-size: 32px;
}

.feed-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: left;
}

.feed-effect {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
}

.feed-close-btn {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.feed-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  transform: scale(1) translateY(0);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    margin: auto 0 0;
    max-height: 80vh;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .interaction-grid {
    grid-template-columns: 1fr;
  }

  .interaction-btn {
    flex-direction: row;
    justify-content: flex-start;
    padding: 16px;
  }

  .btn-icon {
    font-size: 28px;
  }
}
</style>
