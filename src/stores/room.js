import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDogStore } from './dog'
import { useShopStore } from './shop'
import { HOUSE_ZONES, HOUSE_SCENES, getDefaultZoneForItem, detectZoneByPosition, getSceneIdByZone } from '@/data/houseZones'
import { generateId, saveToStorage, loadFromStorage } from '@/utils/helpers'

export const useRoomStore = defineStore('room', () => {
  // ========== 状态 ==========
  const selectedZone = ref('ground')     // 当前选中的区域
  const editingMode = ref(false)         // 是否在编辑模式
  const draggedItem = ref(null)          // 当前拖拽的物品
  const selectedItem = ref(null)         // 当前选中的物品
  const showZoneHints = ref(true)        // 是否显示区域提示

  // ========== 计算属性 ==========

  // 从 dog store 获取已放置的物品
  const placedItems = computed(() => {
    const dogStore = useDogStore()
    return dogStore.houseItems || []
  })

  // 从 shop store 获取已拥有但未放置的家具
  const unplacedFurniture = computed(() => {
    const shopStore = useShopStore()
    const dogStore = useDogStore()

    // 获取已拥有的家具类物品
    const ownedFurniture = shopStore.ownedItems.filter(
      item => item.category === 'furniture' && item.type === 'furniture'
    )

    // 过滤出已放置的物品ID
    const placedIds = placedItems.value.map(item => item.itemId || item.id)

    // 返回未放置的家具
    return ownedFurniture.filter(item => !placedIds.includes(item.id))
  })

  // 当前选中区域的物品
  const currentZoneItems = computed(() => {
    return placedItems.value.filter(item => item.zone === selectedZone.value)
  })

  // ========== 方法 ==========

  // 选择区域
  const selectZone = (zoneId) => {
    if (HOUSE_ZONES[zoneId]) {
      selectedZone.value = zoneId
    }
  }

  // 切换编辑模式
  const toggleEditMode = () => {
    editingMode.value = !editingMode.value
    if (!editingMode.value) {
      // 退出编辑模式时清除选中状态
      selectedItem.value = null
      draggedItem.value = null
    }
  }

  // 获取某区域的物品
  const getItemsByZone = (zoneId) => {
    return placedItems.value.filter(item => item.zone === zoneId)
  }

  // 放置物品到小屋
  const placeItem = (item, zone = null, position = null) => {
    const dogStore = useDogStore()

    // 确定放置区域
    const targetZone = zone || getDefaultZoneForItem(item.id)

    // 确定放置位置
    let targetPosition = position
    if (!targetPosition) {
      // 使用区域默认位置，添加一些随机偏移避免重叠
      const zone = HOUSE_ZONES[targetZone]
      const offsetX = (Math.random() - 0.5) * 10
      const offsetY = (Math.random() - 0.5) * 10
      targetPosition = {
        x: zone.defaultPosition.x + offsetX,
        y: zone.defaultPosition.y + offsetY
      }
    }

    // 创建放置物品实例
    const placedItem = {
      instanceId: generateId(),
      itemId: item.id,
      zone: targetZone,
      position: targetPosition,
      placedAt: new Date().toISOString(),
      // 保留物品的所有属性
      ...item
    }

    dogStore.addHouseItem(placedItem)
    return placedItem
  }

  // 更新物品位置
  const updateItemPosition = (instanceId, newPosition) => {
    const dogStore = useDogStore()
    const item = dogStore.houseItems.find(i => i.instanceId === instanceId)
    if (item) {
      item.position = newPosition

      // 获取物品当前所属的场景
      const currentSceneId = getSceneIdByZone(item.zone)

      // 检测是否切换了区域（在当前场景内检测）
      const newZone = detectZoneByPosition(newPosition.x, newPosition.y, currentSceneId)
      if (newZone && newZone !== item.zone) {
        item.zone = newZone
      }

      saveToStorage('dog', dogStore.$state)
    }
  }

  // 移动物品到其他区域
  const moveItemToZone = (instanceId, newZone) => {
    const dogStore = useDogStore()
    const item = dogStore.houseItems.find(i => i.instanceId === instanceId)
    if (item && HOUSE_ZONES[newZone]) {
      item.zone = newZone
      // 更新为新区域的默认位置，添加随机偏移
      const zone = HOUSE_ZONES[newZone]
      const offsetX = (Math.random() - 0.5) * 10
      const offsetY = (Math.random() - 0.5) * 10
      item.position = {
        x: zone.defaultPosition.x + offsetX,
        y: zone.defaultPosition.y + offsetY
      }
      saveToStorage('dog', dogStore.$state)
    }
  }

  // 移除物品
  const removeItem = (instanceId) => {
    const dogStore = useDogStore()
    const index = dogStore.houseItems.findIndex(i => i.instanceId === instanceId)
    if (index !== -1) {
      dogStore.houseItems.splice(index, 1)
      saveToStorage('dog', dogStore.$state)
    }
  }

  // 选中物品
  const selectItem = (item) => {
    selectedItem.value = item
  }

  // 取消选中
  const deselectItem = () => {
    selectedItem.value = null
  }

  // 开始拖拽
  const startDrag = (item, event) => {
    draggedItem.value = {
      item,
      startX: event.clientX,
      startY: event.clientY,
      originalPosition: { ...item.position }
    }
  }

  // 拖拽中
  const onDrag = (event, canvasRect) => {
    if (!draggedItem.value) return null

    const x = ((event.clientX - canvasRect.left) / canvasRect.width) * 100
    const y = 100 - ((event.clientY - canvasRect.top) / canvasRect.height) * 100

    // 限制在画布范围内
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))

    return { x: clampedX, y: clampedY }
  }

  // 结束拖拽
  const endDrag = (finalPosition) => {
    if (!draggedItem.value) return

    const { item } = draggedItem.value
    updateItemPosition(item.instanceId, finalPosition)
    draggedItem.value = null
  }

  // 保存小屋状态
  const saveRoom = () => {
    const dogStore = useDogStore()
    saveToStorage('dog', dogStore.$state)
    editingMode.value = false
    selectedItem.value = null
  }

  // 初始化
  const initRoom = () => {
    // 迁移旧数据结构（如果存在）
    const dogStore = useDogStore()
    const migrated = dogStore.houseItems.map(item => {
      // 如果没有 instanceId，生成一个
      if (!item.instanceId) {
        return {
          ...item,
          instanceId: generateId(),
          itemId: item.itemId || item.id
        }
      }
      return item
    })

    // 如果有迁移，保存
    if (JSON.stringify(migrated) !== JSON.stringify(dogStore.houseItems)) {
      dogStore.houseItems = migrated
      saveToStorage('dog', dogStore.$state)
    }
  }

  return {
    // 状态
    selectedZone,
    editingMode,
    draggedItem,
    selectedItem,
    showZoneHints,

    // 计算属性
    placedItems,
    unplacedFurniture,
    currentZoneItems,

    // 方法
    selectZone,
    toggleEditMode,
    getItemsByZone,
    placeItem,
    updateItemPosition,
    moveItemToZone,
    removeItem,
    selectItem,
    deselectItem,
    startDrag,
    onDrag,
    endDrag,
    saveRoom,
    initRoom
  }
})
