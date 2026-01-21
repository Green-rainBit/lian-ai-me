<template>
  <div class="house-canvas-wrapper">
    <!-- 场景切换指示器 -->
    <!-- 缩放控制 -->
    <div class="zoom-controls">
      <button @click="zoomOut" class="zoom-btn" :disabled="scale <= 0.5">-</button>
      <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
      <button @click="zoomIn" class="zoom-btn" :disabled="scale >= 1.5">+</button>
    </div>

    <!-- 可滑动的场景容器 -->
    <div
      ref="sceneScrollRef"
      class="scene-scroll-container"
      @scroll="handleScroll"
    >
      <!-- 场景画布（可滑动的宽画布） -->
      <div
        class="scene-canvas"
        :class="{ 'editing-mode': roomStore.editingMode }"
        :style="canvasStyle"
        @pointerdown="handleCanvasDown"
        @pointermove="handleCanvasMove"
        @pointerup="handleCanvasUp"
        @pointerleave="handleCanvasLeave"
      >
        <!-- 室内场景 -->
        <div
          v-show="currentScene === 'indoor'"
          class="scene-layer indoor-scene"
          :style="sceneStyle.indoor"
        >
          <!-- 天花板 -->
          <div class="ceiling"></div>
          <!-- 墙面 -->
          <div class="walls">
            <div class="wall-back"></div>
            <div class="wall-left"></div>
            <div class="wall-right"></div>
          </div>
          <!-- 地板 -->
          <div class="floor"></div>
          <!-- 室内内容 -->
          
          <!-- 窗户 (左上角) -->
          <div class="house-window">
            <div class="window-frame">
              <div class="window-glass"></div>
            </div>
          </div>
          
          <!-- 门 (居中底部) -->
          <div class="house-door" @click="switchSceneByDoor">
            <div class="door-frame">
              <div class="door-panel">
                <div class="door-handle"></div>
              </div>
            </div>
          </div>
          
          <!-- 室内狗狗 (门旁边) -->
          <div class="indoor-dog">
             <span class="dog-emoji">{{ dogStore.dogInfo?.emoji || "🐶" }}</span>
          </div>
        </div>
        <!-- 室外场景 (卡通风格可滑动) -->
        <div
          v-show="currentScene === 'outdoor'"
          class="scene-layer outdoor-scene cartoon-style"
          :style="outdoorSceneStyle"
        >
          <!-- 天空背景 -->
          <div class="cartoon-sky">
            <!-- 白云 -->
            <div class="cartoon-cloud cloud-1"></div>
            <div class="cartoon-cloud cloud-2"></div>
            <div class="cartoon-cloud cloud-3"></div>
            <div class="cartoon-cloud cloud-4"></div>
            <div class="cartoon-cloud cloud-5"></div>
          </div>
          
          <!-- 草地背景 -->
          <div class="cartoon-ground">
            <!-- 草丛 -->
            <div class="grass-tuft t-1"></div>
            <div class="grass-tuft t-2"></div>
            <div class="grass-tuft t-3"></div>
            <div class="grass-tuft t-4"></div>
            <div class="grass-tuft t-5"></div>
            
            <!-- 小花 -->
            <div class="ground-flower f-1">🌸</div>
            <div class="ground-flower f-2">🌼</div>
            <div class="ground-flower f-3">🌻</div>
            <div class="ground-flower f-4">🌷</div>
            <div class="ground-flower f-5">🌸</div>
            <div class="ground-flower f-6">🌼</div>
            <div class="ground-flower f-7">🌻</div>
            <div class="ground-flower f-8">🌷</div>
            
            <!-- 石头 -->
            <div class="rock rock-1"></div>
            <div class="rock rock-2"></div>
          </div>
          
          <!-- 左侧树木 -->
          <div class="cartoon-tree tree-left">
            <div class="tree-trunk"></div>
            <div class="tree-foliage"></div>
          </div>
          
          <!-- 右侧树木 -->
          <div class="cartoon-tree tree-right">
            <div class="tree-trunk"></div>
            <div class="tree-foliage"></div>
          </div>
          
          <!-- 中心内容 -->
          <div class="outdoor-center-container">
            <!-- 小木屋 (与首页风格一致) -->
            <div class="dog-house cottage-style" @click="switchSceneByDoor">
              <div class="chimney">
                <div class="smoke"></div>
              </div>
              <div class="house-roof cottage-roof">
                <div class="roof-texture"></div>
              </div>
              <div class="house-body cottage-body">
                <div class="house-window"></div>
                <div class="house-door"></div>
                <div class="vines">🌿</div>
              </div>
            </div>
            
            <!-- 池塘 -->
            <div class="pond">
              <div class="water-reflection"></div>
              <div class="duck">🦆</div>
            </div>
            
            <!-- 狗狗 -->
            <div class="outdoor-dog">
              <span class="dog-emoji">{{ dogStore.dogInfo?.emoji || "🐶" }}</span>
            </div>
          </div>
          
          <!-- 远景树木 -->
          <div class="cartoon-tree tree-far-1">
            <div class="tree-trunk"></div>
            <div class="tree-foliage"></div>
          </div>
          <div class="cartoon-tree tree-far-2">
            <div class="tree-trunk"></div>
            <div class="tree-foliage"></div>
          </div>
        </div>

        <!-- 物品放置区域指示（仅在编辑模式显示） -->
        <div
          v-for="zone in currentSceneZones"
          :key="zone.id"
          v-show="roomStore.editingMode"
          class="placement-zone"
          :class="{
            'active': roomStore.selectedZone === zone.id,
            'drag-over': isDraggingOverZone === zone.id
          }"
          :style="getZoneStyle(zone)"
          @click="handleZoneClick(zone)"
        >
          <div class="zone-hint">
            <span class="hint-icon">{{ zone.icon }}</span>
            <span class="hint-text">{{ zone.name }}</span>
          </div>
        </div>

        <!-- 已放置的物品 -->
        <div
          v-for="item in displayedItems"
          :key="item.instanceId"
          class="placed-item"
          :class="[
            getQualityClass(item.rarity),
            {
              'selected': roomStore.selectedItem?.instanceId === item.instanceId,
              'dragging': roomStore.draggedItem?.item?.instanceId === item.instanceId
            }
          ]"
          :style="getItemStyle(item)"
          @pointerdown.stop="handleItemDown($event, item)"
          @click.stop="handleItemClick(item)"
        >
          <div class="item-card">
            <span class="item-emoji">{{ item.icon }}</span>
            <div v-if="roomStore.editingMode" class="item-actions">
              <button class="action-btn remove" @click.stop="removeItem(item)">
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 拖拽时的预览 -->
        <div
          v-if="roomStore.draggedItem && dragPosition"
          class="drag-ghost"
          :style="{
            left: dragPosition.x + '%',
            bottom: dragPosition.y + '%'
          }"
        >
          <span class="ghost-icon">{{ roomStore.draggedItem.item.icon }}</span>
          <div class="ghost-shadow"></div>
        </div>
      </div>
    </div>

    <!-- 滑动提示 -->
    <div v-if="showScrollHint" class="scroll-hint">
      <span class="hint-icon">↔️</span>
      <span class="hint-text">左右滑动查看更多</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoomStore } from '@/stores/room'
