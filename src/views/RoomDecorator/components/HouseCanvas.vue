<template>
  <div class="house-canvas-wrapper">
    <div
      ref="canvasRef"
      class="house-canvas"
      :class="{ 'editing-mode': roomStore.editingMode }"
      @pointerdown="handleCanvasDown"
      @pointermove="handleCanvasMove"
      @pointerup="handleCanvasUp"
      @pointerleave="handleCanvasLeave"
    >
      <!-- 温馨的小屋背景场景 -->
      <div class="cozy-house-scene">
        <!-- 天空背景 -->
        <div class="sky-background">
          <div class="cloud cloud-1">☁️</div>
          <div class="cloud cloud-2">☁️</div>
          <div class="sun">☀️</div>
        </div>

        <!-- 草地 -->
        <div class="grass-ground"></div>

        <!-- 可爱的小屋主体 (3D透视风格) -->
        <div class="cute-house" :class="`house-level-${dogStore.houseLevel}`">
          <!-- 房顶 -->
          <div class="house-roof">
            <div class="roof-pattern"></div>
          </div>
          <!-- 房身 -->
          <div class="house-body">
            <!-- 窗户 -->
            <div class="house-window left">
              <div class="window-frame">
                <div class="window-pane"></div>
              </div>
            </div>
            <div class="house-window right">
              <div class="window-frame">
                <div class="window-pane"></div>
              </div>
            </div>
            <!-- 门 -->
            <div class="house-door">
              <div class="door-handle"></div>
            </div>
          </div>
          <!-- 门廊 -->
          <div class="house-porch">
            <div class="porch-floor"></div>
          </div>
        </div>

        <!-- 花园装饰 -->
        <div class="garden-decor">
          <div class="flower flower-1">🌸</div>
          <div class="flower flower-2">🌼</div>
          <div class="flower flower-3">🌷</div>
          <div class="bush">🌿</div>
        </div>
      </div>

      <!-- 物品放置区域指示 (仅在编辑模式显示) -->
      <div
        v-for="zone in zoneList"
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoomStore } from '@/stores/room'
import { useDogStore } from '@/stores/dog'
import { HOUSE_ZONES, getZoneList } from '@/data/houseZones'

const roomStore = useRoomStore()
const dogStore = useDogStore()
const canvasRef = ref(null)

const zoneList = computed(() => getZoneList())
const isDraggingOverZone = ref(null)
const dragPosition = ref(null)

// 显示的物品（按Y坐标排序，实现正确的前后遮挡关系）
const displayedItems = computed(() => {
  return [...roomStore.placedItems].sort((a, b) => {
    return (a.position?.y || 0) - (b.position?.y || 0)
  })
})

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
  if (!roomStore.draggedItem || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
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
  if (!roomStore.draggedItem || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
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

onMounted(() => {})

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

.house-canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(
    180deg,
    #ffe4ec 0%,
    #fff5f7 20%,
    #e8f4fd 50%,
    #d4f1f9 80%,
    #c8e6c9 100%
  );
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(255, 150, 150, 0.2);
  transition: all 0.3s ease;
}

.house-canvas.editing-mode {
  box-shadow: 0 8px 40px rgba(255, 150, 150, 0.35);
  border: 3px solid rgba(255, 182, 193, 0.5);
}

/* ========== 温馨小屋场景 ========== */
.cozy-house-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 天空背景 */
.sky-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(
    180deg,
    #87CEEB 0%,
    #b4e4fc 40%,
    #e8f4fd 100%
  );
}

.cloud {
  position: absolute;
  font-size: 28px;
  opacity: 0.8;
  animation: float 8s ease-in-out infinite;
}

.cloud-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.cloud-2 {
  top: 20%;
  right: 15%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.sun {
  position: absolute;
  top: 8%;
  right: 8%;
  font-size: 40px;
  animation: sun-glow 3s ease-in-out infinite;
}

@keyframes sun-glow {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 200, 0, 0.5)); }
  50% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(255, 200, 0, 0.8)); }
}

/* 草地 */
.grass-ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(
    180deg,
    #90EE90 0%,
    #7CCD7C 30%,
    #6BAA6B 100%
  );
  border-radius: 0 0 24px 24px;
}

/* 可爱小屋 */
.cute-house {
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 160px;
  z-index: 10;
}

/* 房顶 */
.house-roof {
  position: absolute;
  top: 0;
  left: -20px;
  right: -20px;
  height: 80px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FF6B6B 100%);
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.roof-pattern {
  position: absolute;
  top: 30%;
  left: 20%;
  right: 20%;
  height: 50%;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 8px,
    rgba(255, 255, 255, 0.2) 8px,
    rgba(255, 255, 255, 0.2) 16px
  );
}

/* 房身 */
.house-body {
  position: absolute;
  top: 75px;
  left: 0;
  right: 0;
  height: 85px;
  background: linear-gradient(180deg, #FFF5E6 0%, #FFE4C4 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 窗户 */
.house-window {
  position: absolute;
  top: 15px;
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #87CEEB 0%, #b4e4fc 100%);
  border: 3px solid #8B4513;
  border-radius: 50%;
}

.house-window.left {
  left: 20px;
}

.house-window.right {
  right: 20px;
}

.window-frame {
  position: relative;
  width: 100%;
  height: 100%;
}

.window-pane {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: #8B4513;
  transform: translateY(-50%);
}

.window-pane::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -10px;
  width: 3px;
  height: 29px;
  background: #8B4513;
  transform: translateX(-50%);
}

/* 门 */
.house-door {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 55px;
  background: linear-gradient(180deg, #A0522D 0%, #8B4513 100%);
  border-radius: 8px 8px 0 0;
  border: 3px solid #654321;
}

.door-handle {
  position: absolute;
  top: 50%;
  right: 6px;
  width: 6px;
  height: 6px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
}

/* 门廊 */
.house-porch {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 15px;
}

.porch-floor {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #DEB887 0%, #D2A679 100%);
  border-radius: 4px;
}

/* 花园装饰 */
.garden-decor {
  position: absolute;
  bottom: 5%;
  left: 0;
  right: 0;
  height: 30%;
}

.flower {
  position: absolute;
  font-size: 24px;
  animation: sway 3s ease-in-out infinite;
}

.flower-1 {
  left: 12%;
  bottom: 20%;
  animation-delay: 0s;
}

.flower-2 {
  left: 18%;
  bottom: 15%;
  animation-delay: -1s;
}

.flower-3 {
  right: 15%;
  bottom: 18%;
  animation-delay: -2s;
}

@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.bush {
  position: absolute;
  right: 8%;
  bottom: 12%;
  font-size: 28px;
}

/* ========== 放置区域 ========== */
.placement-zone {
  position: absolute;
  border: 3px dashed rgba(255, 182, 193, 0.4);
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
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

/* 移动端适配 */
@media (max-width: 480px) {
  .house-canvas {
    aspect-ratio: 1 / 1;
    border-radius: 20px;
  }

  .cute-house {
    width: 150px;
    height: 120px;
  }

  .house-roof {
    height: 60px;
  }

  .house-body {
    top: 55px;
    height: 65px;
  }

  .house-window {
    width: 26px;
    height: 26px;
  }

  .house-door {
    width: 32px;
    height: 45px;
  }

  .item-card {
    width: 48px;
    height: 48px;
  }

  .item-emoji {
    font-size: 26px;
  }

  .cloud {
    font-size: 20px;
  }

  .sun {
    font-size: 30px;
  }

  .flower {
    font-size: 18px;
  }
}
</style>
