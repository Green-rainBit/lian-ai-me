<template>
  <div class="shop-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="currency-card">
        <span class="coin-icon">🦴</span>
        <span class="coin-amount">{{ currencyStore.balance }}</span>
      </div>
      <h1 class="shop-title">🛒 汪汪市集</h1>
      <div class="header-spacer"></div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
        v-for="category in shopStore.categories"
        :key="category.id"
        @click="selectCategory(category.id)"
        class="category-chip"
        :class="{ active: shopStore.selectedCategory === category.id }"
      >
        <span class="chip-icon">{{ category.icon }}</span>
        <span class="chip-name">{{ category.name }}</span>
      </button>
    </div>

    <!-- 商品网格 -->
    <div class="items-section">
      <div class="items-grid">
        <div
          v-for="item in currentCategoryItems"
          :key="item.id"
          class="shop-item-card"
          :class="[
            getQualityClass(item.rarity),
            { owned: shopStore.isItemOwned(item.id) }
          ]"
        >
          <!-- 物品图标区域 -->
          <div class="item-display">
            <div class="item-icon-wrapper">
              <span class="item-emoji">{{ item.icon }}</span>
              <!-- 稀有度光效 -->
              <div v-if="item.rarity === 'legendary'" class="rarity-glow legendary"></div>
              <div v-else-if="item.rarity === 'epic'" class="rarity-glow epic"></div>
              <div v-else-if="item.rarity === 'rare'" class="rarity-glow rare"></div>
            </div>
            <!-- 已拥有标签 -->
            <div v-if="shopStore.isItemOwned(item.id)" class="owned-badge">
              <span>✓</span>
            </div>
          </div>

          <!-- 物品信息 -->
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-desc">{{ item.description }}</p>

            <!-- 价格和购买按钮 -->
            <div class="item-action">
              <div class="price-tag">
                <span class="price-icon">🦴</span>
                <span class="price-value">{{ item.price }}</span>
              </div>
              <button
                @click="purchaseItem(item)"
                class="buy-btn"
                :class="{ owned: shopStore.isItemOwned(item.id) }"
                :disabled="shopStore.isItemOwned(item.id)"
              >
                <span v-if="!shopStore.isItemOwned(item.id)">购买</span>
                <span v-else>已拥有</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航占位 -->
    <div class="tab-bar-spacer"></div>
    <div class="tab-bar-wrapper">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TabBar from '@/views/Home/components/TabBar.vue'
import { useCurrencyStore } from '@/stores/currency'
import { useShopStore } from '@/stores/shop'

const currencyStore = useCurrencyStore()
const shopStore = useShopStore()

const currentCategoryItems = computed(() => {
  return shopStore.itemsByCategory(shopStore.selectedCategory)
})

const selectCategory = (categoryId) => {
  shopStore.selectCategory(categoryId)
}

const getQualityClass = (rarity) => {
  return `quality-${rarity || 'common'}`
}

const purchaseItem = async (item) => {
  if (shopStore.isItemOwned(item.id)) return

  try {
    await shopStore.purchaseItem(item.id)
    // 使用现代化的toast通知
    if (window.$toast) {
      window.$toast.success(`成功购买 ${item.name}！`, {
        title: '🎉 购买成功'
      })
    }
  } catch (error) {
    if (window.$toast) {
      window.$toast.error(error.message, {
        title: '❌ 购买失败'
      })
    }
  }
}
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
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

.currency-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
  border: var(--glass-border);
}

.coin-icon {
  font-size: 20px;
}

.coin-amount {
  font-size: 18px;
  font-weight: 700;
  color: #FF8C94;
}

.shop-title {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  background: var(--gradient-rainbow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.header-spacer {
  width: 80px;
}

/* ========== 分类标签 ========== */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: var(--glass-border);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-chip:hover {
  border-color: #FF8C94;
  background: rgba(255, 140, 148, 0.1);
  transform: translateY(-2px);
}

.category-chip.active {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
}

.chip-icon {
  font-size: 18px;
}

/* ========== 商品网格 ========== */
.items-section {
  margin-bottom: 20px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.shop-item-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: var(--glass-border);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.shop-item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.shop-item-card.owned {
  opacity: 0.7;
}

/* 稀有度边框样式 */
.shop-item-card.quality-common {
  border-color: #e0e0e0;
}

.shop-item-card.quality-rare {
  border-color: #81d4fa;
  background: linear-gradient(145deg, #e1f5fe, #ffffff);
}

.shop-item-card.quality-epic {
  border-color: #ce93d8;
  background: linear-gradient(145deg, #f3e5f5, #ffffff);
}

.shop-item-card.quality-legendary {
  border-color: #ffd54f;
  background: linear-gradient(145deg, #fffde7, #ffffff);
}

/* 物品展示区 */
.item-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
}

.item-icon-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-emoji {
  font-size: 48px;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 稀有度光效 */
.rarity-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  opacity: 0.3;
  pointer-events: none;
  animation: glow-pulse 2s ease-in-out infinite;
}

.rarity-glow.rare {
  background: radial-gradient(circle, rgba(129, 212, 250, 0.4), transparent);
}

.rarity-glow.epic {
  background: radial-gradient(circle, rgba(206, 147, 216, 0.4), transparent);
}

.rarity-glow.legendary {
  background: radial-gradient(circle, rgba(255, 213, 79, 0.5), transparent);
  animation: legendary-pulse 1.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

@keyframes legendary-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
    box-shadow: 0 0 20px rgba(255, 213, 79, 0.6);
  }
  50% {
    transform: scale(1.15);
    opacity: 0.7;
    box-shadow: 0 0 30px rgba(255, 213, 79, 0.9);
  }
}

/* 已拥有标签 */
.owned-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.4);
}

/* 物品详情 */
.item-details {
  text-align: center;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin: 0 0 6px 0;
}

.item-desc {
  font-size: 12px;
  color: #888;
  margin: 0 0 12px 0;
  line-height: 1.4;
  min-height: 34px;
}

/* 购买区域 */
.item-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.price-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 140, 148, 0.1);
  border-radius: 16px;
}

.price-icon {
  font-size: 14px;
}

.price-value {
  font-size: 14px;
  font-weight: 700;
  color: #FF8C94;
}

.buy-btn {
  flex: 1;
  padding: 8px 14px;
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 140, 148, 0.3);
}

.buy-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 140, 148, 0.5);
}

.buy-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.buy-btn:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

/* 底部导航 */
.tab-bar-spacer {
  height: 20px;
}

.tab-bar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* ========== 移动端适配 ========== */
@media (max-width: 480px) {
  .shop-page {
    padding: 12px;
    padding-bottom: 100px;
  }

  .shop-title {
    font-size: 18px;
  }

  .currency-card {
    padding: 8px 12px;
  }

  .coin-amount {
    font-size: 16px;
  }

  .category-chip {
    padding: 8px 12px;
    font-size: 13px;
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .shop-item-card {
    padding: 12px;
  }

  .item-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .item-emoji {
    font-size: 40px;
  }

  .item-name {
    font-size: 14px;
  }

  .item-desc {
    font-size: 11px;
    min-height: 30px;
  }

  .price-tag {
    padding: 5px 8px;
  }

  .price-icon {
    font-size: 12px;
  }

  .price-value {
    font-size: 12px;
  }

  .buy-btn {
    padding: 7px 10px;
    font-size: 12px;
  }
}
</style>