import { useDogStore } from '@/stores/dog'
import { HOUSE_SCENES, getSceneList, getSceneIdByZone } from '@/data/houseZones'

const roomStore = useRoomStore()
const dogStore = useDogStore()
const sceneScrollRef = ref(null)

// 当前场景
const currentScene = ref('indoor')
const isDraggingOverZone = ref(null)
const dragPosition = ref(null)
const showScrollHint = ref(true)
const scale = ref(1)

// 缩放功能
const zoomIn = () => {
  if (scale.value < 1.5) scale.value += 0.1
}

const zoomOut = () => {
  if (scale.value > 0.5) scale.value -= 0.1
}

// 场景列表
const sceneList = computed(() => getSceneList())

// 当前场景配置
const currentSceneConfig = computed(() => HOUSE_SCENES[currentScene.value])

// 当前场景的区域列表
const currentSceneZones = computed(() => {
  const config = currentSceneConfig.value
  return config && config.zones ? Object.values(config.zones) : []
})

// 画布样式
const canvasStyle = computed(() => {
  return {
    width: '200%',
    height: '150%', // 增加高度以支持上下滑动
    transform: `scale(${scale.value})`,
    transformOrigin: 'center center'
  }
})

// 室外场景样式（扩展宽度支持左右滑动）
const outdoorSceneStyle = computed(() => {
  return {
    width: '100%',
    height: '100%'
  }
})

// 场景背景样式
const sceneStyle = computed(() => {
  const indoorBg = HOUSE_SCENES.indoor?.background || {}
  const outdoorBg = HOUSE_SCENES.outdoor?.background || {}

  return {
    indoor: {
      '--ceiling-bg': indoorBg.ceiling || '#FFF8DC',
      '--wall-bg': indoorBg.wall || '#FFF5E6',
      '--floor-bg': indoorBg.floor || '#DEB887'
    },
    outdoor: {
      '--sky-bg': outdoorBg.sky || '#87CEEB',
      '--grass-bg': outdoorBg.grass || '#90EE90',
      '--garden-bg': outdoorBg.garden || '#98D8AA'
    }
  }
})

// 显示的物品（按Y坐标排序）
const displayedItems = computed(() => {
  return [...roomStore.placedItems].sort((a, b) => {
    // 只显示当前场景的物品
    const aScene = getSceneIdByZone(a.zone)
    const bScene = getSceneIdByZone(b.zone)

    if (aScene !== currentScene.value && bScene !== currentScene.value) {
      return 0
    }
    if (aScene === currentScene.value && bScene !== currentScene.value) {
      return -1
    }
    if (aScene !== currentScene.value && bScene === currentScene.value) {
      return 1
    }

    return (a.position?.y || 0) - (b.position?.y || 0)
  }).filter(item => {
    const itemScene = getSceneIdByZone(item.zone)
    return itemScene === currentScene.value
  })
})

// 居中滚动容器
const centerScroll = () => {
  if (sceneScrollRef.value) {
    const container = sceneScrollRef.value
    // 使用 nextTick 确保 DOM 已更新
    setTimeout(() => {
      // 居中显示 200% 宽度和 150% 高度的画布
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2
      container.scrollTop = (container.scrollHeight - container.clientHeight) / 2
    }, 150)
  }
}

// 切换场景
const switchScene = (sceneId) => {
  if (HOUSE_SCENES[sceneId]) {
    currentScene.value = sceneId
    // 居中滚动位置
    centerScroll()
    // 更新 store 中的选中区域为当前场景的第一个区域
    const sceneConfig = HOUSE_SCENES[sceneId]
    if (sceneConfig && sceneConfig.zones) {
      const firstZone = Object.keys(sceneConfig.zones)[0]
      if (firstZone) {
        roomStore.selectZone(firstZone)
      }
    }
  }
}

// 点击门口切换场景
const switchSceneByDoor = () => {
  const newScene = currentScene.value === 'indoor' ? 'outdoor' : 'indoor'
  switchScene(newScene)
}

// 处理滚动（隐藏提示）
const handleScroll = () => {
  if (showScrollHint.value) {
    showScrollHint.value = false
  }
}

// 获取区域样式
const getZoneStyle = (zone) => {
  const bounds = zone.bounds
  return {
    left: bounds.x + '%',
    bottom: bounds.y + '%',
    width: bounds.width + '%',
    height: bounds.height + '%'
  }
}

