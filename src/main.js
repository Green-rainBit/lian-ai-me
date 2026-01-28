import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局错误处理
import { initGlobalErrorHandler, errorHandler } from './utils/errorHandler'
// 导入 stores 初始化
import { initAllStores } from './stores'

// 导入全局样式
import './styles/variables.css'
import './styles/reset.css'
import './styles/base.css'
import './styles/animations.css'
import './styles/accessibility.css'
import './styles/transitions.css'

// 初始化全局错误处理
initGlobalErrorHandler()

const app = createApp(App)
const pinia = createPinia()

// Vue 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  errorHandler.handleVueError(err, instance, info)
}

app.use(pinia)
app.use(router)

// 在挂载后初始化所有 stores
app.mount('#app')

// 初始化所有 stores
(async () => {
  try {
    await initAllStores()
    if (import.meta.env.DEV) {
      console.log('✅ 所有 stores 已初始化')
    }
  } catch (error) {
    console.error('❌ Stores 初始化失败:', error)
    // Toast 可能还未挂载，使用 console.error 作为 fallback
    // 用户会在后续的 Toast 中看到错误信息
  }
})()

// 开发环境日志
if (import.meta.env.DEV) {
  console.log('🐕 脱单了么 - 我的小窝')
  console.log('📦 Vue 3 + Vite + Pinia')
  console.log('✅ 全局错误处理已启用')
  console.log('💾 localStorage 降级方案已就绪')
}
