<script lang="ts" setup>
import {computed, ref} from "vue"
import {addToast} from '@/components/toast/';

interface ServerPlayer {
  uuid?: string
  name_raw: string
  name_clean: string
  name_html?: string
}

interface ServerInfo {
  onlinePlayers: string | number
  maxPlayers: string | number
  version: string
  serverAddress: string
  loading: boolean
  motd?: string
  status: "online" | "offline"
  players?: ServerPlayer[]
  icon?: string
  ping?: number
}

const props = defineProps<{
  serverInfo: ServerInfo
  ping?: number
}>()
const emit = defineEmits<{
  (e: 'refresh'): void
}>()
const localLoading = ref(false)


const onlinePlayers = computed(() => props.serverInfo.onlinePlayers)
const maxPlayers = computed(() => props.serverInfo.maxPlayers)
const version = computed(() => props.serverInfo.version)
const serverAddress = computed(() => props.serverInfo.serverAddress)
const loading = computed(() => props.serverInfo.loading)
const motd = computed(() => props.serverInfo.motd || "")
const status = computed(() => props.serverInfo.status || "offline")
const players = computed(() => props.serverInfo.players || [])
const icon = computed(() => props.serverInfo.icon || "")
const ping = computed(() => props.ping ?? props.serverInfo.ping ?? 0)


const refreshData = () => {

  avatarErrorMap.value = {}
  emit('refresh')
}


const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(serverAddress.value)
    addToast("复制成功", 'success')
  } catch (err) {
    addToast("" + err, 'error')
  }
}
const avatarErrorMap = ref<Record<string, boolean>>({})

const isAnonymousPlayer = (player: ServerPlayer) => {

  return !!(player.name_clean && player.name_clean.toLowerCase().includes('anonymous'));

}

const getAvatar = (player: ServerPlayer) => {

  if (isAnonymousPlayer(player)) {
    return ""
  }

  return `https://crafthead.net/avatar/${player.name_clean}?scale=4&overlay=true`
}

const handleAvatarError = (player: ServerPlayer) => {
  if (player.uuid) {
    avatarErrorMap.value[player.uuid] = true
  }
}
</script>

<template>
  <div class="server-card">

    <div class="server-status-header">
      <div class="status-title">
        <div class="server-icon">
          <img v-if="icon" :src="icon" alt="服务器图标" class="icon-img"/>
          <div v-else class="default-icon">MC</div>
        </div>

        <div class="status-info">
          <h3>服务器实时状态</h3>
          <div :class="status" class="server-status-tag">
            {{ status === 'online' ? '在线' : '离线' }}
          </div>
        </div>
      </div>


      <button
          :disabled="localLoading || loading"
          class="refresh-btn"
          title="刷新服务器信息"
          @click="refreshData"
      >
        <svg
            v-if="localLoading || loading"
            class="loading-spinner"
            fill="none"
            height="20"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="20"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 12a4 4 0 1 1-8 0"></path>
        </svg>

        <svg
            v-else
            fill="none"
            height="20"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="20"
        >
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      </button>
    </div>

    <div class="server-address-section">
      <div class="address-label">服务器地址</div>

      <div class="server-address-container">
        <div class="server-address">
          <span class="address-text">{{ serverAddress }}</span>
        </div>

        <button class="copy-btn" @click="copyAddress">
          <svg fill="none" height="20" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20">
            <rect height="13" rx="2" width="13" x="9" y="9"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="motd-label">服务器介绍</div>
    <div v-if="motd" class="server-motd-section">
      <div class="motd-content">
        {{ motd }}
      </div>
    </div>


    <div class="server-stats">
      <div class="stat-item">
        <div class="stat-icon players-icon">
          <icon-people size="24" theme="outline"/>
        </div>

        <div class="stat-info">
          <div class="stat-value">
            {{ onlinePlayers }}/{{ maxPlayers }}
          </div>
          <div class="stat-label">
            在线玩家
          </div>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-item">
        <div class="stat-icon version-icon">
          <icon-server size="24" theme="outline"/>
        </div>

        <div class="stat-info">
          <div class="stat-value">{{ version }}</div>
          <div class="stat-label">服务器版本</div>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-item">
        <div class="stat-icon ping-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>

        <div class="stat-info">
          <div class="stat-value">{{ ping }}ms</div>
          <div class="stat-label">网络延迟</div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="status === 'online'" class="online-players-section">
    <div class="players-label">当前在线玩家</div>

    <div class="players-list">
      <div
          v-for="player in players"
          :key="player.uuid || player.name_clean"
          class="player-item"
      >
        <div class="player-avatar-wrapper">

          <img
              v-if="getAvatar(player) && !avatarErrorMap[player.uuid || player.name_clean]"
              :alt="player.name_clean"
              :src="getAvatar(player)"
              class="player-avatar player-face"
              @error="() => handleAvatarError(player)"
          />

          <div
              v-if="!getAvatar(player) || avatarErrorMap[player.uuid || player.name_clean]"
              class="player-avatar player-avatar-fallback"
          >
            {{ (player.name_clean || "未知").substring(0, 2).toUpperCase() }}
          </div>

        </div>

        <div class="player-name">
          {{ player.name_clean || "未知玩家" }}
        </div>

      </div>

      <div v-if="players.length === 0" class="no-players">
        暂无玩家在线
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

