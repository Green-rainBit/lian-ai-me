<template>
  <div class="shop-page">
    <!-- 顶部导航 -->
    <header class="page-header" role="banner">
      <div class="currency-card" aria-label="骨头币余额">
        <span class="coin-icon" aria-hidden="true">🦴</span>
        <span class="coin-amount">{{ currencyStore.balance }}</span>
      </div>
      <h1 class="shop-title">🛒 汪汪市集</h1>
      <div class="header-spacer" aria-hidden="true"></div>
    </header>

    <!-- 分类标签 -->
    <nav class="category-tabs" aria-label="商品分类">
      <div role="tablist" class="category-list">
        <button
          v-for="category in shopStore.categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="category-chip"
          :class="{ active: shopStore.selectedCategory === category.id }"
          role="tab"
          :aria-selected="shopStore.selectedCategory === category.id"
          :aria-label="`${category.name}分类，${getCategoryItemCount(category.id)}件商品`"
        >
          <span class="chip-icon" aria-hidden="true">{{ category.icon }}</span>
          <span class="chip-name">{{ category.name }}</span>
        </button>
      </div>
    </nav>

    <!-- 商品网格 -->
    <main class="items-section" role="main" :aria-label="`${getCurrentCategoryName()}商品列表`">
      <div class="items-grid" role="list">
        <article
          v-for="item in currentCategoryItems"
          :key="item.id"
          class="shop-item-card"
          :class="[
            getQualityClass(item.rarity),
            { owned: shopStore.isItemOwned(item.id) }
          ]"
          role="listitem"
          :aria-label="`${item.name}，${item.description}，${getRarityLabel(item.rarity)}品质，${item.price}骨头币${shopStore.isItemOwned(item.id) ? '，已拥有' : ''}`"
        >
          <!-- 物品图标区域 -->
          <div class="item-display" aria-hidden="true">
            <div class="item-icon-wrapper">
              <span class="item-emoji">{{ item.icon }}</span>
              <!-- 稀有度光效 -->
              <div v-if="item.rarity === 'legendary'" class="rarity-glow legendary"></div>
              <div v-else-if="item.rarity === 'epic'" class="rarity-glow epic"></div>
              <div v-else-if="item.rarity === 'rare'" class="rarity-glow rare"></div>
            </div>
            <!-- 已拥有标签 -->
            <div v-if="shopStore.isItemOwned(item.id)" class="owned-badge" aria-label="已拥有">
              <span>✓</span>
            </div>
          </div>

          <!-- 物品信息 -->
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-desc">{{ item.description }}</p>

            <!-- 价格和购买按钮 -->
            <div class="item-action">
              <div class="price-tag" aria-label="价格">
                <span class="price-icon" aria-hidden="true">🦴</span>
                <span class="price-value">{{ item.price }}</span>
              </div>
              <button
                @click="purchaseItem(item)"
                class="buy-btn"
                :class="{ owned: shopStore.isItemOwned(item.id) }"
                :disabled="shopStore.isItemOwned(item.id)"
                :aria-label="`${shopStore.isItemOwned(item.id) ? '已拥有' : '购买'}${item.name}`"
              >
                <span v-if="!shopStore.isItemOwned(item.id)">购买</span>
                <span v-else>已拥有</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>

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

const getRarityLabel = (rarity) => {
  const labels = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return labels[rarity] || '普通'
}

const getCurrentCategoryName = () => {
  const category = shopStore.categories.find(c => c.id === shopStore.selectedCategory)
  return category?.name || '全部'
}

const getCategoryItemCount = (categoryId) => {
  return shopStore.itemsByCategory(categoryId).length
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
  padding: var(--space-lg);
  padding-bottom: 100px;
}

/* ========== 顶部导航 ========== */
.page-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding: var(--space-md) var(--space-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.currency-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, rgba(255, 140, 148, 0.15), rgba(255, 182, 193, 0.1));
  backdrop-filter: var(--glass-backdrop);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 2px solid rgba(255, 140, 148, 0.3);
  transition: all 0.2s ease;
}

.currency-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 148, 0.25);
}

