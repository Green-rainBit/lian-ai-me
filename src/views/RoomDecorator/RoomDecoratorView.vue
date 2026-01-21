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
  background: linear-gradient(
    180deg,
    #ffe4ec 0%,
    #fff5f7 30%,
    #e8f4fd 60%,
    #d4f1f9 100%
  );
  padding: 16px;
  padding-bottom: 100px;
}

/* ========== 顶部导航 ========== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.header-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 150, 150, 0.2);
  background: rgba(255, 255, 255, 0.8);
}

.header-btn:active {
  transform: translateY(0);
}

.header-btn.edit.active {
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  border-color: transparent;
}

.header-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 150, 150, 0.25);
}

.header-btn:active {
  transform: translateY(0);
}

.header-btn.edit.active {
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  border-color: transparent;
}

.btn-icon {
  font-size: 16px;
}

.page-title {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* ========== 画布区域 ========== */
.canvas-section {
  margin-bottom: 20px;
}

.item-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #FF8C94;
}

.stat-label {
  font-size: 12px;
  color: #888;
}

/* ========== 仓库区域 ========== */
.inventory-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(255, 150, 150, 0.15);
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.title-icon {
  font-size: 22px;
}

.section-count {
  padding: 6px 12px;
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 16px;
}

/* 区域筛选 */
.zone-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.filter-chip:hover {
  border-color: #FF8C94;
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 148, 0.2);
}
.filter-chip.active {
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(255, 140, 148, 0.3);
}

/* 物品网格 */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px;
}

.inventory-card {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.inventory-card:hover .card-inner {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.add-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.inventory-card:hover .add-badge {
  opacity: 1;
  transform: scale(1);
}

.item-emoji {
  font-size: 32px;
}

.item-name {
  font-size: 12px;
  font-weight: 500;
  color: #555;
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
  padding: 40px 20px;
  color: #888;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 4px 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px !important;
  color: #aaa;
}

.empty-all {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.shop-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shop-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(255, 140, 148, 0.4);
}

/* ========== 欢迎提示 ========== */
.welcome-hint {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.hint-card {
  text-align: center;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 150, 150, 0.15);
  max-width: 320px;
}

.hint-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.hint-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.hint-card p {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* ========== 底部安全区 ========== */
.safe-area-bottom {
  height: 80px;
}

/* ========== 移动端适配 ========== */
@media (max-width: 480px) {
  .room-decorator-page {
    padding: 12px;
    padding-bottom: 100px;
  }

  .page-title {
    font-size: 18px;
  }

  .header-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .inventory-grid {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 10px;
    max-height: 260px;
  }

  .card-inner {
    padding: 12px 8px;
  }

  .item-emoji {
    font-size: 28px;
  }

  .item-name {
    font-size: 11px;
  }
}
</style>