$primary-text: #1f2937;
$secondary-text: #6b7280;
$light-bg: rgba(255, 255, 255, 0.45);
$light-border: rgba(255, 255, 255, 0.3);
$accent-pink: #fb7ebb;
$accent-blue: #3b82f6;
$accent-green: #10b981;
$accent-red: #ef4444;
$accent-yellow: #f59e0b;
$shadow-base: 0 8px 32px rgba(0, 0, 0, 0.1);
$shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s ease;
$transition-fast: all 0.2s ease;

$dark-primary-text: #f8fafc;
$dark-secondary-text: #94a3b8;
$dark-bg: rgba(15, 23, 42, 0.5);
$dark-border: rgba(226, 232, 240, 0.18);
$dark-divider: rgba(255, 255, 255, 0.1);


@mixin dark-mode {
  html[data-theme="dark"] & {
    @content;
  }
}

@mixin responsive-mobile {
  @media (max-width: 768px) {
    @content;
  }
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}


@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}


.server-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px 36px;
  background: $light-bg;
  backdrop-filter: blur(10px);
  border-radius: 24px;
  width: min(100%, 820px);
  border: 1px solid $light-border;
  box-shadow: $shadow-base;
  transition: $transition-base;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-hover;
  }

  @include dark-mode {
    background: $dark-bg;
    border-color: $dark-border;
  }

  @include responsive-mobile {
    width: 95%;
    padding: 20px 16px;
    gap: 16px;
    border-radius: 16px;
  }


  .server-status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .status-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .server-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.8);
        @include flex-center;

        @include dark-mode {
          background: rgba(30, 41, 59, 0.8);
        }

        .icon-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .default-icon {
          font-size: 18px;
          font-weight: bold;
          color: $accent-blue;
        }


        @include responsive-mobile {
          display: none;
        }
      }

      .status-info {
        display: flex;
        align-items: center;
        gap: 12px;

        h3 {
          font-size: 1rem;
          font-weight: 600;
          color: $primary-text;

          @include dark-mode {
            color: $dark-primary-text;
          }
        }

        .server-status-tag {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;

          &.online {
            background: rgba($accent-green, 0.2);
            color: $accent-green;
          }

          &.offline {
            background: rgba($accent-red, 0.2);
            color: $accent-red;
          }
        }
      }
    }

    .refresh-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.6);
      color: $secondary-text;
      cursor: pointer;
      @include flex-center;
      transition: $transition-fast;

      &:hover:not(:disabled) {
        background: rgba($accent-blue, 0.1);
        color: $accent-blue;
        transform: scale(1.05);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .loading-spinner {
        animation: spin 1s linear infinite;
      }

      @include dark-mode {
        background: rgba(30, 41, 59, 0.6);
        color: $dark-secondary-text;
      }
    }
  }


  .server-address-section {
    text-align: center;

    .address-label {
      font-size: 0.875rem;
      color: $secondary-text;
      margin-bottom: 8px;
      font-weight: 500;

      @include dark-mode {
        color: $dark-secondary-text;
      }
    }

    .server-address {
      width: 100%;
      @include flex-center;
      gap: 16px;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      border: 2px solid rgba($accent-pink, 0.3);

      @include dark-mode {
        background: rgba(15, 23, 42, 0.6);
        border-color: rgba($accent-pink, 0.4);
      }

      @include responsive-mobile {
        width: 100%;
        padding: 12px;
        gap: 10px;
      }
    }

    .server-address-container {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .address-text {
        font-size: 1.5rem;
        font-weight: 700;
        color: $primary-text;
        font-family: 'Courier New', monospace;
        letter-spacing: 1px;

        @include dark-mode {
          color: $dark-primary-text;
        }

        @include responsive-mobile {
          font-size: 1rem;
          letter-spacing: 0;
          word-break: break-all;
        }
      }

      .copy-btn {
        margin: 10px;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        border: none;
        background: rgba($accent-pink, 0.2);
        color: $accent-pink;
        cursor: pointer;
        @include flex-center;
        transition: $transition-fast;

        &:hover {
          background: rgba($accent-pink, 0.3);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }

        @include responsive-mobile {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }
      }
    }
  }


  .server-motd-section {
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    @include dark-mode {
      background: rgba(30, 41, 59, 0.5);
      border-color: rgba(255, 255, 255, 0.05);
    }


    .motd-content {
      font-size: 1rem;
      color: $primary-text;
      line-height: 1.5;
      white-space: pre-line;

      @include dark-mode {
        color: $dark-primary-text;
      }
    }

  }

  .motd-label {
    font-size: 0.875rem;
    color: $secondary-text;
    font-weight: 500;

    @include dark-mode {
      color: $dark-secondary-text;
    }
  }

  .server-stats {
    @include flex-center;
    justify-content: space-around;
    gap: 16px;

    @include responsive-mobile {
      flex-direction: row;
      gap: 12px;
    }

    .stat-item {
      @include flex-center;
      gap: 12px;
      flex: 1;

      @include responsive-mobile {
        width: 100%;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        @include flex-center;
        flex-shrink: 0;

        &.players-icon {
          background: rgba($accent-blue, 0.2);
          color: $accent-blue;
        }

        &.version-icon {
          background: rgba($accent-green, 0.2);
          color: $accent-green;
        }

        &.ping-icon {
          background: rgba($accent-yellow, 0.2);
          color: $accent-yellow;
        }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: left;

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: $primary-text;
          line-height: 1;

          @include dark-mode {
            color: $dark-primary-text;
          }

          @include responsive-mobile {
            font-size: 1rem;
          }
        }

        .stat-label {
          font-size: 0.875rem;
          color: $secondary-text;
          margin-top: 4px;

          @include dark-mode {
            color: $dark-secondary-text;
          }
        }
      }
    }

    .stat-divider {
      width: 2px;
      height: 48px;
      background: rgba(0, 0, 0, 0.1);

      @include dark-mode {
        background: $dark-divider;
      }

      @include responsive-mobile {
        width: 2px;
        height: 48px;
      }
    }
  }
}

