<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {io, Socket} from 'socket.io-client'
import Typewriter from '@/components/Typewriter.vue'
import ServerInfoCard from '@/components/home/ServerInfoCard.vue'
import {addToast} from '@/components/toast'
import useSiteConfigStore from '@/stores/siteConfig'

const siteConfigStore = useSiteConfigStore()
const VITE_API_URL = import.meta.env.VITE_API_BASE_URL

let socket: Socket | null = null

interface Player {
  name: string
  uuid: string
}

const serverInfo = ref({
  onlinePlayers: 0,
  maxPlayers: 0,
  version: '-.-.-',
  motd: '',
  status: false,
  players: [] as Player[],
  icon: '',
  ping: 0,
  loading: true
})

const introTexts = computed(() => [
  '愿方块与你同在',
  '今日也是挖矿的好日子',
  '建造属于你的星辰大海',
  '服务器因你而更精彩',
  '每一次相遇都值得珍惜',
  '在方块世界里自由奔跑',
  '把平凡的日子过成冒险',
  '用心搭建，用爱守护',
  '探索不止，快乐不停',
  '存档里藏着我们的回忆'
])

const updateServerInfo = (data: any) => {

  const newPlayers = data.players?.map((p: any, index: number) => {

    const isInvalidUuid = !p.uuid ||
        p.uuid === '00000000-0000-0000-0000-000000000000' ||
        p.uuid === p.name

    return {
      name: p.name,
      uuid: isInvalidUuid ? `anon-${p.name}-${index}` : p.uuid
    }
  }) || []

  serverInfo.value = {
    onlinePlayers: data.players_online || 0,
    maxPlayers: data.players_max || 0,
    version: data.version || '-.-.-',
    motd: data.motd || '',
    status: data.online || false,
    players: newPlayers,
    icon: data.icon || '',
    ping: data.ping || 0,
    loading: false
  }

}

onMounted(() => {

  socket = io(VITE_API_URL, {
    transports: ["websocket"]
  })

  socket.on("connect", () => {

    socket?.emit("queryServer", {
      host: VITESERVERADDRESS
    })

  })

  socket.on("disconnect", () => {
  })

  socket.on("serverStatus", (data) => {
    updateServerInfo(data)
  })

  socket.on("connect_error", (err) => {
    addToast("" + err, "error")
  })

})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})

const handleRefresh = () => {

  if (!socket) return

  serverInfo.value.loading = true

  socket.emit("requestStatus")

}
</script>

<template>
  <div class="home-view">
    <h1 class="main-title">
      <Typewriter
          :after-text-delay="2000"
          :loop="true"
          :speed="100"
          :texts="introTexts"
      />
    </h1>

    <p class="subtitle">
      探索我们的服务器世界，与好友一起冒险
    </p>

    <ServerInfoCard
        :ping="serverInfo.ping"
        :server-info="{
        onlinePlayers: serverInfo.onlinePlayers,
        maxPlayers: serverInfo.maxPlayers,
        version: serverInfo.version,
        motd: serverInfo.motd,
        status: serverInfo.status ? 'online' : 'offline',
        serverAddress: siteConfigStore.config?.serverAddress || 'localhost',
        players: serverInfo.players.map((p) => ({
          uuid: p.uuid,
          name_raw: p.name,
          name_clean: p.name,
          name_html: p.name
        })),
        icon: serverInfo.icon,
        loading: serverInfo.loading
      }"
        @refresh="handleRefresh"
    />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: clamp(20px, 8vw, 40px) clamp(8px, 3vw, 16px);
  text-align: center;
  box-sizing: border-box;

  .main-title {
    font-size: clamp(1.8rem, 7vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text-black);
    overflow: hidden;
    margin-bottom: clamp(8px, 3vw, 16px);
    line-height: 1.2;
    word-break: break-word;
  }

  .subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: var(--color-text-black);
    margin-bottom: clamp(24px, 10vw, 48px);
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .home-view {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .main-title {
    font-weight: 600;
  }

  .subtitle {
    text-align: left;
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .home-view {
    padding-left: 10px;
    padding-right: 10px;
  }

  .main-title {
    font-size: 2rem;
  }
}
</style>