.coin-icon {
  font-size: var(--font-xl);
  animation: coin-bounce 2s ease-in-out infinite;
}

@keyframes coin-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-3px) rotate(-5deg); }
  75% { transform: translateY(-3px) rotate(5deg); }
}

.coin-amount {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  background: linear-gradient(135deg, #FF8C94, #FF6B7A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shop-title {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
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
  margin-bottom: var(--space-xl);
}

.category-list {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: var(--space-xs);
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.category-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.category-chip {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: #666;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  scroll-snap-align: start;
  box-shadow: var(--shadow-sm);
}

.category-chip:hover {
  border-color: rgba(255, 140, 148, 0.4);
  background: rgba(255, 140, 148, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(255, 140, 148, 0.2);
}

.category-chip.active {
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(255, 140, 148, 0.4);
  transform: translateY(-3px);
}

.chip-icon {
  font-size: var(--font-lg);
}

/* ========== 商品网格 ========== */
.items-section {
  margin-bottom: var(--space-xl);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-md);
}

.shop-item-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border-radius: var(--radius-xl);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  border: var(--glass-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.shop-item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-rainbow);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.shop-item-card:hover::before {
  opacity: 1;
}

.shop-item-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.shop-item-card.owned {
  opacity: 0.75;
  filter: grayscale(0.3);
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
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.4));
  border-radius: var(--radius-lg);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
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
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
}

.shop-item-card:hover .item-emoji {
  transform: scale(1.1) rotate(5deg);
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
  font-size: var(--font-md);
  font-weight: var(--font-bold);
  color: #333;
  margin: 0 0 var(--space-xs) 0;
  line-height: 1.3;
}

.item-desc {
  font-size: var(--font-sm);
  color: #888;
  margin: 0 0 var(--space-md) 0;
  line-height: 1.5;
  min-height: 36px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 购买区域 */
.item-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-top: auto;
}

.price-tag {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: linear-gradient(135deg, rgba(255, 140, 148, 0.15), rgba(255, 182, 193, 0.1));
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 140, 148, 0.2);
}

.price-icon {
  font-size: var(--font-md);
}

.price-value {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  background: linear-gradient(135deg, #FF8C94, #FF6B7A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.buy-btn {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, #FF8C94, #FFB6C1);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 3px 10px rgba(255, 140, 148, 0.35);
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 18px rgba(255, 140, 148, 0.5);
}

.buy-btn:active:not(:disabled) {
  transform: translateY(0) scale(1.02);
}

.buy-btn:disabled {
  background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
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
    padding: var(--space-md);
    padding-bottom: 100px;
  }

  .page-header {
    grid-template-columns: auto 1fr;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .header-spacer {
    display: none;
  }

  .shop-title {
    font-size: var(--font-lg);
    grid-column: 1 / -1;
    text-align: center;
    order: -1;
    margin-bottom: var(--space-sm);
  }

  .currency-card {
    padding: var(--space-xs) var(--space-sm);
  }

  .coin-icon {
    font-size: var(--font-lg);
  }

  .coin-amount {
    font-size: var(--font-md);
  }

  .category-list {
    gap: var(--space-xs);
    padding: var(--space-xs);
  }

  .category-chip {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-xs);
  }

  .chip-icon {
    font-size: var(--font-md);
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }

  .shop-item-card {
    padding: var(--space-sm);
    border-radius: var(--radius-lg);
  }

  .item-display {
    padding: var(--space-sm);
    margin-bottom: var(--space-sm);
    border-radius: var(--radius-md);
  }

  .item-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .item-emoji {
    font-size: 40px;
  }

  .item-name {
    font-size: var(--font-sm);
    margin-bottom: var(--space-xs);
  }

  .item-desc {
    font-size: var(--font-xs);
    margin-bottom: var(--space-sm);
    min-height: 30px;
    -webkit-line-clamp: 2;
  }

  .item-action {
    gap: var(--space-xs);
  }

  .price-tag {
    padding: 4px var(--space-xs);
  }

  .price-icon {
    font-size: var(--font-sm);
  }

  .price-value {
    font-size: var(--font-xs);
  }

  .buy-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-xs);
  }
}
</style>
