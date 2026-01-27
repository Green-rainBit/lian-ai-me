<template>
  <div class="tasks-view">
    <div class="tasks-header">
      <h1 class="tasks-title">⭐ 光荣之爪</h1>
      <div class="progress-info">
        <span class="progress-text">今日进度: {{ tasksStore.todayProgress }}%</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: tasksStore.todayProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-list">
      <div
        v-for="task in tasksStore.activeTasks"
        :key="task.id"
        class="task-card"
        :class="{ completed: task.completed }"
      >
        <div class="task-icon">{{ task.icon }}</div>
        <div class="task-info">
          <h3 class="task-title">{{ task.title }}</h3>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-reward">
            <span class="reward-icon">🦴</span>
            <span class="reward-amount">+{{ task.reward }}</span>
          </div>
        </div>
        <button
          @click="completeTask(task)"
          class="complete-btn"
          :disabled="task.completed"
        >
          {{ task.completed ? '✓ 完成' : '完成' }}
        </button>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="tab-bar-wrapper">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import TabBar from '@/views/Home/components/TabBar.vue'
import { useTasksStore } from '@/stores/tasks'
import { useAchievementStore } from '@/stores/achievements'

const tasksStore = useTasksStore()
const achievementStore = useAchievementStore()

const completeTask = async (task) => {
  try {
    await tasksStore.completeTask(task.id)
    if (window.$toast) {
      window.$toast.success(`任务完成！获得 ${task.reward} 骨头币`, {
        title: '🎉 完成任务',
        icon: '⭐'
      })
    }
    // 检查成就
    await achievementStore.checkAllAchievements()
  } catch (error) {
    if (window.$toast) {
      window.$toast.error(error.message, {
        title: '❌ 操作失败'
      })
    }
  }
}

onMounted(async () => {
  await tasksStore.initTasks()
})
</script>

<style scoped>
.tasks-view {
  min-height: 100vh;
  padding: var(--space-lg);
  padding-bottom: 100px;
  background: var(--color-bg-primary);
}

.tasks-header {
  margin-bottom: var(--space-xl);
}

.tasks-title {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-md);
}

.progress-info {
  background: var(--color-bg-card);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}

.progress-text {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-sm);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6BCB77, #FFD93D);
  transition: width 0.3s ease;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.task-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  display: flex;
  gap: var(--space-md);
  align-items: center;
  box-shadow: var(--shadow-md);
  transition: var(--card-transition);
}

.task-card:hover {
  transform: translateY(var(--hover-translate-y));
  box-shadow: var(--shadow-lg);
}

.task-card.completed {
  opacity: 0.6;
}

.task-icon {
  font-size: var(--font-3xl);
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: var(--font-md);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-xs);
}

.task-description {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.task-reward {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.reward-icon {
  font-size: var(--font-md);
}

.reward-amount {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.complete-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.complete-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.complete-btn:disabled {
  background: var(--quality-common);
  cursor: not-allowed;
}

/* 固定底部导航栏 */
.tab-bar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
}
</style>
