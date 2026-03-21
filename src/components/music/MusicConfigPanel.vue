<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {updateSiteConfig} from '@/api/installApi'
import {generateAuthToken} from '@/utils/cryptoUtils'
import {addToast} from '@/components/toast'
import useSiteConfigStore from '@/stores/siteConfig'

const props = defineProps<{
  nickname: string
  avatarUrl: string
  isLoggedIn: boolean
}>()

const emit = defineEmits<{
  saved: [playlistId: string]
  logout: []
}>()

const siteConfigStore = useSiteConfigStore()
const playlistId = ref('')
const saving = ref(false)

onMounted(async () => {
  if (!siteConfigStore.config) {
    await siteConfigStore.loadConfig()
  }

  playlistId.value = String(siteConfigStore.config?.musicPlaylistId || '').trim()
})

watch(
    () => siteConfigStore.config?.musicPlaylistId,
    (value) => {
      playlistId.value = String(value || '').trim()
    },
)

async function handleSave() {
  if (!siteConfigStore.config) {
    addToast('站点配置尚未加载完成', 'error')
    return
  }

  saving.value = true

  try {
    const token = generateAuthToken()
    const nextConfig = {
      ...siteConfigStore.config,
      musicPlaylistId: playlistId.value.trim(),
    }

    const result = await updateSiteConfig(nextConfig, token)

    if (!result.success) {
      addToast(result.message || '歌单配置保存失败', 'error')
      return
    }

    siteConfigStore.updateConfig({
      musicPlaylistId: nextConfig.musicPlaylistId,
    })
    addToast('歌单配置保存成功', 'success')
    emit('saved', nextConfig.musicPlaylistId)
  } catch (error: any) {
    console.error('保存歌单配置失败:', error)
    addToast(error.message || '歌单配置保存失败', 'error')
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  emit('logout')
}
</script>

<template>
  <div class="music-config-panel">
    <div class="config-card">
      <div class="config-head">
        <h4 class="config-title">播放器配置</h4>
        <p class="config-description">这里配置播放器默认解析的网易云歌单 ID，保存后会直接从后端配置读取。</p>
      </div>

      <div class="account-card">
        <img v-if="avatarUrl" :src="avatarUrl" alt="用户头像" class="account-avatar"/>
        <div v-else class="account-avatar fallback">
          {{ nickname ? nickname.slice(0, 1).toUpperCase() : 'N' }}
        </div>

        <div class="account-meta">
          <p class="account-label">当前网易云账号</p>
          <p class="account-name">{{ isLoggedIn ? (nickname || '已登录用户') : '未登录' }}</p>
        </div>

        <button class="logout-btn" type="button" @click="handleLogout">退出登录</button>
      </div>

      <label class="field-label" for="musicPlaylistId">网易云歌单 ID</label>
      <input
          id="musicPlaylistId"
          v-model="playlistId"
          class="field-input"
          placeholder="例如：123456789"
          type="text"
      />
      <p class="field-hint">支持直接填写歌单数字 ID。修改后播放器会重新加载歌单。</p>

      <div class="actions">
        <button :disabled="saving" class="save-btn" type="button" @click="handleSave">
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.music-config-panel {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.config-card {
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px;
  //background: rgba(255, 255, 255, 0.14);
  //border: 1px solid rgba(255, 255, 255, 0.22);
  //border-radius: 24px;
  //backdrop-filter: blur(20px) saturate(180%);
  //-webkit-backdrop-filter: blur(20px) saturate(180%);
  //box-shadow: var(--color-shadow-hover);
}

.config-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.config-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text-black);
}

.config-description,
.field-hint,
.account-label {
  margin: 0;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-text-black) 72%, transparent);
}

.account-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  margin-bottom: 6px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.account-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.account-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fb7ebb, #ff98c6);
  box-shadow: 0 10px 24px rgba(251, 126, 187, 0.24);
}

.account-meta {
  min-width: 0;
  flex: 1;
}

.account-name {
  margin: 4px 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-black);
  word-break: break-all;
}

.field-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-black);
}

.field-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.18);
  color: var(--color-text-black);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:focus {
    border-color: rgba(251, 126, 187, 0.88);
    box-shadow: 0 0 0 4px rgba(251, 126, 187, 0.16);
    background: rgba(255, 255, 255, 0.22);
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.save-btn,
.logout-btn {
  min-height: 46px;
  padding: 12px 24px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, background 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.save-btn {
  min-width: 132px;
  border: none;
  color: #ffffff;
  background: linear-gradient(135deg, #fb7ebb, #ff98c6);
  box-shadow: 0 14px 28px rgba(251, 126, 187, 0.22);

  &:hover:not(:disabled) {
    box-shadow: 0 18px 30px rgba(251, 126, 187, 0.28);
  }
}

.logout-btn {
  flex-shrink: 0;
  border: 1px solid rgba(239, 68, 68, 0.24);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);

  &:hover {
    background: rgba(239, 68, 68, 0.14);
    box-shadow: 0 10px 20px rgba(239, 68, 68, 0.14);
  }
}

html[data-theme='dark'] .config-card {
  //background: rgba(15, 23, 42, 0.62);
  //border-color: rgba(226, 232, 240, 0.14);
}

html[data-theme='dark'] .field-input,
html[data-theme='dark'] .account-card {
  background: rgba(2, 6, 23, 0.42);
  border-color: rgba(226, 232, 240, 0.18);
  color: #e2e8f0;
}

html[data-theme='dark'] .account-name {
  color: #f1f5f9;
}

html[data-theme='dark'] .logout-btn {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.24);
  background: rgba(127, 29, 29, 0.18);
}

@media (max-width: 768px) {
  .music-config-panel {
    padding: 20px 16px 24px;
  }

  .config-card {
    padding: 22px 18px;
  }

  .account-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .logout-btn,
  .save-btn {
    width: 100%;
  }

  .actions {
    justify-content: stretch;
  }
}
</style>
