<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {io, Socket} from 'socket.io-client'
import {addToast} from '@/components/toast'
import useSiteConfigStore from '@/stores/siteConfig'

const siteConfigStore = useSiteConfigStore()
const VITE_API_URL = import.meta.env.VITE_API_BASE_URL

let socket: Socket | null = null

const serverInfo = ref({
  onlinePlayers: 0,
  maxPlayers: 0,
  version: '',
  motd: '',
  ping: 0,
  todayMax: 0,
  todayMin: 0,
  todayAvg: 0,
  historyMax: 0,
  loading: true
})

// 从 store 获取服务器创建日期
const serverCreationDate = computed(() => {
  const dateStr = siteConfigStore.config?.serverCreationDate || new Date().toISOString().split('T')[0]
  return new Date(dateStr)
})

const uptime = computed(() => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - serverCreationDate.value.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const updateServerInfo = (data: any) => {

  serverInfo.value = {
    onlinePlayers: data.players_online || 0,
    maxPlayers: data.players_max || 0,
    version: data.version || '',
    motd: data.motd || '',
    ping: data.ping || 0,


    todayMax: data.todayMax || 0,
    todayMin: data.todayMin || 0,
    todayAvg: data.todayAvg || 0,
    historyMax: data.historyMax || 0,

    loading: false
  }

}

onMounted(() => {
  // 等待配置加载完成
  if (!siteConfigStore.config) {
    siteConfigStore.loadConfig()
  }

  socket = io(VITE_API_URL, {
    transports: ["websocket"]
  })

  socket.on("connect", () => {
    // 使用 store 中的服务器地址
    const serverAddress = siteConfigStore.config?.serverAddress || 'localhost'
    socket?.emit("queryServer", {
      host: serverAddress
    })
  })

  socket.on("serverStatus", (data) => {

    updateServerInfo(data)

  })

  socket.on("connect_error", (err) => {
    addToast(String(err), "error")
  })

})

onUnmounted(() => {

  if (socket) {
    socket.disconnect()
  }

})
</script>
<template>
  <section class="kpi-grid">
    <article class="kpi-card glass">
      <p class="kpi-label">在线玩家</p>
      <p class="kpi-value">{{ serverInfo.loading ? '加载中...' : serverInfo.onlinePlayers }}</p>
      <p class="kpi-sub">最高 {{ serverInfo.maxPlayers }} 人</p>
    </article>
    <article class="kpi-card glass">
      <p class="kpi-label">游戏版本</p>
      <p class="kpi-value">{{ serverInfo.loading ? '加载中...' : (serverInfo.version || '未知') }}</p>
    </article>
    <article class="kpi-card glass">
      <p class="kpi-label">网络延迟</p>
      <p class="kpi-value">{{ serverInfo.loading ? '加载中...' : `${serverInfo.ping}ms` }}</p>
    </article>
    <article class="kpi-card glass">
      <p class="kpi-label">今日最高在线</p>
      <p class="kpi-value">{{ serverInfo.loading ? '加载中...' : serverInfo.todayMax }}</p>
    </article>
    <article class="kpi-card glass">
      <p class="kpi-label">今日最低在线</p>
      <p class="kpi-value">{{ serverInfo.loading ? '加载中...' : serverInfo.todayMin }}</p>
    </article>
    <article class="kpi-card glass">
      <p class="kpi-label">今日平均在线</p>
      <p class="kpi-value">{{ serverInfo.loading ? '加载中...' : serverInfo.todayAvg }}</p>
    </article>
    <article class="kpi-card glass">
      <p class="kpi-label">历史最高在线</p>
      <p class="kpi-value">{{ serverInfo.loading ? '加载中...' : serverInfo.historyMax }}</p>
    </article>
    <article class="kpi-card glass">
      <p class="kpi-label">服务器运行天数</p>
      <p class="kpi-value">{{ uptime }}天</p>
    </article>
  </section>

  <section class="content-grid">
    <article class="panel glass">
      <div class="panel-head">
        <h3>管理面板</h3>
      </div>
      <p class="empty">这里显示主面板数据概览，后续可以继续补充图表与统计。</p>
    </article>

    <article class="panel glass">
      <div class="panel-head">
        <h3>快速操作</h3>
      </div>
      <p class="empty">后续功能模块会逐步添加到这里。</p>
    </article>
  </section>
</template>

<style lang="scss" scoped>
.glass {
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.kpi-card {
  padding: 20px 24px;
  text-align: center;
}

.kpi-label {
  color: var(--color-text-black);
  opacity: 0.7;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.kpi-value {
  color: var(--color-text-black);
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.kpi-sub {
  font-size: 0.875rem;
  color: var(--color-text-black);
  opacity: 0.6;
  margin-top: 4px;
}

.kpi-hint {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-black);
}

.kpi-hint.positive {
  color: #10b981;
}

.kpi-hint.negative {
  color: #ef4444;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  min-height: 420px;
}

.panel {
  padding: 24px;
}

.panel-head h3 {
  color: var(--color-text-black);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.empty {
  color: var(--color-text-black);
  opacity: 0.6;
  text-align: center;
  padding: 40px 0;
  font-size: 1rem;
}

html[data-theme='dark'] .glass {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
}

html[data-theme='dark'] .kpi-label,
html[data-theme='dark'] .empty {
  color: #94a3b8;
}

html[data-theme='dark'] .kpi-value,
html[data-theme='dark'] .panel-head h3,
html[data-theme='dark'] .kpi-hint {
  color: #f1f5f9;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

html[data-theme='dark'] .kpi-sub {
  color: #94a3b8;
}
</style>
