# Minecraft 服务器网站

一个基于 Vue 3 + TypeScript + Vite 的现代化 Minecraft 服务器网站，带有完整的安装引导和管理后台。

## ✨ 特性

- 🎨 **现代化 UI** - 采用玻璃拟态设计，支持深浅主题切换
- 🔧 **一键安装** - 类似 WordPress 的安装向导，简单易懂
- 👤 **管理员系统** - 安全的账户管理和 Session 认证
- 📊 **服务器状态** - 实时显示 Minecraft 服务器在线人数和状态
- 🖼️ **图集展示** - 精美的瀑布流图片展示
- 📝 **成员介绍** - 服务器成员展示页面
- 📱 **响应式** - 完美适配移动端和桌面端

## 🚀 快速开始

### 方法一：一键安装

```bash
# 1. 安装依赖
npm install

# 2. 启动后端服务
cd Server/ServerBackend
npm install
npm start

# 3. 启动前端服务（新终端）
cd ../..
npm install
npm run dev
```

## 📁 项目结构

```
.
├── src/                      # 前端源代码
│   ├── api/                  # API 调用
│   │   └── installApi.ts    # 安装相关 API
│   ├── components/           # 组件
│   ├── views/                # 页面视图
│   │   └── InstallView.vue  # 安装向导页面
│   ├── router/               # 路由配置
│   └── main.ts               # 入口文件
├── Server/
│   └── ServerBackend/        # 后端服务
│       ├── config/           # 配置文件
│       │   └── installConfig.json  # 安装配置
│       ├── routes/           # 路由
│       │   └── installRoutes.js    # 安装路由
│       ├── utils/            # 工具函数
│       │   └── installUtils.js     # 安装工具
│       └── server.js         # 服务端入口
├── .env.example              # 环境变量示例
├── INSTALL_GUIDE.md          # 详细安装文档
└── test-install.cjs          # 安装功能检查脚本
```

## 🛠️ 技术栈

**前端：**

- Vue 3 (Composition API)
- TypeScript
- Vite 5
- Vue Router
- Pinia (状态管理)
- Axios (HTTP 客户端)
- SCSS (样式)

**后端：**

- Node.js
- Express
- Crypto (密码加密)
- Cookie/Session 管理
