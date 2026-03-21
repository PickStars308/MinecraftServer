<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {checkForUpdates, getCurrentVersion, getLatestVersion} from '@/utils/updateChecker'

const currentVersion = getCurrentVersion()
const latestVersion = ref(getLatestVersion())
const hasUpdate = ref(false)
const isChecking = ref(false)

const projectInfo = {
  name: 'Minecraft Server Website',
  description: '一个现代化的Minecraft服务器网站，包含音乐播放器、画廊、时间线等功能',
  version: currentVersion,
  developers: [
    {name: 'PickStars308', role: '主要开发者'}
  ],
  repository: 'https://github.com/PickStars308/MinecraftServer'
}

async function checkUpdate() {
  isChecking.value = true
  try {
    await checkForUpdates()
    latestVersion.value = getLatestVersion()
    hasUpdate.value = Boolean(latestVersion.value) && latestVersion.value !== currentVersion;
  } catch (error) {
    console.error('检查更新失败:', error)
  } finally {
    isChecking.value = false
  }
}

onMounted(() => {
  checkUpdate()
})

function handleUpdate() {
  window.open('https://github.com/PickStars308/MinecraftServerWebsite/releases/latest', '_blank')
}
</script>

<template>
  <section class="admin-about">
    <div class="admin-about-container">
      <div class="about-section glass">
        <h3 class="section-title">项目信息</h3>
        <div class="project-info">
          <div class="info-item">
            <span class="info-label">项目名称:</span>
            <span class="info-value">{{ projectInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目描述:</span>
            <span class="info-value">{{ projectInfo.description }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前版本:</span>
            <span class="info-value">{{ projectInfo.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">GitHub仓库:</span>
            <a :href="projectInfo.repository" class="info-link" target="_blank">{{ projectInfo.repository }}</a>
          </div>
        </div>
      </div>

      <div class="developers-section glass">
        <h3 class="section-title">开发团队</h3>
        <div class="developers-list">
          <div v-for="(developer, index) in projectInfo.developers" :key="index" class="developer-item">
            <span class="developer-name">{{ developer.name }}</span>
            <span class="developer-role">{{ developer.role }}</span>
          </div>
        </div>
      </div>

      <div class="update-section glass">
        <div class="section-header">
          <h3 class="section-title">检查更新</h3>
          <button :disabled="isChecking" class="check-btn" @click="checkUpdate">
            {{ isChecking ? '检查中...' : '检查更新' }}
          </button>
        </div>
        <div class="update-info">
          <div class="version">
            <div class="info-item">
              <span class="info-label">当前版本:</span>
              <span class="info-value">{{ currentVersion }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最新版本:</span>
              <span class="info-value">{{ latestVersion || '检查中...' }}</span>
            </div>
          </div>
          <div v-if="hasUpdate" class="update-notification" @click="handleUpdate">
            <span class="update-message">发现新版本 v{{ latestVersion }}</span>
            <div class="update-btn">></div>
          </div>
          <div v-else-if="latestVersion" class="update-notification up-to-date">
            <span class="update-icon">✅</span>
            <span class="update-message">当前版本已是最新</span>
          </div>
        </div>
      </div>
    </div>

    <div class="developers-section glass" style="display: none;">
      <h3 class="section-title">开发团队</h3>
      <div class="developers-list">
        <div v-for="(developer, index) in projectInfo.developers" :key="index" class="developer-item">
          <span class="developer-name">{{ developer.name }}</span>
          <span class="developer-role">{{ developer.role }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-about-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.glass {
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  padding: 24px;
  overflow: hidden;
}

.section-title {
  color: var(--color-text-black);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.check-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(251, 126, 187, 0.28);
  color: #a93f75;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(251, 126, 187, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.project-info,
.update-info {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .version {
    display: flex;
    flex-direction: row;
    gap: 4px;
    justify-content: space-around;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.85rem;
  color: var(--color-text-black);
  opacity: 0.7;
}

.info-value {
  font-size: 1rem;
  color: var(--color-text-black);
  font-weight: 600;
}

.info-link {
  font-size: 1rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
}

.developers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.developer-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.developer-name {
  font-size: 1rem;
  color: var(--color-text-black);
  font-weight: 700;
}

.developer-role {
  font-size: 0.85rem;
  color: var(--color-text-black);
  opacity: 0.7;
}

.update-notification {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  justify-content: space-between
}

.update-notification.up-to-date {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.update-icon {
  font-size: 1.2rem;
}


.update-message {
  font-size: 0.9rem;
  color: var(--color-text-black);
  font-weight: 600;
}


html[data-theme='dark'] .glass {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

html[data-theme='dark'] .section-title,
html[data-theme='dark'] .info-value,
html[data-theme='dark'] .developer-name,
html[data-theme='dark'] .update-message {
  color: #f1f5f9;
}

html[data-theme='dark'] .info-label,
html[data-theme='dark'] .developer-role {
  color: #94a3b8;
}

html[data-theme='dark'] .check-btn {
  background: rgba(251, 126, 187, 0.2);
  color: #f9a8d4;
}

html[data-theme='dark'] .check-btn:hover:not(:disabled) {
  background: rgba(251, 126, 187, 0.3);
}

html[data-theme='dark'] .update-notification {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
}

html[data-theme='dark'] .update-notification.up-to-date {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}


@media (max-width: 768px) {
  .admin-about-container {
    grid-template-columns: 1fr;
  }

  .glass {
    padding: 20px;
  }

  .section-title {
    font-size: 1.1rem;
  }
}
</style>
