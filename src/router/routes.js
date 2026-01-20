export const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/HomeView.vue'),
    meta: {
      title: '我的小窝',
      keepAlive: true,
      showTab: true
    }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/Onboarding/OnboardingView.vue'),
    meta: {
      title: '欢迎来到狗窝',
      hideForLoggedIn: true
    }
  },
  {
    path: '/room',
    name: 'RoomDecorator',
    component: () => import('@/views/RoomDecorator/RoomDecoratorView.vue'),
    meta: {
      title: '布置小屋',
      showTab: false
    }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/Shop/ShopView.vue'),
    meta: {
      title: '汪汪市集',
      showTab: true
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/Tasks/TasksView.vue'),
    meta: {
      title: '光荣之爪',
      showTab: true
    }
  },
  {
    path: '/diary',
    name: 'Diary',
    component: () => import('@/views/Diary/DiaryView.vue'),
    meta: {
      title: '爪印日记',
      showTab: true
    }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/Community/CommunityView.vue'),
    meta: {
      title: '散步广场',
      showTab: true
    }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/Stats/StatsView.vue'),
    meta: {
      title: '数据洞察',
      showTab: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/ProfileView.vue'),
    meta: {
      title: '个人中心',
      showTab: true
    }
  }
]
