<template>
  <div class="house-canvas-wrapper">
    <!-- 场景切换指示器 -->
    <div class="scene-indicator">
      <button
        @click="switchScene('indoor')"
        class="scene-tab"
        :class="{ active: currentScene === 'indoor' }"
      >
        <span class="tab-icon">🏠</span>
        <span class="tab-text">室内</span>
      </button>
      <div class="scene-divider" @click="switchSceneByDoor">
        <span class="door-icon">🚪</span>
        <span class="door-hint">点击门口切换</span>
      </div>
      <button
        @click="switchScene('outdoor')"
        class="scene-tab"
        :class="{ active: currentScene === 'outdoor' }"
      >
        <span class="tab-icon">🌳</span>
        <span class="tab-text">室外</span>
      </button>
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
          <!-- 门（点击可切换到室外） -->
          <div class="house-door" @click="switchSceneByDoor">
            <div class="door-frame">
              <div class="door-panel">
                <div class="door-handle"></div>
              </div>
            </div>
          </div>
          <!-- 窗户 -->
          <div class="house-window">
            <div class="window-frame">
              <div class="window-glass"></div>
            </div>
          </div>
        </div>

        <!-- 室外场景 -->
        <div
          v-show="currentScene === 'outdoor'"
          class="scene-layer outdoor-scene"
          :style="sceneStyle.outdoor"
        >
          <!-- 天空 -->
          <div class="sky">
            <div class="cloud cloud-1">☁️</div>
            <div class="cloud cloud-2">☁️</div>
            <div class="cloud cloud-3">☁️</div>
            <div class="sun">☀️</div>
          </div>
          <!-- 草地 -->
          <div class="grass"></div>
          <!-- 花园装饰 -->
          <div class="garden-decor">
            <div class="flower flower-1">🌸</div>
            <div class="flower flower-2">🌼</div>
            <div class="flower flower-3">🌷</div>
            <div class="bush bush-1">🌿</div>
            <div class="bush bush-2">🌱</div>
            <div class="tree">🌳</div>
          </div>
          <!-- 门（点击可切换到室内） -->
          <div class="house-door outdoor-door" @click="switchSceneByDoor">
            <div class="door-frame">
              <div class="door-panel">
                <div class="door-handle"></div>
              </div>
            </div>
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

// 场景列表
const sceneList = computed(() => getSceneList())

// 当前场景配置
const currentSceneConfig = computed(() => HOUSE_SCENES[currentScene.value])

// 当前场景的区域列表
const currentSceneZones = computed(() => {
  const config = currentSceneConfig.value
  return config && config.zones ? Object.values(config.zones) : []
})

// 画布样式（基于场景宽度）
const canvasStyle = computed(() => {
  const width = currentSceneConfig.value?.width || 200
  return {
    width: width + '%'
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

// 切换场景
const switchScene = (sceneId) => {
  if (HOUSE_SCENES[sceneId]) {
    currentScene.value = sceneId
    // 重置滚动位置
    if (sceneScrollRef.value) {
      sceneScrollRef.value.scrollLeft = 0
    }
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
.scene-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(255, 150, 150, 0.15);
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
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(255, 150, 150, 0.2);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 182, 193, 0.5) transparent;
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
  aspect-ratio: 16 / 9;
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

/* 室内的门 */
.indoor-scene .house-door {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 120px;
  pointer-events: auto;
  cursor: pointer;
  z-index: 5;
  transition: transform 0.3s ease;
}

.indoor-scene .house-door:hover {
  transform: translateX(-50%) scale(1.05);
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
}
</style>
