# 🐕 脱单了么

> 一个将「等待爱情」变成「投资自己」的单身生活追踪应用

[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite)
[![Pinia](https://img.shields.io/badge/Pinia-2.1-yellow?style=flat-square)](https://pinia.vuejs.org/)

## 📖 项目介绍

**【脱单了么】** 是一款可爱的单身生活追踪应用，采用独特的「狗狗小屋」隐喻。用户可以：

- 🐕 领养一只虚拟狗狗，与它共同成长
- 🏠 装扮自己的狗屋，记录生活的点点滴滴
- ✍️ 写下每日心情日记
- 📊 查看数据分析，了解自己的成长轨迹
- 🎮 完成日常任务，获取成就徽章
- 👥 在社区与其他用户交流互动
- 💝 多样化互动：摸头、喂食、玩耍、梳毛等
- 🎊 好感度系统：提升与狗狗的亲密度

**核心理念**：把「等待爱情」变成「投资自己」，用积极正面的方式度过单身生活。

## ✨ 功能特点

| 功能 | 描述 |
|------|------|
| 🐕 虚拟萌宠 | 可爱的狗狗伙伴，有心情和能量状态 |
| 💝 好感度系统 | 通过互动提升好感度，解锁更多技能 |
| 🎮 多样化互动 | 摸头、喂食、玩耍、梳毛等多种互动方式 |
| 🏠 房屋装饰 | 自由摆放家具，打造专属小屋 |
| 🛒 汪汪市集 | 购买家具、道具、装饰品 |
| 📝 爪印日记 | 记录每日心情和感悟 |
| 🏆 日常任务 | 完成挑战获得成就徽章 |
| 📈 数据洞察 | 可视化展示单身时长统计 |
| 👥 散步广场 | 与其他用户社交互动 |
| 🔔 Toast通知 | 现代化的通知系统替代原生alert |

## 🆕 最新更新 (v1.0)

### 视觉优化
- ✨ 全新2024版UI设计，更现代化的玻璃拟态风格
- 🎨 升级的配色系统和渐变背景
- 💫 增强的动画效果和过渡
- 🌟 稀有度物品发光特效

### 功能增强
- 💞 好感度等级系统
- 🎯 每日互动次数限制
- 🍖 多种喂食选项
- 🎭 狗狗饰品装备系统
- 📊 更丰富的状态反馈

### 代码优化
- 🛠️ 全新的Toast通知系统
- 📦 增强的工具函数库
- 🏗️ 更清晰的代码结构
- 📚 完善的组件库

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 5
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **日期处理**: Day.js

## 📁 项目结构

```
lian-ai-me/
├── src/
│   ├── components/      # 共享组件
│   │   ├── charts/      # 图表组件
│   │   ├── common/      # 通用组件
│   │   ├── community/   # 社区组件
│   │   ├── currency/    # 货币组件
│   │   ├── diary/       # 日记组件
│   │   ├── dog/         # 狗狗相关组件
│   │   ├── task/        # 任务组件
│   │   └── timer/       # 计时组件
│   ├── data/            # 静态数据
│   │   ├── shopItems.js     # 商品目录
│   │   ├── houseZones.js    # 房屋区域
│   │   ├── dogBreeds.js     # 狗狗品种
│   │   ├── moods.js         # 心情定义
│   │   ├── tasks.js         # 任务定义
│   │   └── achievements.js  # 成就定义
│   ├── router/
│   │   └── routes.js     # 路由配置
│   ├── stores/           # Pinia 状态管理
│   │   ├── user.js       # 用户信息
│   │   ├── dog.js        # 虚拟狗狗
│   │   ├── shop.js       # 商店系统
│   │   ├── room.js       # 房间装饰
│   │   ├── currency.js   # 货币系统
│   │   ├── timer.js      # 计时器
│   │   ├── tasks.js      # 任务系统
│   │   ├── diary.js      # 日记系统
│   │   ├── community.js  # 社区系统
│   │   └── achievements.js # 成就系统
│   ├── styles/           # 样式文件
│   │   ├── variables.css # CSS 变量
│   │   └── animations.css # 动画定义
│   ├── views/            # 页面组件
│   │   ├── Home/         # 首页
│   │   ├── Shop/         # 商店
│   │   ├── RoomDecorator/ # 房间装饰
│   │   ├── Tasks/        # 任务
│   │   ├── Diary/        # 日记
│   │   ├── Community/    # 社区
│   │   ├── Stats/        # 统计
│   │   └── Profile/      # 个人中心
│   ├── utils/            # 工具函数
│   │   └── helpers.js    # 辅助函数
│   └── App.vue           # 根组件
├── public/               # 静态资源
├── index.html            # HTML 入口
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置
```

## 🎨 设计理念

### 视觉风格 (2024升级版)

- **温暖粉系配色**：以 #FF8C94 为主色，营造温馨氛围
- **现代渐变背景**：柔和的三色渐变（粉色→蓝色→绿色）
- **玻璃拟态设计**：backdrop-filter: blur(20px) + 半透明背景
- **大圆角风格**：16-24px 圆角，更具亲和力
- **流畅动画系统**：弹性缓动 cubic-bezier(0.34, 1.56, 0.64, 1)
- **稀有度发光效果**：传说物品带脉冲光晕动画

### 交互设计

- **狗狗互动面板**：点击狗狗打开互动菜单
- **拖拽装饰**：直观的家具拖放体验
- **Toast通知**：优雅的操作反馈
- **响应式布局**：完美适配移动端
- **触觉反馈**：悬停、点击动画效果

## 📦 主要依赖

```json
{
  "vue": "^3.4.0",
  "vue-router": "^4.2.5",
  "pinia": "^2.1.7",
  "dayjs": "^1.11.10"
}
```

## 🤝 贡献指南

欢迎贡献代码或提出建议！请随时提交 Issue 或 Pull Request。

## 📄 许可证

本项目仅供个人学习使用。

---

<p align="center">🐕 愿你的单身生活同样精彩 💖</p>