.online-players-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 48px;
  padding: 28px 36px;
  background: $light-bg;
  backdrop-filter: blur(10px);
  border-radius: 24px;
  width: min(100%, 820px);
  border: 1px solid $light-border;
  box-shadow: $shadow-base;
  transition: $transition-base;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-hover;
  }

  @include dark-mode {
    background: rgba(30, 41, 59, 0.5);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .players-label {
    font-size: 0.875rem;
    color: $secondary-text;
    margin-bottom: 12px;
    font-weight: 500;

    @include dark-mode {
      color: $dark-secondary-text;
    }
  }

  .players-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .player-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;

      @include dark-mode {
        background: rgba(47, 52, 63, 0.8);
      }

      .player-avatar-wrapper {
        position: relative;
        width: 32px;
        height: 32px;
      }

      .player-avatar {
        width: 32px;
        height: 32px;
        border-radius: 10%;
        background: rgba($accent-blue, 0.2);
        color: $accent-blue;
        font-size: 12px;
        font-weight: bold;
        @include flex-center;
      }

      .player-face {
        object-fit: cover;
      }

      .player-avatar-fallback {
        position: absolute;
        top: 0;
        left: 0;
      }

      .player-name {
        font-size: 0.875rem;
        color: $primary-text;

        @include dark-mode {
          color: $dark-primary-text;
        }
      }
    }

    .no-players {
      font-size: 0.875rem;
      color: var(--color-text-black);
      width: 100%;
      text-align: center;
      padding: 8px 0;
    }
  }


  @include responsive-mobile {
    width: 95%;
  }
}
</style>
