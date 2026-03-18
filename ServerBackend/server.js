const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})

// 初始化配置文件（如果不存在）
const configUtils = require('./utils/configUtils');
configUtils.initConfig();

const express = require('express');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const {GameDig} = require('gamedig');
const routes = require('./routes');

const app = express();

// CORS 配置 - 支持多个来源
let corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(origin => origin.trim());

const corsOptions = {
    origin: function (origin, callback) {
        // 允许没有 origin 的请求（如 Postman、curl 等非浏览器请求）
        if (!origin) return callback(null, true);

        // 检查是否在允许的白名单中
        if (corsOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const server = http.createServer(app)

// Socket.IO 配置
const io = new Server(server, {
    cors: corsOptions
})

// Minecraft 服务器状态查询配置
const SERVER_IP = process.env.MC_SERVER_IP || "localhost"
const SERVER_PORT = parseInt(process.env.MC_SERVER_PORT) || 25565
const QUERY_INTERVAL = parseInt(process.env.QUERY_INTERVAL) || 10000

let lastStats = {online: false}
let isQuerying = false

async function queryServer() {
    if (isQuerying) {
        console.log("查询正在进行中，跳过本次查询")
        return
    }

    isQuerying = true

    try {
        const state = await GameDig.query({
            type: "minecraft",
            host: SERVER_IP,
            port: SERVER_PORT
        })

        const allPlayers = state.players.map((p, index) => {
            let uuid = p.raw?.id || p.id || p.uuid

            if (!uuid || uuid === '00000000-0000-0000-0000-000000000000' || uuid === p.name) {
                uuid = `anon-${p.name}-${index}`
            }

            return {
                name: p.name,
                uuid: uuid
            }
        })

        console.log("✅ 所有玩家:")
        console.log("  - 玩家数量:", allPlayers.length)
        console.log("  - 玩家列表:", allPlayers.map(p => p.name))

        const stats = {
            online: true,
            hostname: state.name,
            version:
                state.raw?.version?.name ||
                state.version ||
                state.raw?.vanilla?.raw?.version?.name ||
                "Unknown",

            players_online: allPlayers.length,
            players_max: state.maxplayers,
            players: allPlayers,
            ping: state.ping,
            motd: state.raw?.description
        }

        lastStats = stats

        io.emit("serverStatus", stats)

        console.log("📤 状态推送成功，在线玩家:", stats.players_online)

    } catch (err) {
        lastStats = {online: false, players_online: 0, players: []}
        io.emit("serverStatus", lastStats)
        console.log("❌ 服务器离线:", err.message)

    } finally {
        isQuerying = false
    }
}

// Socket.IO 连接处理
io.on("connection", (socket) => {
    console.log("客户端连接")
    socket.emit("serverStatus", lastStats)
})

// 定时查询服务器状态
setInterval(queryServer, QUERY_INTERVAL)
queryServer()

// Minecraft 状态 API 端点
app.get("/api/status", (req, res) => {
    res.json(lastStats)
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', routes);

server.listen(process.env.PORT, () => {
    console.log("🚀 服务器已启动");
    console.log("   后台服务地址：http://localhost:" + process.env.PORT);
    console.log("   状态查询地址：http://localhost:" + process.env.PORT + "/api/status");
    console.log("   WebSocket 服务已启用");
});
