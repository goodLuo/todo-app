# ✅ 待办清单 Todo App

一款轻量、高效的待办事项管理应用，支持打包为 Android APK。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Android](https://img.shields.io/badge/Android-8.0+-brightgreen)

## ✨ 功能特性

### 核心功能
- ✅ 待办事项增删改查
- ✅ 完成/未完成状态切换
- ✅ 分类管理（工作/学习/生活/自定义）
- ✅ 优先级设置（高/中/低）
- ✅ 截止时间和提醒时间
- ✅ 今日待办视图
- ✅ 搜索功能（标题/内容）
- ✅ 多种排序方式

### 便捷操作
- 👆 长按进入多选模式
- 👈 左滑删除待办
- 👉 右滑快速完成
- ⏱️ 快捷时间设置（可自定义）
- ↩️ 撤销删除（4秒内）

### 个性化
- 🌓 深色模式（跟随系统/手动切换）
- 🎨 分类自定义颜色
- 📤 数据导出为 JSON

### 原生体验
- 📱 震动反馈
- 🔔 本地通知提醒
- 💾 本地存储，无需联网
- ⚡ 启动快，体积小

## 📱 截图预览

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   ✅ 待办清单    │  │   📁 分类管理    │  │   ⚙️ 设置      │
│                 │  │                 │  │                 │
│  📅 今日待办    │  │  ● 工作  (3)    │  │  🌓 外观模式    │
│  ┌───────────┐  │  │  ● 学习  (2)    │  │  [系统][浅][深] │
│  │ 完成项目   │  │  │  ● 生活  (5)    │  │                 │
│  │ 🔴高 工作  │  │  │  + 新建分类     │  │  🔔 通知提醒    │
│  └───────────┘  │  │                 │  │  [ 已开启  ]    │
│                 │  │                 │  │                 │
│  📋 全部待办    │  │                 │  │  📊 数据统计    │
│  ┌───────────┐  │  │                 │  │  总计: 10      │
│  │ 买菜       │  │  │                 │  │  完成: 5       │
│  │ 🟢低 生活  │  │  │                 │  │                 │
│  └───────────┘  │  │                 │  │  📤 导出数据    │
│                 │  │                 │  │                 │
│  [首页][分类][完成][设置]              │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🚀 快速开始

### 下载 APK

在 [Releases](../../releases) 页面下载最新版本 APK。

### 自行构建

#### 方式一：GitHub Actions 云端打包（推荐）

1. Fork 本仓库
2. 进入 Actions 标签页
3. 运行 "Build Android APK" 工作流
4. 下载构建产物中的 APK

#### 方式二：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

详细打包说明请查看 [ANDROID_BUILD.md](./ANDROID_BUILD.md)

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS 4
- **图标**: Lucide React
- **移动端打包**: Capacitor
- **存储**: LocalStorage

## 📁 项目结构

```
├── src/
│   ├── components/      # React 组件
│   │   ├── TodoCard.tsx
│   │   ├── TodoForm.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── Settings.tsx
│   │   └── Snackbar.tsx
│   ├── hooks/           # 自定义 Hooks
│   │   └── useTodoStore.ts
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   │   ├── storage.ts
│   │   └── notifications.ts
│   ├── App.tsx          # 主组件
│   └── main.tsx         # 入口
├── public/              # 静态资源
├── .github/workflows/   # GitHub Actions
└── capacitor.config.ts  # Capacitor 配置
```

## 📋 路线图

### V1.0 ✅ 当前版本
- 基础待办管理
- 分类和优先级
- 时间提醒
- 深色模式

### V2.0 规划中
- [ ] 日历视图
- [ ] 重复任务
- [ ] 子任务
- [ ] 标签系统
- [ ] 数据导入

### V3.0 远期
- [ ] 桌面小组件
- [ ] Markdown 支持
- [ ] 语音输入
- [ ] 云同步（可选）

## 📄 开源协议

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
