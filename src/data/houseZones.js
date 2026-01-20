// 小屋场景定义
export const HOUSE_SCENES = {
  indoor: {
    id: 'indoor',
    name: '室内',
    icon: '🏠',
    description: '温馨的室内空间',
    // 场景类型: indoor | outdoor
    type: 'indoor',
    // 场景宽度（相对于视口的倍数，支持左右滑动）
    width: 200, // 200% 宽度，可以左右滑动
    // 背景样式
    background: {
      wall: 'linear-gradient(180deg, #FFF5E6 0%, #FFE4C4 100%)',
      floor: 'linear-gradient(180deg, #DEB887 0%, #D2A679 100%)',
      ceiling: 'linear-gradient(180deg, #FFF8DC 0%, #FFF5E6 100%)'
    },
    // 区域定义（室内区域）
    zones: {
      floor: {
        id: 'floor',
        name: '地板',
        icon: '🪵',
        description: '放置地面家具',
        defaultPosition: { x: 50, y: 15 },
        bounds: { x: 10, y: 5, width: 80, height: 25 },
        placeableTypes: ['furniture']
      },
      wall: {
        id: 'wall',
        name: '墙面',
        icon: '🖼️',
        description: '挂置装饰物品',
        defaultPosition: { x: 25, y: 55 },
        bounds: { x: 10, y: 35, width: 80, height: 30 },
        placeableTypes: ['furniture', 'decoration']
      }
    }
  },
  outdoor: {
    id: 'outdoor',
    name: '室外',
    icon: '🌳',
    description: '开阔的室外庭院',
    type: 'outdoor',
    width: 250, // 250% 宽度，更宽广的室外空间
    background: {
      sky: 'linear-gradient(180deg, #87CEEB 0%, #b4e4fc 50%, #e8f4fd 100%)',
      grass: 'linear-gradient(180deg, #90EE90 0%, #7CCD7C 50%, #6BAA6B 100%)',
      garden: 'linear-gradient(180deg, #98D8AA 0%, #6BAA6B 100%)'
    },
    zones: {
      garden: {
        id: 'garden',
        name: '花园',
        icon: '🌸',
        description: '布置你的花园',
        defaultPosition: { x: 30, y: 20 },
        bounds: { x: 10, y: 10, width: 80, height: 35 },
        placeableTypes: ['furniture', 'decoration']
      },
      yard: {
        id: 'yard',
        name: '庭院',
        icon: '🌿',
        description: '放置庭院装饰',
        defaultPosition: { x: 60, y: 15 },
        bounds: { x: 50, y: 10, width: 45, height: 35 },
        placeableTypes: ['furniture', 'decoration']
      }
    }
  }
}

// 保持向后兼容的区域映射
export const HOUSE_ZONES = {
  // 室内区域
  floor: HOUSE_SCENES.indoor.zones.floor,
  wall: HOUSE_SCENES.indoor.zones.wall,
  // 室外区域
  garden: HOUSE_SCENES.outdoor.zones.garden,
  yard: HOUSE_SCENES.outdoor.zones.yard,
  // 向后兼容的旧区域映射
  ground: HOUSE_SCENES.indoor.zones.floor,
  outdoor: HOUSE_SCENES.outdoor.zones.garden
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
export function detectZoneByPosition(x, y, sceneId = 'indoor') {
  const scene = HOUSE_SCENES[sceneId]
  if (!scene || !scene.zones) return null

  for (const zone of Object.values(scene.zones)) {
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

// 获取场景列表
export function getSceneList() {
  return Object.values(HOUSE_SCENES)
}

// 根据区域ID获取所属场景ID
export function getSceneIdByZone(zoneId) {
  for (const [sceneId, scene] of Object.entries(HOUSE_SCENES)) {
    if (scene.zones && scene.zones[zoneId]) {
      return sceneId
    }
  }
  // 向后兼容：检查 HOUSE_ZONES
  for (const [sceneId, scene] of Object.entries(HOUSE_SCENES)) {
    for (const id of Object.keys(scene.zones || {})) {
      if (id === zoneId || (zoneId === 'ground' && id === 'floor')) {
        return sceneId
      }
    }
  }
  return 'indoor' // 默认返回室内
}

// 根据物品ID获取默认场景
export function getDefaultSceneForItem(itemId) {
  const zoneId = getDefaultZoneForItem(itemId)
  return getSceneIdByZone(zoneId)
}
