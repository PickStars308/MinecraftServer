# Minecraft Server Website

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Vue](https://img.shields.io/badge/Vue-3.5.25-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-8.0.0-orange.svg)

**A modern, beautiful Minecraft server website with installation wizard and admin panel**

[中文文档](README_CN.md) | [English Documentation](#-quick-start)

</div>

---

## ✨ Features

- 🎨 **Modern UI** - Glassmorphism design with light/dark theme switching
- 🔧 **One-Click Installation** - WordPress-like installation wizard, easy to set up
- 👤 **Admin System** - Secure account management and Session authentication
- 📊 **Server Status** - Real-time display of Minecraft server online players and status
- 🖼️ **Gallery** - Beautiful waterfall layout image display
- 📝 **Members** - Server members showcase page
- 📱 **Responsive** - Perfect adaptation for mobile and desktop

---

## 📦 Project Structure

```
MinecraftServerWebsite/
├── src/                      # Frontend source code
│   ├── api/                  # API calls
│   ├── components/           # Vue components
│   ├── views/                # Page views
│   ├── router/               # Router configuration
│   ├── stores/               # Pinia state management
│   └── main.ts               # Entry file
├── ServerBackend/            # Backend service
│   ├── config/               # Configuration files
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   └── server.js             # Server entry
├── public/                   # Public assets
├── .env.example              # Environment variables template
└── package.json              # Project dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.x (Recommended 20.x)
- npm or yarn

### Installation Steps

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/MinecraftServerWebsite.git
cd MinecraftServerWebsite
```

#### 2. Install dependencies

**Install frontend dependencies:**
```bash
npm install
```

**Install backend dependencies:**

```bash
cd ServerBackend
npm install
```

#### 3. Configure environment variables

**Frontend configuration (.env):**

```bash
cp .env.example .env
```

Edit `.env` file:

```bash
VITE_SITE_NAME=Stars Server
VITE_API_BASE_URL=http://localhost:3003
VITE_SERVER_ADDRESS=mc.xinstudio.top
```

**Backend configuration (ServerBackend/.env):**

```bash
cd ServerBackend
cp .env.example .env
```

Edit `ServerBackend/.env` file:

```bash
PORT=3003
MC_SERVER_IP=localhost
MC_SERVER_PORT=25565
ADMIN_SESSION_SECRET=your_secret_key
```

#### 4. Start services

**Start backend (Terminal 1):**

```bash
cd ServerBackend
npm start
```

**Start frontend (Terminal 2):**

```bash
npm run dev
```

Visit: http://localhost:5173

---

## 🛠️ Tech Stack

**Frontend:**

- Vue 3 + TypeScript
- Vite 8
- Vue Router
- Pinia
- Axios
- Socket.IO Client

**Backend:**

- Node.js + Express
- Socket.IO
- GameDig (Minecraft server query)
- Crypto-JS (Encryption)
- Multer (File upload)

---

## 📋 Deployment

### Production Build

#### 1. Build frontend

```bash
npm run build
```

The built files will be in the `dist/` directory.

#### 2. Deploy backend

```bash
cd ServerBackend
npm install --production
node server.js
```

Or use PM2:

```bash
npm install -g pm2
pm2 start server.js --name minecraft-website
pm2 save
pm2 startup
```

#### 3. Deploy frontend

Upload the contents of `dist/` folder to your web server.

---

## 🔧 Available Scripts

**Frontend:**

```bash
npm run dev      # Development mode
npm run build    # Production build
npm run preview  # Preview production build
```

**Backend:**

```bash
npm start        # Start server
node server.js   # Run directly
```

---

## 🌐 Pages

| Page          | Route          | Description                                  |
|---------------|----------------|----------------------------------------------|
| Home          | `/`            | Homepage with server status and introduction |
| Server Status | `/server`      | Real-time server status, player list, MOTD   |
| Gallery       | `/gallery`     | Image gallery with upload management         |
| Members       | `/members`     | Server member introduction                   |
| Experience    | `/experience`  | Server journey and highlights                |
| Admin Login   | `/admin/login` | Administrator login page                     |
| Admin Panel   | `/admin`       | Backend management dashboard                 |
| Installation  | `/install`     | One-click installation wizard                |
| Error         | `/error`       | 404 and other error pages                    |

---

## 🔐 Security Features

- ✅ Password double encryption (Caesar + AES)
- ✅ Session authentication
- ✅ CORS whitelist
- ✅ Input validation
- ✅ File upload restrictions

---

## 📝 API Endpoints / API 端点

### Backend API / 后端 API

```
Authentication / 认证:
  POST   /api/admin/login          - Admin login / 管理员登录
  POST   /api/admin/logout         - Admin logout / 管理员注销
  GET    /api/admin/check          - Check auth status / 检查认证状态

Installation / 安装:
  GET    /api/install/status       - Check installation status / 检查安装状态
  POST   /api/install              - Perform installation / 执行安装

Images / 图片:
  GET    /api/images               - Get all images / 获取所有图片
  POST   /api/images               - Upload image / 上传图片
  DELETE /api/images/:id           - Delete image / 删除图片
  PUT    /api/images/:id           - Update image info / 更新图片信息

Timeline / 时间线:
  GET    /api/timeline/images      - Get timeline images / 获取时间线图片
  POST   /api/timeline/images      - Upload timeline image / 上传时间线图片
  DELETE /api/timeline/images/:id  - Delete timeline image / 删除时间线图片

History / 历史:
  GET    /api/history              - Get history records / 获取历史记录
  POST   /api/history              - Add history record / 添加历史记录
  DELETE /api/history/:id          - Delete history record / 删除历史记录

Members / 成员:
  GET    /api/members              - Get all members / 获取所有成员
  POST   /api/members              - Add member / 添加成员
  DELETE /api/members/:id          - Delete member / 删除成员
  PUT    /api/members/:id          - Update member / 更新成员

Server Status / 服务器状态:
  GET    /api/status               - Get server status / 获取服务器状态
  WebSocket /socket.io/            - Real-time status updates / 实时状态更新
```

---

## 🎨 Customization / 个性化定制

### Theme Colors / 主题颜色

Edit `src/assets/styles/variables.scss` to customize colors:

编辑 `src/assets/styles/variables.scss` 来自定义颜色：

```scss
:root {
  --color-primary: #your-color;
  --color-secondary: #your-color;

}
```

### Logo & Branding / Logo 和品牌

1. Replace `public/logo.jpg` with your logo
2. Update environment variables in `.env`:
   - `VITE_SITE_NAME`
   - `VITE_SITE_AUTHOR`
   - `VITE_COPYRIGHT`

替换 `public/logo.jpg` 为你的 logo，并更新 `.env` 中的环境变量。

---

## 🤝 Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交 Pull Request。

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE)

---

## 👨‍💻 Author

**PickStars**

- GitHub: [@PickStars](https://github.com/PickStars308)
- Website: xc.xinstudio.top

---

<div align="center">

**Made with ❤️ by PickStars**

**⭐ If you like this project, please give it a star!**

</div>
