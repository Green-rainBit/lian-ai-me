<template>
  <div class="room-decorator-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button @click="goBack" class="header-btn back">
        <span class="btn-icon">←</span>
        <span>返回</span>
      </button>
      <h1 class="page-title">🏠 我的小屋</h1>
      <button
        @click="toggleEditMode"
        class="header-btn edit"
        :class="{ active: roomStore.editingMode }"
      >
        <span class="btn-icon">{{ roomStore.editingMode ? '✓' : '✎' }}</span>
        <span>{{ roomStore.editingMode ? '完成' : '编辑' }}</span>
      </button>
    </div>

    <!-- 小屋画布 -->
    <div class="canvas-section">
      <HouseCanvas />

      <!-- 物品统计 -->
      <div class="item-stats">
        <div class="stat-item">
          <span class="stat-icon">🪑</span>
          <span class="stat-value">{{ roomStore.placedItems.length }}</span>
          <span class="stat-label">已放置</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📦</span>
          <span class="stat-value">{{ roomStore.unplacedFurniture.length }}</span>
          <span class="stat-label">仓库</span>
        </div>
      </div>
    </div>

    <!-- 物品仓库 (编辑模式显示) -->
    <div v-if="roomStore.editingMode" class="inventory-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">📦</span>
          物品仓库
        </h2>
        <span class="section-count">{{ roomStore.unplacedFurniture.length }} 件</span>
      </div>

      <!-- 区域筛选 -->
      <div class="zone-filter">
        <button
          v-for="zone in zoneList"
          :key="zone.id"
          @click="filterByZone(zone.id)"
          class="filter-chip"
          :class="{ active: filterZone === zone.id }"
        >
          <span>{{ zone.icon }}</span>
          <span>{{ zone.name }}</span>
        </button>
      </div>

      <!-- 物品列表 -->
      <div class="inventory-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="inventory-card"
          :class="getQualityClass(item.rarity)"
          @click="placeItem(item)"
        >
          <div class="card-inner">
            <span class="item-emoji">{{ item.icon }}</span>
            <span class="item-name">{{ item.name }}</span>
          </div>
          <div class="add-badge">
            <span>+</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">🛒</div>
          <p>这个区域还没有物品哦</p>
          <p class="empty-hint">去商店逛逛吧~</p>
        </div>
      </div>

      <!-- 全部空状态 -->
      <div v-if="roomStore.unplacedFurniture.length === 0" class="empty-all">
        <div class="empty-icon">🏠</div>
        <p>仓库是空的</p>
        <button @click="goToShop" class="shop-btn">
          <span>🛒</span>
          <span>去商店</span>
        </button>
      </div>
    </div>

    <!-- 浏览模式提示 -->
    <div v-else-if="roomStore.placedItems.length === 0" class="welcome-hint">
      <div class="hint-card">
        <div class="hint-icon">💡</div>
        <h3>开始布置你的小屋</h3>
        <p>在商店购买家具后，点击右上角的"编辑"按钮开始布置</p>
      </div>
    </div>

    <!-- 底部安全区 -->
    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { getZoneList } from '@/data/houseZones'
import HouseCanvas from './components/HouseCanvas.vue'

const router = useRouter()
const roomStore = useRoomStore()

const zoneList = computed(() => getZoneList())
const filterZone = ref('all')

// 筛选后的物品列表
const filteredItems = computed(() => {
  if (filterZone.value === 'all') {
    return roomStore.unplacedFurniture
  }
  return roomStore.unplacedFurniture.filter(item => item.placementZone === filterZone.value)
})

// 按区域筛选
const filterByZone = (zoneId) => {
  filterZone.value = filterZone.value === zoneId ? 'all' : zoneId
}

// 切换编辑模式
const toggleEditMode = () => {
  roomStore.toggleEditMode()
  if (!roomStore.editingMode) {
    // 退出编辑模式时自动保存
    roomStore.saveRoom()
  }
}

// 放置物品
const placeItem = (item) => {
  roomStore.placeItem(item, roomStore.selectedZone)
}

// 获取稀有度样式类
const getQualityClass = (rarity) => {
  return `quality-${rarity || 'common'}`
}

// 返回首页
const goBack = () => {
  if (roomStore.editingMode) {
    roomStore.toggleEditMode()
    roomStore.saveRoom()
  }
  router.push('/')
}

// 去商店
const goToShop = () => {
  router.push('/shop')
}

// 初始化
onMounted(() => {
  roomStore.initRoom()
})
</script>

<style scoped>
.room-decorator-page {
  min-height: 100vh;
  background: var(--gradient-modern-bg);
  padding: var(--space-lg);
  padding-bottom: 100px;
}