// 获取物品样式
const getItemStyle = (item) => {
  return {
    left: item.position?.x + '%',
    bottom: item.position?.y + '%',
    zIndex: Math.floor(item.position?.y || 0)
  }
}

// 获取稀有度样式类
const getQualityClass = (rarity) => {
  return `quality-${rarity || 'common'}`
}

// 处理区域点击
const handleZoneClick = (zone) => {
  if (roomStore.editingMode) {
    roomStore.selectZone(zone.id)
  }
}

// 处理物品点击
const handleItemClick = (item) => {
  if (roomStore.editingMode) {
    roomStore.selectItem(roomStore.selectedItem?.instanceId === item.instanceId ? null : item)
  }
}

// 移除物品
const removeItem = (item) => {
  roomStore.removeItem(item.instanceId)
}

// 画布拖拽处理
const handleCanvasDown = (e) => {
  if (roomStore.editingMode) {
    roomStore.deselectItem()
  }
}

const handleCanvasMove = (e) => {
  if (!roomStore.draggedItem || !sceneScrollRef.value) return

  const rect = sceneScrollRef.value.getBoundingClientRect()
  const pos = roomStore.onDrag(e, rect)
  if (pos) {
    dragPosition.value = pos
  }
}

const handleCanvasUp = (e) => {
  if (roomStore.draggedItem && dragPosition.value) {
    roomStore.endDrag(dragPosition.value)
    dragPosition.value = null
    isDraggingOverZone.value = null
  }
}

const handleCanvasLeave = () => {
  if (roomStore.draggedItem) {
    dragPosition.value = null
    isDraggingOverZone.value = null
    roomStore.draggedItem = null
  }
}

// 物品拖拽处理
const handleItemDown = (e, item) => {
  if (!roomStore.editingMode) return

  e.preventDefault()
  roomStore.selectItem(item)
  roomStore.startDrag(item, e)

  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
}

const handlePointerMove = (e) => {
  if (!roomStore.draggedItem || !sceneScrollRef.value) return

  const rect = sceneScrollRef.value.getBoundingClientRect()
  const pos = roomStore.onDrag(e, rect)
  if (pos) {
    dragPosition.value = pos
  }
}

const handlePointerUp = (e) => {
  if (roomStore.draggedItem && dragPosition.value) {
    roomStore.endDrag(dragPosition.value)
  }

  dragPosition.value = null
  isDraggingOverZone.value = null
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
}

onMounted(() => {
  // 初始化场景
  const sceneConfig = HOUSE_SCENES[currentScene.value]
  if (sceneConfig && sceneConfig.zones) {
    const firstZone = Object.keys(sceneConfig.zones)[0]
    if (firstZone) {
      roomStore.selectZone(firstZone)
    }
  }
  
  // 居中滚动位置
  centerScroll()

  // 3秒后隐藏滑动提示
  setTimeout(() => {
    showScrollHint.value = false
  }, 3000)
})

onUnmounted(() => {
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
})
</script>

<style scoped>
.house-canvas-wrapper {
  position: relative;
  width: 100%;
}

/* 场景切换指示器 */
/* 缩放控制 */
.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
}

.zoom-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.zoom-level {
  font-size: 12px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.scene-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scene-tab:hover {
  background: rgba(255, 182, 193, 0.1);
}

.scene-tab.active {
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
}

.tab-icon {
  font-size: 24px;
}

.tab-text {
  font-size: 12px;
  font-weight: 600;
}

.scene-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scene-divider:hover {
  transform: scale(1.1);
}

.door-icon {
  font-size: 28px;
}

.door-hint {
  font-size: 10px;
  color: #888;
}

/* 滚动容器 */
.scene-scroll-container {
  width: 100%;
  height: 60vh;
  min-height: 480px;
  overflow-x: auto;
  overflow-y: auto; /* 允许垂直滑动 */
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(255, 150, 150, 0.2);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 182, 193, 0.5) transparent;
  -webkit-overflow-scrolling: touch; /* iOS滚动优化 */
  touch-action: auto; /* 允许全向滑动 */
  position: relative;
  z-index: 1;
}

.scene-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.scene-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.scene-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 182, 193, 0.5);
  border-radius: 3px;
}

.scene-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 140, 148, 0.7);
}

/* 场景画布 */
.scene-canvas {
  position: relative;
  min-width: 100%;
  height: 100%;
  min-height: 400px;
  transition: box-shadow 0.3s ease;
}

.scene-canvas.editing-mode {
  box-shadow: 0 8px 40px rgba(255, 150, 150, 0.35);
}

