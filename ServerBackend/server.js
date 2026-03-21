const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})


const configUtils = require('./utils/configUtils');
configUtils.initConfig();


const installUtils = require('./utils/installUtils');
installUtils.initConfigFiles();

const express = require('express');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const {GameDig} = require('gamedig');
const routes = require('./routes');

const app = express();


const corsOptions = {
    origin: function (origin, callback) {

        if (!origin) return callback(null, true);

        const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', "Cookies"],
    credentials: true,
    optionsSuccessStatus: 200
};


app.use(cors(corsOptions));

const server = http.createServer(app)


const io = new Server(server, {
    cors: corsOptions
})

const QUERY_INTERVAL = parseInt(process.env.QUERY_INTERVAL) || 10000

let lastStats = {online: false}
let isQuerying = false

function getServerTarget() {
    const savedConfig = configUtils.getConfig?.() || {}
    const configuredAddress = typeof savedConfig.serverAddress === 'string'
        ? savedConfig.serverAddress.trim()
        : ''

    const fallbackHost = process.env.MC_SERVER_IP || "localhost"
    const fallbackPort = parseInt(process.env.MC_SERVER_PORT, 10) || 25565

    if (!configuredAddress) {
        return {
            host: fallbackHost,
            port: fallbackPort
        }
    }

    const ipv6Match = configuredAddress.match(/^\[([^\]]+)\](?::(\d+))?$/)
    if (ipv6Match) {
        return {
            host: ipv6Match[1],
            port: parseInt(ipv6Match[2], 10) || fallbackPort
        }
    }

    const hostPortMatch = configuredAddress.match(/^([^:]+):(\d+)$/)
    if (hostPortMatch) {
        return {
            host: hostPortMatch[1],
            port: parseInt(hostPortMatch[2], 10) || fallbackPort
        }
    }

    return {
        host: configuredAddress,
        port: fallbackPort
    }
}

function getServerIcon(state) {
    return (
        state?.raw?.favicon ||
        state?.raw?.vanilla?.raw?.favicon ||
        ''
    )
}

async function queryServer() {
    if (isQuerying) {
        console.log("查询正在进行中，跳过本次查询")
        return
    }

    isQuerying = true

    try {
        const {host, port} = getServerTarget()

        const state = await GameDig.query({
            type: "minecraft",
            host,
            port
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
            motd: state.raw?.description,
            serverAddress: `${host}`,
            icon: getServerIcon(state)
        }

        lastStats = stats

        io.emit("serverStatus", stats)

        console.log("📤 状态推送成功，在线玩家:", stats.players_online)

    } catch (err) {
        lastStats = {online: false, players_online: 0, players: [], icon: ''}
        io.emit("serverStatus", lastStats)
        console.log("❌ 服务器离线:", err.message)

    } finally {
        isQuerying = false
    }
}


io.on("connection", (socket) => {
    console.log("客户端连接")
    socket.emit("serverStatus", lastStats)
})


setInterval(queryServer, QUERY_INTERVAL)
queryServer()


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
