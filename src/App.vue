<template>
  <div id="app" class="app">
    <router-view v-slot="{ Component, route }">
      <transition :name="getRouteTransition(route)" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Toast from '@/components/common/Toast.vue'

const toastRef = ref(null)

// 根据路由元数据获取过渡效果
const getRouteTransition = (route) => {
  return route.meta.transition || 'router-fade'
}

onMounted(() => {
  // 应用初始化
  console.log('🐕 脱单了么 - 我的小窝')

  // 将toast挂载到全局
  if (toastRef.value) {
    window.$toast = toastRef.value
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--gradient-modern-bg);
}
</style>
