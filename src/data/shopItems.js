// 商店商品数据
export const SHOP_ITEMS = [
  // 家具装饰类
  {
    id: 'basic-bed',
    name: '舒适狗窝',
    category: 'furniture',
    type: 'furniture',
    price: 100,
    icon: '🛏️',
    description: '让狗狗睡得更舒服',
    rarity: 'common',
    placementZone: 'ground'
  },
  {
    id: 'fancy-lamp',
    name: '温馨台灯',
    category: 'furniture',
    type: 'furniture',
    price: 150,
    icon: '💡',
    description: '照亮小窝的每个角落',
    rarity: 'common',
    placementZone: 'wall'
  },
  {
    id: 'garden-fence',
    name: '花园栅栏',
    category: 'furniture',
    type: 'furniture',
    price: 300,
    icon: '🏡',
    description: '为庭院加上漂亮的栅栏',
    rarity: 'rare',
    placementZone: 'outdoor'
  },
  {
    id: 'flower-bed',
    name: '花坛',
    category: 'furniture',
    type: 'furniture',
    price: 250,
    icon: '🌸',
    description: '种上美丽的花朵',
    rarity: 'rare',
    placementZone: 'ground'
  },
  {
    id: 'pool',
    name: '迷你泳池',
    category: 'furniture',
    type: 'furniture',
    price: 500,
    icon: '🏊',
    description: '夏天狗狗的最爱',
    rarity: 'epic',
    placementZone: 'ground'
  },
  {
    id: 'dog-house-level2',
    name: '豪华狗屋',
    category: 'furniture',
    type: 'upgrade',
    price: 1000,
    icon: '🏠',
    description: '升级到2级豪华狗屋',
    rarity: 'legendary',
    placementZone: 'ground'
  },
  // 狗狗用品类
  {
    id: 'red-collar',
    name: '红色项圈',
    category: 'dog-items',
    type: 'accessory',
    price: 80,
    icon: '📿',
    description: '时尚的红色项圈',
    rarity: 'common'
  },
  {
    id: 'cool-sunglasses',
    name: '酷炫墨镜',
    category: 'dog-items',
    type: 'accessory',
    price: 200,
    icon: '🕶️',
    description: '让狗狗更有型',
    rarity: 'rare'
  },
  {
    id: 'cute-hat',
    name: '可爱小帽',
    category: 'dog-items',
    type: 'accessory',
    price: 150,
    icon: '🎩',
    description: '增加可爱度100%',
    rarity: 'rare'
  },
  {
    id: 'frisbee',
    name: '飞盘玩具',
    category: 'dog-items',
    type: 'toy',
    price: 120,
    icon: '🥏',
    description: '和狗狗一起玩耍',
    rarity: 'common'
  },
  {
    id: 'tennis-ball',
    name: '网球',
    category: 'dog-items',
    type: 'toy',
    price: 50,
    icon: '🎾',
    description: '经典玩具',
    rarity: 'common'
  },
  // 体验类
  {
    id: 'special-treat',
    name: '美味零食',
    category: 'experiences',
    type: 'consumable',
    price: 30,
    icon: '🦴',
    description: '狗狗会表演特殊动画',
    rarity: 'common',
    effect: 'happy_animation'
  },
  {
    id: 'energy-drink',
    name: '活力饮料',
    category: 'experiences',
    type: 'consumable',
    price: 50,
    icon: '⚡',
    description: '恢复狗狗全部活力',
    rarity: 'common',
    effect: 'restore_energy'
  },
  // 数字内容类
  {
    id: 'diary-skin-1',
    name: '星空日记本',
    category: 'digital',
    type: 'skin',
    price: 200,
    icon: '🌌',
    description: '炫酷的星空主题',
    rarity: 'rare'
  },
  {
    id: 'diary-skin-2',
    name: '樱花日记本',
    category: 'digital',
    type: 'skin',
    price: 200,
    icon: '🌸',
    description: '浪漫的樱花主题',
    rarity: 'rare'
  },
  {
    id: 'diary-skin-3',
    name: '海洋日记本',
    category: 'digital',
    type: 'skin',
    price: 300,
    icon: '🌊',
    description: '清新的海洋主题',
    rarity: 'epic'
  }
]

// 商店分类
export const SHOP_CATEGORIES = [
  { id: 'furniture', name: '家具装饰', icon: '🏠' },
  { id: 'dog-items', name: '狗狗用品', icon: '🦴' },
  { id: 'experiences', name: '体验类', icon: '✨' },
  { id: 'digital', name: '数字内容', icon: '🎨' }
]
