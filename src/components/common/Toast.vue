<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          role="alert"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click="removeToast(toast.id)"
            aria-label="关闭通知"
          >
            ✕
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const toasts = ref([])
let idCounter = 0

/**
 * 显示Toast通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型: 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - 显示时长(ms)，0表示不自动关闭
 */
function show(message, type = 'info', duration = 3000) {
  const id = ++idCounter
  const toast = {
    id,
    message,
    type,
    duration
  }

  toasts.value.push(toast)

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

/**
 * 移除Toast通知
 * @param {number} id - Toast ID
 */
function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

/**
 * 获取类型对应的图标
 */
function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}

/**
 * 清除所有Toast
 */
function clear() {
  toasts.value = []
}

// 组件方法
onMounted(() => {
  // 暴露方法给父组件
  if (typeof window !== 'undefined') {
    window.$toast = {
      success: (message, duration) => show(message, 'success', duration),
      error: (message, duration) => show(message, 'error', duration),
      warning: (message, duration) => show(message, 'warning', duration),
      info: (message, duration) => show(message, 'info', duration),
      show,
      clear
    }
  }
})

// 暴露方法给模板ref
defineExpose({
  show,
  removeToast,
  clear
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  min-width: 280px;
  max-width: 400px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Toast类型样式 */
.toast-success {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0.95));
}

.toast-error {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(255, 255, 255, 0.95));
}

.toast-warning {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.95));
}

.toast-info {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.95));
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  border-radius: 50%;
}

.toast-success .toast-icon {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.toast-error .toast-icon {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.toast-warning .toast-icon {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
}

.toast-info .toast-icon {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
}

.toast-message {
  flex: 1;
  color: #374151;
  font-weight: 500;
  word-break: break-word;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

/* Toast动画 */
.toast-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  animation: toast-out 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}

/* 移动端适配 */
@media (max-width: 640px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .toast {
    min-width: 0;
    max-width: none;
  }
}
</style>
