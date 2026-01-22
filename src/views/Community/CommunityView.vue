<template>
  <div class="community-view">
    <div class="community-header">
      <h1 class="community-title">🌳 散步广场</h1>
      <button @click="showCreatePost = true" class="create-post-btn">
        <span>+ 发帖</span>
      </button>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-feed">
      <div
        v-for="post in communityStore.feedPosts"
        :key="post.id"
        class="post-card"
      >
        <div class="post-header">
          <span class="post-author">{{ post.author }}</span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
        <div class="post-content">
          <div class="post-mood">{{ getMoodIcon(post.mood) }}</div>
          <p class="post-text">{{ post.content }}</p>
        </div>
        <div class="post-actions">
          <button
            @click="toggleLike(post.id)"
            class="action-btn"
            :class="{ liked: isLiked(post.id) }"
          >
            <span>🦴 {{ getLikeCount(post.id) }}</span>
          </button>
          <button class="action-btn">
            <span>💬 {{ post.comments }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 发帖弹窗 -->
    <div v-if="showCreatePost" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">发布到广场</h2>

        <div class="mood-selector">
          <button
            v-for="mood in MOODS"
            :key="mood.id"
            @click="postMood = mood.id"
            class="mood-btn"
            :class="{ active: postMood === mood.id }"
          >
            <span class="mood-icon">{{ mood.icon }}</span>
          </button>
        </div>

        <textarea
          v-model="postContent"
          class="post-textarea"
          placeholder="分享你的心情..."
          rows="6"
        ></textarea>

        <div class="modal-actions">
          <button @click="closeModal" class="cancel-btn">取消</button>
          <button @click="createPost" class="publish-btn">发布</button>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="tab-bar-wrapper">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '@/views/Home/components/TabBar.vue'
import { useCommunityStore } from '@/stores/community'
import { MOODS } from '@/data/moods'
import { useAchievementStore } from '@/stores/achievements'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 启用相对时间插件
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const communityStore = useCommunityStore()
const achievementStore = useAchievementStore()

const showCreatePost = ref(false)
const postMood = ref('happy')
const postContent = ref('')

const getMoodIcon = (moodId) => {
  const mood = MOODS.find(m => m.id === moodId)
  return mood?.icon || '😊'
}

const formatTime = (date) => {
  return dayjs(date).fromNow()
}

const isLiked = (postId) => {
  return communityStore.isPostLiked(postId)
}

const getLikeCount = (postId) => {
  return communityStore.likeCount(postId)
}

const toggleLike = async (postId) => {
  await communityStore.likePost(postId)
}

const closeModal = () => {
  showCreatePost.value = false
  postMood.value = 'happy'
  postContent.value = ''
}

const createPost = async () => {
  if (!postContent.value.trim()) {
    if (window.$toast) {
      window.$toast.warning('请输入内容', { title: '⚠️ 提示' })
    }
    return
  }

  try {
    await communityStore.createPost({
      content: postContent.value,
      mood: postMood.value
    })

    if (window.$toast) {
      window.$toast.success('发布成功！', {
        title: '✅ 发布成功',
        icon: '🌳'
      })
    }
    closeModal()

    // 检查成就
    await achievementStore.checkAllAchievements()
  } catch (error) {
    if (window.$toast) {
      window.$toast.error('发布失败：' + error.message, {
        title: '❌ 发布失败'
      })
    }
  }
}

onMounted(async () => {
  await communityStore.initCommunity()
})
</script>

<style scoped>
.community-view {
  min-height: 100vh;
  padding: var(--space-lg);
  padding-bottom: 100px;
  background: var(--color-bg-primary);
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.community-title {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
}

.create-post-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
}

/* 帖子列表 */
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.post-card {
  background: var(--color-bg-card);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.post-author {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

.post-time {
  font-size: var(--font-xs);
  color: var(--color-text-light);
}

.post-content {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.post-mood {
  font-size: var(--font-2xl);
}

.post-text {
  flex: 1;
  font-size: var(--font-md);
  line-height: 1.6;
}

.post-actions {
  display: flex;
  gap: var(--space-md);
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--space-sm);
}

.action-btn {
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.action-btn:hover {
  color: var(--color-primary);
}

.action-btn.liked {
  color: var(--color-primary);
}

/* 弹窗样式同日记页面 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-md);
}

.modal-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  max-width: 500px;
  width: 100%;
}

.modal-title {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-lg);
}

.mood-selector {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  overflow-x: auto;
}

.mood-btn {
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.mood-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.mood-icon {
  font-size: var(--font-2xl);
}

.post-textarea {
  width: 100%;
  padding: var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  font-family: inherit;
  resize: vertical;
  margin-bottom: var(--space-lg);
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
}

.cancel-btn,
.publish-btn {
  flex: 1;
  padding: var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
}

.cancel-btn {
  background: var(--color-bg-secondary);
}

.publish-btn {
  background: var(--color-primary);
  color: white;
}

/* 固定底部导航栏 */
.tab-bar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
}
</style>
