// 小屋区域定义
export const HOUSE_ZONES = {
  ground: {
    id: 'ground',
    name: '地面',
    icon: '🌿',
    description: '放置地面家具',
    defaultPosition: { x: 50, y: 70 },
    // 区域边界（百分比）
    bounds: { x: 10, y: 55, width: 80, height: 40 },
    // 区域样式
    style: {
      background: 'linear-gradient(180deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
      borderColor: 'rgba(139, 195, 74, 0.3)'
    },
    // 可放置的物品类型
    placeableTypes: ['furniture'],
    // 默认放置的物品ID列表
    defaultItems: ['basic-bed', 'flower-bed', 'pool']
  },
  wall: {
    id: 'wall',
    name: '墙面',
    icon: '🖼️',
    description: '挂置装饰物品',
    defaultPosition: { x: 20, y: 40 },
    bounds: { x: 5, y: 20, width: 40, height: 50 },
    style: {
      background: 'linear-gradient(180deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 182, 193, 0.05) 100%)',
      borderColor: 'rgba(255, 182, 193, 0.3)'
    },
    placeableTypes: ['furniture', 'decoration'],
    defaultItems: ['fancy-lamp']
  },
  outdoor: {
    id: 'outdoor',
    name: '室外',
    icon: '🏡',
    description: '放置庭院装饰',
    defaultPosition: { x: 80, y: 60 },
    bounds: { x: 60, y: 45, width: 35, height: 50 },
    style: {
      background: 'linear-gradient(180deg, rgba(129, 212, 250, 0.1) 0%, rgba(129, 212, 250, 0.05) 100%)',
      borderColor: 'rgba(129, 212, 250, 0.3)'
    },
    placeableTypes: ['furniture', 'decoration'],
    defaultItems: ['garden-fence']
  }
}

// 根据物品ID获取默认区域
export function getDefaultZoneForItem(itemId) {
  for (const zone of Object.values(HOUSE_ZONES)) {
    if (zone.defaultItems.includes(itemId)) {
      return zone.id
    }
  }
  return 'ground' // 默认返回地面
}

// 获取区域列表
export function getZoneList() {
  return Object.values(HOUSE_ZONES)
}

// 根据位置判断所属区域
export function detectZoneByPosition(x, y) {
  for (const zone of Object.values(HOUSE_ZONES)) {
    const { bounds } = zone
    if (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    ) {
      return zone.id
    }
  }
  return null
}
