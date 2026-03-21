# Minecraft 服务器网站

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Vue](https://img.shields.io/badge/Vue-3.5.25-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-8.0.0-orange.svg)

**一个现代化、美观的 Minecraft 服务器网站，带有安装向导和管理后台**

[English Documentation](README.md) | [中文文档](#-快速开始)

</div>

---

## ✨ 项目特性

- 🎨 **现代化 UI** - 玻璃拟态设计，支持深浅主题切换
- 🔧 **一键安装** - 类似 WordPress 的安装向导，简单易懂
- 👤 **管理员系统** - 安全的账户管理和 Session 认证
- 📊 **服务器状态** - 实时显示 Minecraft 服务器在线人数和状态
- 🖼️ **图集展示** - 精美的瀑布流图片展示
- 📝 **成员介绍** - 服务器成员展示页面
- 📱 **响应式** - 完美适配移动端和桌面端

---

## 📦 项目结构

```
MinecraftServerWebsite/
├── src/                      # 前端源代码
│   ├── api/                  # API 调用
│   ├── components/           # Vue 组件
│   ├── views/                # 页面视图
│   ├── router/               # 路由配置
│   ├── stores/               # Pinia 状态管理
│   └── main.ts               # 入口文件
├── ServerBackend/            # 后端服务
│   ├── config/               # 配置文件
│   ├── routes/               # API 路由
│   ├── utils/                # 工具函数
│   └── server.js             # 服务端入口
├── public/                   # 公共资源
├── .env.example              # 环境变量示例
└── package.json              # 项目依赖
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 16.x (推荐 20.x)
- npm 或 yarn

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/MinecraftServerWebsite.git
cd MinecraftServerWebsite
```

#### 2. 安装依赖

**安装前端依赖:**

```bash
npm install
```

**安装后端依赖:**

```bash
cd ServerBackend
npm install
```

#### 3. 配置环境变量

**前端配置 (.env):**

```bash
cp .env.example .env
```

编辑 `.env` 文件:

```bash
VITE_SITE_NAME=Stars Server
VITE_API_BASE_URL=http://localhost:3003
VITE_SERVER_ADDRESS=mc.xinstudio.top
```

**后端配置 (ServerBackend/.env):**

```bash
cd ServerBackend
cp .env.example .env
```

编辑 `ServerBackend/.env` 文件:

```bash
PORT=3003
MC_SERVER_IP=localhost
MC_SERVER_PORT=25565
ADMIN_SESSION_SECRET=你的密钥
```

#### 4. 启动服务

**启动后端 (终端 1):**

```bash
cd ServerBackend
npm start
```

**启动前端 (终端 2):**

```bash
npm run dev
```

访问：http://localhost:5173

---

## 🛠️ 技术栈

**前端:**

- Vue 3 + TypeScript
- Vite 8
- Vue Router
- Pinia
- Axios
- Socket.IO Client

**后端:**

- Node.js + Express
- Socket.IO
- GameDig (Minecraft 服务器查询)
- Crypto-JS (加密)
- Multer (文件上传)

---

## 🌐 页面列表

| 页面    | 路由            | 说明       |
|-------|---------------|----------|
| 首页    | `/`           | 主页与服务器介绍 |
| 服务器状态 | `/server`     | 实时服务器状态  |
| 图集    | `/gallery`    | 图片展示     |
| 成员    | `/members`    | 成员介绍     |
| 经历    | `/experience` | 服务器历程    |
| 管理后台  | `/admin`      | 后台管理面板   |
| 安装向导  | `/install`    | 一键安装引导   |

---

## 📋 部署指南

### 传统部署

#### 1. 构建前端

```bash
npm run build
```

构建产物在 `dist/` 目录。

#### 2. 部署后端

```bash
cd ServerBackend
npm install --production
node server.js
```

或使用 PM2:

```bash
npm install -g pm2
pm2 start server.js --name minecraft-website
pm2 save
pm2 startup
```

#### 3. 部署前端

将 `dist/` 目录内容上传到 Web 服务器

### Docker 部署

#### 前置要求
- 已安装 Docker 和 Docker Compose

#### 1. 配置环境变量

**创建后端环境文件：**

```bash
cd ServerBackend
cp .env.example .env
```

编辑 `ServerBackend/.env` 文件，配置你的服务器信息：

```bash
PORT=3003
MC_SERVER_IP=localhost
MC_SERVER_PORT=25565
ADMIN_SESSION_SECRET=你的密钥
```

**创建根目录环境文件：**

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的网站信息：

```bash
# 前端配置
VITE_SITE_NAME=我的服务器
VITE_API_BASE_URL=http://localhost:8080/api

# Docker 配置
DOCKER_VITE_API_BASE_URL=http://localhost:8080/api
DOCKER_CORS_ORIGIN=http://localhost:8080
FRONTEND_PORT=8080
```

#### 2. 使用 Docker Compose 启动

```bash
docker-compose up -d --build
```

这将：
- 构建并启动后端服务（内部端口 3001）
- 构建并启动前端服务（默认端口 8080）
- 设置卷挂载以实现数据持久化

#### 3. 访问网站

访问：http://localhost:8080

#### 4. Docker 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `VITE_SITE_NAME` | 网站名称 | My Server |
| `VITE_API_BASE_URL` | API 基础 URL | http://localhost:8080/api |
| `DOCKER_VITE_API_BASE_URL` | Docker 内部 API URL | http://localhost:8080/api |
| `DOCKER_CORS_ORIGIN` | 后端 CORS 源 | http://localhost:8080 |
| `FRONTEND_PORT` | 前端端口 | 8080 |

#### 5. Docker 命令

- **启动服务：** `docker-compose up -d`
- **停止服务：** `docker-compose down`
- **重启服务：** `docker-compose restart`
- **查看日志：** `docker-compose logs -f`
- **重新构建：** `docker-compose up -d --build`

---

## 🔧 常用命令

**前端:**

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

**后端:**

```bash
npm start        # 启动服务
node server.js   # 直接运行
```

---

## 🔐 安全特性

- ✅ 密码双重加密 (凯撒 + AES)
- ✅ Session 认证
- ✅ CORS 白名单
- ✅ 输入验证
- ✅ 文件上传限制

---

## 📄 许可证

[MIT](LICENSE)

---

## 👨‍💻 作者

**PickStars**

- GitHub: [@PickStars](https://github.com/PickStars308)
- Website: xc.xinstudio.top

---

<div align="center">

**Made with ❤️ by PickStars**

**⭐ 如果喜欢请给个 Star!**

</div>