/* ========== 顶部导航 ========== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.header-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-radius: var(--radius-xl);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.header-btn:hover {
  transform: translateY(calc(var(--hover-translate-y) / 2));
  box-shadow: 0 4px 12px rgba(255, 150, 150, 0.2);
  background: rgba(255, 255, 255, 0.8);
}

.header-btn:active {
  transform: translateY(0);
}

.header-btn.edit.active {
  background: var(--gradient-primary);
  color: var(--color-text-white);
  border-color: transparent;
}

.header-btn:hover {
  transform: translateY(calc(var(--hover-translate-y) / 2));
  box-shadow: 0 4px 12px rgba(255, 150, 150, 0.25);
}

.header-btn:active {
  transform: translateY(0);
}

.header-btn.edit.active {
  background: var(--gradient-primary);
  color: var(--color-text-white);
  border-color: transparent;
}

.btn-icon {
  font-size: var(--font-md);
}

.page-title {
  flex: 1;
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  text-align: center;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* ========== 画布区域 ========== */
.canvas-section {
  margin-bottom: var(--space-lg);
}

.item-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-glass);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: var(--font-lg);
}

.stat-value {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

/* ========== 仓库区域 ========== */
.inventory-section {
  background: var(--color-bg-card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: 0 4px 20px rgba(255, 150, 150, 0.15);
  margin-bottom: var(--space-md);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.title-icon {
  font-size: var(--font-xl);
}

.section-count {
  padding: 6px var(--space-md);
  background: var(--gradient-primary);
  color: var(--color-text-white);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
}

/* 区域筛选 */
.zone-filter {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  overflow-x: auto;
  padding: var(--space-sm) 4px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-sm) var(--space-md);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-radius: var(--radius-lg);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}
.filter-chip:hover {
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(calc(var(--hover-translate-y) / 2));
  box-shadow: 0 4px 12px rgba(255, 140, 148, 0.2);
}
.filter-chip.active {
  background: var(--gradient-primary);
  color: var(--color-text-white);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(255, 140, 148, 0.3);
}

/* 物品网格 */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-md);
  max-height: 320px;
  overflow-y: auto;
  padding: 4px;
}

.inventory-card {
  position: relative;
  cursor: pointer;
  transition: all var(--transition-base);
}

.card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--space-md) var(--space-sm);
  background: var(--color-bg-card);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.inventory-card:hover .card-inner {
  transform: translateY(var(--hover-translate-y));
  box-shadow: var(--card-shadow-hover);
}

.add-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: var(--space-lg);
  height: var(--space-lg);
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: var(--color-text-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--transition-base);
}

.inventory-card:hover .add-badge {
  opacity: 1;
  transform: scale(1);
}

.item-emoji {
  font-size: var(--font-3xl);
}

.item-name {
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  text-align: center;
}

/* 稀有度样式 */
.inventory-card.quality-common .card-inner {
  border-color: #e0e0e0;
}

.inventory-card.quality-rare .card-inner {
  border-color: #81d4fa;
  background: linear-gradient(145deg, #e1f5fe, #ffffff);
}

.inventory-card.quality-epic .card-inner {
  border-color: #ce93d8;
  background: linear-gradient(145deg, #f3e5f5, #ffffff);
}

.inventory-card.quality-legendary .card-inner {
  border-color: #ffd54f;
  background: linear-gradient(145deg, #fffde7, #ffffff);
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px var(--space-lg);
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: var(--font-4xl);
  margin-bottom: var(--space-md);
}

.empty-state p {
  margin: 4px 0;
  font-size: var(--font-sm);
}

.empty-hint {
  font-size: var(--font-xs) !important;
  color: var(--color-text-light);
}

.empty-all {
  text-align: center;
  padding: 40px var(--space-lg);
  color: var(--color-text-secondary);
}

.shop-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--gradient-primary);
  color: var(--color-text-white);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.shop-btn:hover {
  transform: scale(var(--hover-scale));
  box-shadow: 0 4px 16px rgba(255, 140, 148, 0.4);
}

/* ========== 欢迎提示 ========== */
.welcome-hint {
  display: flex;
  justify-content: center;
  margin-top: var(--space-lg);
}

.hint-card {
  text-align: center;
  padding: var(--space-lg) var(--space-2xl);
  background: var(--color-bg-card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px rgba(255, 150, 150, 0.15);
  max-width: 320px;
}

.hint-icon {
  font-size: var(--font-4xl);
  margin-bottom: var(--space-md);
}

.hint-card h3 {
  font-size: var(--font-md);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.hint-card p {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* ========== 底部安全区 ========== */
.safe-area-bottom {
  height: var(--space-2xl);
}

/* ========== 移动端适配 ========== */
@media (max-width: 480px) {
  .room-decorator-page {
    padding: var(--space-md);
    padding-bottom: 100px;
  }

  .page-title {
    font-size: var(--font-lg);
  }

  .header-btn {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-xs);
  }

  .inventory-grid {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 10px;
    max-height: 260px;
  }

  .card-inner {
    padding: var(--space-md) var(--space-sm);
  }

  .item-emoji {
    font-size: var(--font-2xl);
  }

  .item-name {
    font-size: var(--font-xs);
  }
}
</style>
