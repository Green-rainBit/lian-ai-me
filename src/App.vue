<template>
  <div id="app" class="app">
    <router-view />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Toast from '@/components/common/Toast.vue'

const toastRef = ref(null)

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
