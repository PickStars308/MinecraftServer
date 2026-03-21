<script lang="ts" setup>
import {ref, watch} from 'vue'

const props = defineProps<{
  show: boolean
  loginMessage: string
  isScanned: boolean
  qrCodeImage: string
  showLoginInfo?: boolean
}>()

const emit = defineEmits<{
  close: []
  refreshQrCode: []
  loginWithCookie: [cookie: string]
  switchToQrCode: []
  switchToCookie: []
}>()

const activeTab = ref('qrcode')
const cookieValue = ref('')
const cookieError = ref('')

watch(activeTab, (newTab, _oldTab) => {
  if (newTab === 'qrcode') {
    emit('switchToQrCode')
  } else if (newTab === 'cookie') {

    emit('switchToCookie')
  }
})

const handleCookieLogin = () => {
  if (!cookieValue.value.trim()) {
    cookieError.value = '请输入 Cookie'
    return
  }
  cookieError.value = ''
  emit('loginWithCookie', cookieValue.value.trim())
}
</script>

<template>
  <Transition name="fade">
    <div v-if="props.show" class="login-modal-overlay" @click="emit('close')">
      <div class="login-modal" @click.stop>
        <div class="login-content">
          <div class="login-head">
            <h3 class="login-title">网易云音乐登录</h3>
            <div class="login-tabs">
              <button
                  :class="{ active: activeTab === 'qrcode' }"
                  class="login-tab"
                  @click="activeTab = 'qrcode'"
              >
                二维码登录
              </button>
              <button
                  :class="{ active: activeTab === 'cookie' }"
                  class="login-tab"
                  @click="activeTab = 'cookie'"
              >
                Cookie 登录
              </button>
            </div>
          </div>

          <!-- 二维码登录 -->
          <div v-if="activeTab === 'qrcode'" class="login-panel">
            <div v-if="qrCodeImage" class="qr-content">
              <img :src="qrCodeImage" alt="网易云音乐登录二维码" class="qr-image"/>
              <p class="login-message">
                {{ isScanned ? '已扫码，请在网易云音乐 App 中确认登录。' : '请使用网易云音乐 App 扫码登录。' }}
              </p>
              <button class="qr-refresh-btn" type="button" @click="emit('refreshQrCode')">刷新二维码</button>
            </div>
            <div v-else class="maintenance-container">
              <div class="maintenance-icon">
                <svg fill="currentColor" height="64" viewBox="0 0 24 24" width="64">
                  <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                  />
                </svg>
              </div>
              <h3 class="maintenance-title">二维码未生成</h3>
              <p class="maintenance-text">点击下方按钮重新获取二维码。</p>
              <button class="qr-refresh-btn" type="button" @click="emit('refreshQrCode')">获取二维码</button>
            </div>
          </div>

          <!-- Cookie 登录 -->
          <div v-else-if="activeTab === 'cookie'" class="login-panel">
            <div class="cookie-input-container">
              <label class="cookie-label" for="cookie-input">请输入网易云音乐 Cookie</label>
              <textarea
                  id="cookie-input"
                  v-model="cookieValue"
                  class="cookie-input"
                  placeholder="粘贴网易云音乐的 Cookie 到这里"
                  rows="6"
              ></textarea>
              <p v-if="cookieError" class="cookie-error">{{ cookieError }}</p>
            </div>
            <button class="cookie-login-btn" type="button" @click="handleCookieLogin">
              登录
            </button>
          </div>

          <p v-if="loginMessage && showLoginInfo !== false" class="login-message footer-message">{{ loginMessage }}</p>
        </div>
      </div>

      <button class="login-close-btn" title="关闭" type="button" @click="emit('close')">
        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
          <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.login-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-bg-popup);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  flex-direction: column;
}

.login-modal {
  position: relative;
  width: min(80vw, 460px);
  overflow: auto;
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(251, 126, 187, 0.12), rgba(255, 255, 255, 0.04)),
  rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: var(--color-shadow-hover);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

.login-close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  margin-top: 24px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-black);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background: rgba(251, 126, 187, 0.14);
    border-color: rgba(251, 126, 187, 0.28);
  }
}

.login-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--color-text-black);
}

.login-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

.login-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.login-tab {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-black);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(251, 126, 187, 0.1);
    border-color: rgba(251, 126, 187, 0.28);
  }

  &.active {
    background: rgba(251, 126, 187, 0.14);
    border-color: rgba(251, 126, 187, 0.3);
    color: var(--color-text-black);
  }
}

.login-title,
.maintenance-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.login-subtitle {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-black);
}

.login-description,
.maintenance-text,
.login-message {
  margin: 0;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-text-black) 72%, transparent);
}

.qr-refresh-btn {
  min-height: 48px;
  padding: 12px 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-black);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(251, 126, 187, 0.1);
    border-color: rgba(251, 126, 187, 0.28);
  }
}

.qr-panel,
.maintenance-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 24px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  text-align: center;
  color: var(--color-text-black);
}

.qr-image {
  width: min(100%, 220px);
  aspect-ratio: 1;
  object-fit: contain;
  padding: 12px;
  border-radius: 18px;
  background: #ffffff;
}

.maintenance-icon {
  color: #fb7ebb;
}

.footer-message {
  text-align: center;
}

.login-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.cookie-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cookie-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-black);
}

.cookie-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-black);
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(251, 126, 187, 0.3);
  }

  &::placeholder {
    color: color-mix(in srgb, var(--color-text-black) 40%, transparent);
  }
}

.cookie-error {
  margin: 0;
  font-size: 0.8rem;
  color: #ef4444;
  text-align: left;
}

.cookie-login-btn {
  min-height: 48px;
  padding: 12px 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-black);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(251, 126, 187, 0.1);
    border-color: rgba(251, 126, 187, 0.28);
  }
}

html[data-theme='dark'] .login-modal {
  background: linear-gradient(180deg, rgba(251, 126, 187, 0.12), rgba(15, 23, 42, 0.08)),
  rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

html[data-theme='dark'] .login-close-btn,
html[data-theme='dark'] .qr-refresh-btn,
html[data-theme='dark'] .qr-panel,
html[data-theme='dark'] .maintenance-container {
  border-color: rgba(226, 232, 240, 0.16);
}

html[data-theme='dark'] .login-close-btn:hover,
html[data-theme='dark'] .qr-refresh-btn:hover {
  background: rgba(251, 126, 187, 0.14);
  border-color: rgba(251, 126, 187, 0.3);
}

@media (max-width: 640px) {
  .login-modal-overlay {
    padding: 12px;
    align-items: flex-end;
  }

  .login-modal {
    width: 100%;
    max-height: 88vh;
    padding: 24px 18px 18px;
    border-radius: 22px 22px 0 0;
  }
}
</style>