/* ========== 室内场景 ========== */
.scene-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.indoor-scene {
  background: linear-gradient(
    180deg,
    var(--ceiling-bg, #FFF8DC) 0%,
    var(--ceiling-bg, #FFF8DC) 25%,
    var(--wall-bg, #FFF5E6) 25%,
    var(--wall-bg, #FFF5E6) 60%,
    var(--floor-bg, #DEB887) 60%,
    var(--floor-bg, #DEB887) 100%
  );
}

.ceiling {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 25%;
  background: var(--ceiling-bg, #FFF8DC);
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 50px,
    rgba(0, 0, 0, 0.02) 50px,
    rgba(0, 0, 0, 0.02) 100px
  );
}

.walls {
  position: absolute;
  top: 25%;
  left: 0;
  right: 0;
  height: 35%;
}

.wall-back {
  position: absolute;
  inset: 0;
  background: var(--wall-bg, #FFF5E6);
}

.wall-left,
.wall-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 15%;
  background: linear-gradient(90deg, rgba(0,0,0,0.05), transparent);
}

.wall-left {
  left: 0;
}

.wall-right {
  right: 0;
  background: linear-gradient(-90deg, rgba(0,0,0,0.05), transparent);
}

.floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: var(--floor-bg, #DEB887);
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 100px,
    rgba(0, 0, 0, 0.03) 100px,
    rgba(0, 0, 0, 0.03) 200px
  ),
  repeating-linear-gradient(
    0deg,
    transparent,
    transparent 50px,
    rgba(0, 0, 0, 0.03) 50px,
    rgba(0, 0, 0, 0.03) 100px
  );
}

/* 室内的门 (对齐地板接缝线) */
.indoor-scene .house-door {
  position: absolute;
  bottom: 40%; /* 使用bottom定位，使门底部对齐地板线（40%地板高度） */
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 120px;
  pointer-events: auto;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.3s ease;
}

.indoor-scene .house-door:hover {
  transform: translateX(-50%) scale(1.05);
}

/* 室内的窗户 (与门同墙面) */
.indoor-scene .house-window {
  position: absolute;
  top: 28%; /* 稍微下调一点 */
  left: 32%; /* 显著右移，使其在居中视图中可见 */
  width: 80px;
  height: 80px;
  pointer-events: auto;
  z-index: 2;
}

/* 室内狗狗 (箭头所指位置：右下角地板) */
.indoor-scene .indoor-dog {
  position: absolute;
  bottom: 5%; /* 更贴近底部 */
  right: 10%; /* 更靠右 */
  font-size: 55px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  animation: cute-bounce 3s ease-in-out infinite;
  z-index: 10;
  pointer-events: auto;
}

.door-frame {
  position: relative;
  width: 100%;
  height: 100%;
  background: #8B4513;
  border-radius: 8px 8px 0 0;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.door-panel {
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  background: linear-gradient(180deg, #A0522D, #8B4513);
  border-radius: 6px 6px 0 0;
  transition: transform 0.3s ease;
}

.indoor-scene .house-door:hover .door-panel {
  transform: perspective(500px) rotateY(-15deg);
  transform-origin: left;
}

.door-handle {
  position: absolute;
  top: 50%;
  right: 10px;
  width: 10px;
  height: 10px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 室内的窗户 */
.indoor-scene .house-window {
  position: absolute;
  top: 35%;
  right: 25%;
  width: 80px;
  height: 80px;
  pointer-events: auto;
}

.window-frame {
  position: relative;
  width: 100%;
  height: 100%;
  background: #8B4513;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.window-glass {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #87CEEB, #b4e4fc);
  border-radius: 4px;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
}

.window-glass::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: #8B4513;
  transform: translateY(-50%);
}

.window-glass::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #8B4513;
  transform: translateX(-50%);
}

/* ========== 室外场景 ========== */
.outdoor-scene {
  background: linear-gradient(
    180deg,
    var(--sky-bg, #87CEEB) 0%,
    var(--sky-bg, #87CEEB) 50%,
    var(--grass-bg, #90EE90) 50%,
    var(--grass-bg, #90EE90) 100%
  );
}

.sky {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: var(--sky-bg, #87CEEB);
  overflow: hidden;
}

.cloud {
  position: absolute;
  font-size: 40px;
  opacity: 0.9;
  animation: float-cloud 20s linear infinite;
}

.cloud-1 {
  top: 15%;
  left: 10%;
  animation-duration: 25s;
}

.cloud-2 {
  top: 25%;
  left: 40%;
  animation-duration: 30s;
  animation-delay: -10s;
}

.cloud-3 {
  top: 10%;
  left: 70%;
  animation-duration: 35s;
  animation-delay: -5s;
}

@keyframes float-cloud {
  0% { transform: translateX(-50px); }
  50% { transform: translateX(50px); }
  100% { transform: translateX(-50px); }
}

.sun {
  position: absolute;
  top: 10%;
  right: 10%;
  font-size: 60px;
  animation: sun-glow 3s ease-in-out infinite;
}

@keyframes sun-glow {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 20px rgba(255, 200, 0, 0.6));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 40px rgba(255, 200, 0, 0.9));
  }
}

/* ==================== 卡通风格户外场景 ==================== */
.cartoon-style {
  position: absolute;
  inset: 0;
  overflow: hidden;
  width: 100% !important;
  height: 100%;
  min-height: 400px;
}

/* 天空背景 */
.cartoon-sky {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 50%; /* 天空占一半 */
  background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #E0F7FA 100%);
  z-index: 1;
}

/* 卡通云朵 */
.cartoon-cloud {
  position: absolute;
  background: white;
  border-radius: 100px;
  animation: cloud-float 20s ease-in-out infinite;
}

.cartoon-cloud::before,
.cartoon-cloud::after {
  content: '';
  position: absolute;
  background: white;
  border-radius: 50%;
}

.cloud-1 {
  top: 15%;
  left: 30%;
  width: 120px;
  height: 50px;
  animation-delay: 0s;
}
.cloud-1::before {
  width: 60px;
  height: 60px;
  top: -30px;
  left: 20px;
}
.cloud-1::after {
  width: 80px;
  height: 80px;
  top: -40px;
  left: 45px;
}

.cloud-2 {
  top: 25%;
  left: 45%;
  width: 100px;
  height: 40px;
  animation-delay: -5s;
}
.cloud-2::before {
  width: 50px;
  height: 50px;
  top: -25px;
  left: 15px;
}
.cloud-2::after {
  width: 65px;
  height: 65px;
  top: -35px;
  left: 35px;
}

.cloud-3 {
  top: 10%;
  left: 55%;
  width: 140px;
  height: 55px;
  animation-delay: -10s;
}
.cloud-3::before {
  width: 70px;
  height: 70px;
  top: -35px;
  left: 25px;
}
.cloud-3::after {
  width: 90px;
  height: 90px;
  top: -45px;
  left: 55px;
}

.cloud-4 {
  top: 20%;
  left: 65%;
  width: 90px;
  height: 35px;
  animation-delay: -15s;
}
.cloud-4::before {
  width: 45px;
  height: 45px;
  top: -22px;
  left: 12px;
}
.cloud-4::after {
  width: 55px;
  height: 55px;
  top: -28px;
  left: 35px;
}

.cloud-5 {
  top: 8%;
  left: 40%;
  width: 110px;
  height: 45px;
  animation-delay: -7s;
}
.cloud-5::before {
  width: 55px;
  height: 55px;
  top: -27px;
  left: 18px;
}
.cloud-5::after {
  width: 70px;
  height: 70px;
  top: -35px;
  left: 42px;
}

@keyframes cloud-float {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(30px); }
}

/* 草地背景 */
.cartoon-ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 50%; /* 草地占一半 */
  background: linear-gradient(180deg, #7CCD7C 0%, #6BBF6B 30%, #5CB05C 100%);
  z-index: 2;
}

/* 草丛 */
.grass-tuft {
  position: absolute;
  bottom: 0;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 25px solid #228B22;
}

.grass-tuft::before,
.grass-tuft::after {
  content: '';
  position: absolute;
  bottom: -25px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 20px solid #228B22;
}

.grass-tuft::before { left: -12px; transform: rotate(-15deg); }
.grass-tuft::after { left: 0px; transform: rotate(15deg); }

.t-1 { left: 35%; bottom: 35%; }
.t-2 { left: 42%; bottom: 42%; }
.t-3 { left: 58%; bottom: 40%; }
.t-4 { left: 65%; bottom: 38%; }
.t-5 { left: 50%; bottom: 30%; }

/* 地面小花 */
.ground-flower {
  position: absolute;
  font-size: 24px;
  z-index: 3;
  animation: flower-sway 3s ease-in-out infinite;
}

.f-1 { bottom: 25%; left: 35%; animation-delay: 0s; }
.f-2 { bottom: 30%; left: 40%; animation-delay: 0.5s; }
.f-3 { bottom: 22%; left: 60%; animation-delay: 1s; }
.f-4 { bottom: 28%; left: 68%; animation-delay: 1.5s; }
.f-5 { bottom: 26%; left: 38%; animation-delay: 0.2s; }
.f-6 { bottom: 29%; left: 58%; animation-delay: 0.7s; }
.f-7 { bottom: 20%; left: 52%; animation-delay: 1.2s; }
.f-8 { bottom: 24%; left: 48%; animation-delay: 1.7s; }

@keyframes flower-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* 石头 */
.rock {
  position: absolute;
  background: linear-gradient(135deg, #8B7355, #6B5344);
  border-radius: 40% 60% 50% 50%;
  box-shadow: inset 2px 2px 5px rgba(255,255,255,0.2), inset -2px -2px 5px rgba(0,0,0,0.2);
}

.rock-1 {
  bottom: 22%;
  left: 38%;
  width: 40px;
  height: 25px;
}

.rock-2 {
  bottom: 18%;
  left: 62%;
  width: 55px;
  height: 35px;
}

/* 卡通树木 */
.cartoon-tree {
  position: absolute;
  z-index: 5;
}

.tree-trunk {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 60px;
  background: linear-gradient(90deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
  border-radius: 5px;
}

.tree-foliage {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at 50% 70%, #228B22 0%, #2E8B2E 40%, #006400 100%);
  border-radius: 50%;
  box-shadow: 
    -30px 20px 0 -10px #228B22,
    30px 20px 0 -10px #228B22,
    0 30px 0 -5px #2E8B2E;
}

.tree-left {
  bottom: 45%; /* 靠近地平线 */
  left: 30%;
  z-index: 3;
}

.tree-right {
  bottom: 42%;
  left: 70%;
  z-index: 3;
}

.tree-far-1 {
  bottom: 48%;
  left: 40%;
  transform: scale(0.6);
  z-index: 3;
}

.tree-far-2 {
  bottom: 47%;
  left: 60%;
  transform: scale(0.5);
  z-index: 3;
}

/* 户外布局 (卡通风格) - 房子移到左上方框位置 */
.cartoon-style .outdoor-center-container {
  position: absolute;
  top: 35%; /* 上移到方框位置 */
  left: 35%; /* 左移到方框位置 */
  transform: translate(-50%, -50%); 
  width: 400px;
  height: 300px;
  z-index: 20;
  pointer-events: auto;
}

/* 卡通风格小木屋 */
.cartoon-style .dog-house {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 15;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.cartoon-style .dog-house:hover {
  transform: translateX(-50%) scale(1.05);
}

.cartoon-style .cottage-roof {
  width: 160px;
  height: 80px;
  background: #deb887;
  border-radius: 12px;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.cartoon-style .roof-texture {
  position: absolute;
  inset: -10px;
  background: 
    radial-gradient(circle at 10px 10px, #8B4513 2px, transparent 2.5px),
    linear-gradient(135deg, #d4a574 25%, transparent 25%) -50px 0,
    linear-gradient(225deg, #d4a574 25%, transparent 25%) -50px 0,
    linear-gradient(315deg, #d4a574 25%, transparent 25%),
    linear-gradient(45deg, #d4a574 25%, transparent 25%);
  background-size: 20px 20px;
  background-color: #DEB887;
  transform: rotate(45deg);
}

.cartoon-style .cottage-roof::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: rgba(107, 203, 119, 0.6);
  border-radius: 12px 12px 0 0;
}

.cartoon-style .house-body.cottage-body {
  background: #FFF8DC;
  width: 130px;
  height: 90px;
  margin: -10px auto 0;
  border-radius: 0 0 8px 8px;
  position: relative;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border: 2px solid #DEB887;
}

.cartoon-style .house-door {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 65px;
  background: #8B4513;
  border-radius: 24px 24px 0 0;
  box-shadow: inset 1px -1px 4px rgba(255,255,255,0.2);
}

.cartoon-style .house-door::after {
  content: '';
  position: absolute;
  top: 35px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0,0,0,0.3);
}

.cartoon-style .house-window {
  position: absolute;
  top: 20px;
  left: 15px;
  width: 30px;
  height: 30px;
  background: #A2E1FA;
  border: 3px solid #8B4513;
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.cartoon-style .house-window::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #8B4513;
  transform: translateY(-50%);
}

.cartoon-style .house-window::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #8B4513;
  transform: translateX(-50%);
}

.cartoon-style .vines {
  position: absolute;
  top: -5px;
  right: 5px;
  font-size: 18px;
}

.cartoon-style .chimney {
  position: absolute;
  top: -30px;
  right: 25px;
  width: 25px;
  height: 40px;
  background: #B8860B;
  border-radius: 3px;
  z-index: 1;
}

.cartoon-style .smoke {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 15px;
  background: rgba(200, 200, 200, 0.6);
  border-radius: 50%;
  animation: smoke-rise 2s ease-out infinite;
}

/* 卡通风格池塘 (显著扩大) */
.cartoon-style .pond {
  position: absolute;
  bottom: -60px;
  right: -130px; /* 移动到圆圈位置：显著右移并扩大 */
  width: 380px; /* 进一步扩大水池 */
  height: 200px;
  background: linear-gradient(180deg, #A2E1FA, #45B7D1);
  border-radius: 50%;
  box-shadow: inset 0 0 40px rgba(0, 50, 100, 0.2), 0 10px 30px rgba(162, 225, 250, 0.5);
  border: 6px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  z-index: 12;
}

.cartoon-style .water-reflection {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 50%;
  height: 40%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: rotate(-15deg);
}

.cartoon-style .duck {
  position: absolute;
  bottom: 40px;
  right: 60px;
  font-size: 32px;
  animation: float-duck 5s ease-in-out infinite alternate;
}

/* 卡通风格狗狗 (箭头位置：左下角草地) */
.cartoon-style .outdoor-dog {
  position: absolute;
  bottom: -100px; /* 下移到箭头位置 */
  left: -280px; /* 左移到箭头位置 */
  font-size: 55px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  animation: cute-bounce 3s ease-in-out infinite;
  z-index: 25; /* 确保在房子前面 */
}
.topdown-view .grass-ground {
  position: absolute;
  inset: 0;
  background: 
    repeating-linear-gradient(
      90deg,
      #7CCD7C 0px,
      #7CCD7C 3px,
      #90EE90 3px,
      #90EE90 10px
    ),
    repeating-linear-gradient(
      0deg,
      #6BBF6B 0px,
      #6BBF6B 4px,
      #8FBC8F 4px,
      #8FBC8F 15px
    );
  background-blend-mode: overlay;
  background-color: #7CCD7C;
}

/* 俯视装饰元素 */
.topdown-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.tree-decor {
  position: absolute;
  font-size: 50px;
  filter: drop-shadow(0 8px 8px rgba(0,0,0,0.3));
}

.tree-1 { top: 10%; left: 10%; }
.tree-2 { top: 15%; right: 15%; }
.tree-3 { bottom: 15%; left: 8%; }

.flower-decor {
  position: absolute;
  font-size: 28px;
  filter: drop-shadow(0 3px 3px rgba(0,0,0,0.15));
  animation: sway 3s ease-in-out infinite;
}

.flower-1 { top: 25%; left: 25%; }
.flower-2 { top: 35%; right: 20%; }
.flower-3 { bottom: 25%; right: 25%; }
.flower-4 { bottom: 30%; left: 20%; }

@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* 小木屋 (与首页风格一致) */
.topdown-view .dog-house {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 15;
  cursor: pointer;
  transition: all 0.3s ease;
}

.topdown-view .dog-house:hover {
  transform: translate(-50%, -50%) scale(1.05);
}

/* 屋顶 (与首页一致) */
.topdown-view .cottage-roof {
  width: 160px;
  height: 80px;
  background: #deb887;
  border-radius: 12px;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.topdown-view .roof-texture {
  position: absolute;
  inset: -10px;
  background: 
    radial-gradient(circle at 10px 10px, #8B4513 2px, transparent 2.5px),
    linear-gradient(135deg, #d4a574 25%, transparent 25%) -50px 0,
    linear-gradient(225deg, #d4a574 25%, transparent 25%) -50px 0,
    linear-gradient(315deg, #d4a574 25%, transparent 25%),
    linear-gradient(45deg, #d4a574 25%, transparent 25%);
  background-size: 20px 20px;
  background-color: #DEB887;
  transform: rotate(45deg);
}

.topdown-view .cottage-roof::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: rgba(107, 203, 119, 0.6);
  border-radius: 12px 12px 0 0;
}

/* 房屋主体 (与首页一致) */
.topdown-view .house-body.cottage-body {
  background: #FFF8DC;
  width: 130px;
  height: 90px;
  margin: -10px auto 0;
  border-radius: 0 0 8px 8px;
  position: relative;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border: 2px solid #DEB887;
}

/* 门 (与首页一致) */
.topdown-view .house-door {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 65px;
  background: #8B4513;
  border-radius: 24px 24px 0 0;
  box-shadow: inset 1px -1px 4px rgba(255,255,255,0.2);
}

.topdown-view .house-door::after {
  content: '';
  position: absolute;
  top: 35px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0,0,0,0.3);
}

/* 窗户 (与首页一致) */
.topdown-view .house-window {
  position: absolute;
  top: 20px;
  left: 15px;
  width: 30px;
  height: 30px;
  background: #A2E1FA;
  border: 3px solid #8B4513;
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.topdown-view .house-window::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #8B4513;
  transform: translateY(-50%);
}

.topdown-view .house-window::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #8B4513;
  transform: translateX(-50%);
}

/* 藤蔓装饰 */
.topdown-view .vines {
  position: absolute;
  top: -5px;
  right: 5px;
  font-size: 18px;
}

/* 烟囱 */
.topdown-view .chimney {
  position: absolute;
  top: -30px;
  right: 25px;
  width: 25px;
  height: 40px;
  background: #B8860B;
  border-radius: 3px;
  z-index: 1;
}

.topdown-view .smoke {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 15px;
  background: rgba(200, 200, 200, 0.6);
  border-radius: 50%;
  animation: smoke-rise 2s ease-out infinite;
}

@keyframes smoke-rise {
  0% {
    opacity: 0.6;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px) scale(2);
  }
}

/* 池塘 (俯视位置) */
.topdown-view .pond {
  position: absolute;
  bottom: 20%;
  right: 15%;
  width: 100px;
  height: 70px;
  background: linear-gradient(180deg, #A2E1FA, #45B7D1);
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(0, 50, 100, 0.1), 0 5px 15px rgba(162, 225, 250, 0.4);
  border: 4px solid rgba(255, 255, 255, 0.4);
  overflow: hidden;
  z-index: 12;
}

.topdown-view .water-reflection {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 40%;
  height: 30%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: rotate(-15deg);
}

.topdown-view .duck {
  position: absolute;
  bottom: 15px;
  right: 25px;
  font-size: 18px;
  animation: float-duck 5s ease-in-out infinite alternate;
}

/* 狗狗 (俯视位置) */
.topdown-view .outdoor-dog {
  position: absolute;
  bottom: 25%;
  left: 20%;
  font-size: 45px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  animation: cute-bounce 3s ease-in-out infinite;
  z-index: 12;
}

/* 草丛装饰 */
.topdown-view .grass-patch {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 30px;
  background: radial-gradient(ellipse at center, rgba(143, 218, 154, 0.6) 0%, transparent 70%);
  z-index: 11;
}

/* 户外草坪区域 (房子前方) */
.lawn-area {
  position: absolute;
  bottom: -60px;
  left: -100px;
  right: -100px;
  height: 160px;
  z-index: 3;
  pointer-events: none;
}

/* 户外池塘 (在草坪上) */
.pond {
  position: absolute;
  bottom: 30px;
  right: 50px;
  width: 100px;
  height: 45px;
  background: linear-gradient(180deg, #87CEEB, #4682B4);
  border-radius: 50%;
  box-shadow: inset 0 0 15px rgba(0, 50, 100, 0.2), 0 4px 10px rgba(70, 130, 180, 0.3);
  border: 3px solid #ADD8E6;
  overflow: hidden;
  z-index: 4;
}

.water-surface {
  position: absolute;
  top: 5px;
  left: 8px;
  width: 35%;
  height: 25%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: rotate(-10deg);
}

.duck {
  position: absolute;
  bottom: 8px;
  right: 20px;
  font-size: 16px;
  animation: float-duck 4s ease-in-out infinite alternate;
}

.lily-pad {
  position: absolute;
  bottom: 12px;
  left: 15px;
  font-size: 14px;
}

/* 草丛 */
.grass-tuft {
  position: absolute;
  font-size: 20px;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
}

.grass-1 { bottom: 60px; left: 20px; }
.grass-2 { bottom: 50px; left: 80px; }
.grass-3 { bottom: 55px; right: 30px; }

/* 户外狗狗 (在草坪上) */
.outdoor-dog {
  position: absolute;
  bottom: 40px;
  left: -40px;
  font-size: 45px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  animation: cute-bounce 3s ease-in-out infinite;
  z-index: 5;
}

/* 房子旁的装饰 */
.house-plants {
  position: absolute;
  bottom: 0;
  left: -30px;
  right: -30px;
  display: flex;
  justify-content: space-between;
  z-index: 3;
}

.plant {
  font-size: 24px;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
}

/* 草坪上的花和树 (靠近房子) */
.lawn-area .flower {
  position: absolute;
  font-size: 24px;
  animation: sway 3s ease-in-out infinite;
}

.lawn-area .flower-1 {
  bottom: 50px;
  left: -60px;
}

.lawn-area .flower-2 {
  bottom: 60px;
  right: -50px;
}

.lawn-area .tree {
  position: absolute;
  font-size: 50px;
  filter: drop-shadow(0 6px 8px rgba(0,0,0,0.2));
}

.tree-left {
  bottom: 30px;
  left: -120px;
}

.tree-right {
  bottom: 35px;
  right: -110px;
}

/* 室内狗狗 */
.indoor-dog {
  position: absolute;
  bottom: 10px;
  left: 60%; 
  transform: translateX(-50%);
  font-size: 50px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  animation: cute-bounce 3s ease-in-out infinite;
  z-index: 10;
  pointer-events: none;
}

.grass {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: var(--grass-bg, #90EE90);
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 150px,
    rgba(0, 100, 0, 0.03) 150px,
    rgba(0, 100, 0, 0.03) 300px
  );
}

.garden-decor {
  position: absolute;
  bottom: 5%;
  left: 0;
  right: 0;
  height: 40%;
}

.flower {
  position: absolute;
  font-size: 32px;
  animation: sway 3s ease-in-out infinite;
}

.flower-1 {
  left: 10%;
  bottom: 30%;
  animation-delay: 0s;
}

.flower-2 {
  left: 20%;
  bottom: 25%;
  animation-delay: -1s;
}

.flower-3 {
  right: 15%;
  bottom: 28%;
  animation-delay: -2s;
}

@keyframes sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.bush {
  position: absolute;
  font-size: 36px;
}

.bush-1 {
  left: 5%;
  bottom: 20%;
}

.bush-2 {
  right: 8%;
  bottom: 18%;
}

.tree {
  position: absolute;
  right: 5%;
  bottom: 25%;
  font-size: 80px;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

/* 室外的门 */
.outdoor-door {
  bottom: 0 !important;
  z-index: 10;
}

/* ========== 放置区域 ========== */
.placement-zone {
  position: absolute;
  border: 3px dashed rgba(255, 182, 193, 0.4);
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: auto;
}

.placement-zone:hover {
  border-color: rgba(255, 182, 193, 0.6);
  background: rgba(255, 182, 193, 0.1);
}

.placement-zone.active {
  border-style: solid;
  border-color: #FF8C94;
  background: rgba(255, 140, 148, 0.15);
  animation: zone-pulse 2s ease-in-out infinite;
}

.placement-zone.drag-over {
  border-color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
  border-width: 4px;
}

@keyframes zone-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.zone-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(100, 100, 100, 0.7);
  font-size: 12px;
  pointer-events: none;
}

.hint-icon {
  font-size: 24px;
}

/* ========== 已放置物品 ========== */
.placed-item {
  position: absolute;
  transform: translate(-50%, 50%);
  transition: transform 0.2s ease, filter 0.2s ease;
  cursor: pointer;
  pointer-events: auto;
}

.placed-item:hover {
  z-index: 100 !important;
}

.placed-item.editing-mode:hover {
  transform: translate(-50%, 50%) scale(1.1);
}

.placed-item.selected .item-card {
  border-color: #FF8C94;
  box-shadow: 0 0 0 4px rgba(255, 140, 148, 0.3);
}

.placed-item.dragging {
  opacity: 0.5;
}

.item-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 14px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.item-emoji {
  font-size: 32px;
  display: block;
}

.item-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.placed-item:hover .item-actions {
  opacity: 1;
}

.action-btn.remove {
  width: 22px;
  height: 22px;
  background: #FF6B6B;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
  transition: all 0.2s ease;
}

.action-btn.remove:hover {
  transform: scale(1.15);
  background: #FF5252;
}

/* 稀有度样式 */
.placed-item.quality-common .item-card {
  border-color: #b0bec5;
}

.placed-item.quality-rare .item-card {
  border-color: #81d4fa;
  background: linear-gradient(145deg, #e1f5fe, #b3e5fc);
}

.placed-item.quality-epic .item-card {
  border-color: #ce93d8;
  background: linear-gradient(145deg, #f3e5f5, #e1bee7);
}

.placed-item.quality-legendary .item-card {
  border-color: #ffd54f;
  background: linear-gradient(145deg, #fffde7, #fff9c4);
  animation: legendary-glow 2s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% { box-shadow: 0 4px 12px rgba(255, 213, 79, 0.3); }
  50% { box-shadow: 0 4px 20px rgba(255, 213, 79, 0.6); }
}

/* ========== 拖拽预览 ========== */
.drag-ghost {
  position: absolute;
  transform: translate(-50%, 50%);
  pointer-events: none;
  opacity: 0.8;
  z-index: 1000;
}

.ghost-icon {
  font-size: 40px;
  display: block;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.ghost-shadow {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 8px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  filter: blur(4px);
}

/* ========== 滑动提示 ========== */
.scroll-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: hint-fade 3s ease-in-out forwards;
  pointer-events: none;
}

@keyframes hint-fade {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}

.hint-icon {
  font-size: 20px;
  animation: hint-wiggle 1s ease-in-out infinite;
}

@keyframes hint-wiggle {
  0%, 100% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
}

.hint-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .scene-indicator {
    padding: 6px;
    gap: 4px;
  }

  .scene-tab {
    padding: 8px 12px;
  }

  .tab-icon {
    font-size: 20px;
  }

  .tab-text {
    font-size: 10px;
  }

  .door-icon {
    font-size: 22px;
  }

  .door-hint {
    font-size: 8px;
  }

  .scene-canvas {
    aspect-ratio: 4 / 3;
  }

  .item-card {
    width: 48px;
    height: 48px;
  }

  .item-emoji {
    font-size: 26px;
  }

  .cloud {
    font-size: 28px;
  }

  .sun {
    font-size: 40px;
  }

  .flower {
    font-size: 24px;
  }

  .tree {
    font-size: 50px;
  }

  /* 移动端卡通场景优化 */
  .cartoon-style {
    width: 250% !important;
    min-width: 250%;
  }
  
  .cartoon-style .dog-house {
    transform: translateX(-50%) scale(0.8);
  }
  
  .cartoon-style .dog-house:hover {
    transform: translateX(-50%) scale(0.85);
  }
  
  .cartoon-cloud {
    transform: scale(0.7);
  }
  
  .cartoon-tree {
    transform: scale(0.7);
  }
  
  .tree-left {
    left: 3%;
  }
  
  .tree-right {
    right: 3%;
  }
  
  .cartoon-style .pond {
    width: 70px;
    height: 45px;
    right: -50px;
  }
  
  .cartoon-style .outdoor-dog {
    font-size: 35px;
    left: -50px;
  }
  
  .ground-flower {
    font-size: 18px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 375px) {
  .scene-scroll-container {
    height: 50vh;
    min-height: 300px;
  }
  
  .cartoon-style {
    width: 200% !important;
    min-width: 200%;
  }
  
  .cartoon-style .dog-house {
    transform: translateX(-50%) scale(0.65);
  }
  
  .cartoon-cloud {
    transform: scale(0.5);
  }
  
  .cartoon-tree {
    transform: scale(0.5);
  }
}
</style>
