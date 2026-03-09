<template>
  <Teleport to="body">
    <div v-if="visible" class="glass-dialog-overlay" @click.self="handleClose">
      <div class="glass-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">发现新版本</h3>
          <button v-if="showClose" aria-label="关闭" class="dialog-close" @click="handleClose">
            <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                 stroke-width="2"
                 viewBox="0 0 24 24" width="20">
              <line x1="18" x2="6" y1="6" y2="18"></line>
              <line x1="6" x2="18" y1="6" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="dialog-content">
          <p class="update-message">当前版本: {{ currentVersion }}，最新版本: {{ latestVersion }}</p>
          <p class="update-description">点击更新按钮刷新页面以应用最新版本。</p>
          <div v-if="updateContent" class="update-content" v-html="updateContent"></div>
        </div>

        <div class="dialog-footer">
          <button :disabled="isUpdating" class="dialog-btn cancel" @click="handleClose">
            取消
          </button>
          <button :disabled="isUpdating" class="dialog-btn confirm" @click="handleUpdate">
            {{ isUpdating ? '更新中...' : '立即更新' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentVersion: {
    type: String,
    default: ''
  },
  latestVersion: {
    type: String,
    default: ''
  },
  updateContent: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'update'])

const isUpdating = ref(false)

const handleClose = () => {
  emit('close')
}

const handleUpdate = () => {
  isUpdating.value = true
  emit('update')
}
</script>

<style lang="scss" scoped>
.glass-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-bg-popup);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.glass-dialog {
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  animation: dialogSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-title {
  color: var(--color-text-black);
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

.dialog-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-black);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }
}

.dialog-content {
  padding: 24px;
}

.update-message {
  color: var(--color-text-black);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.5;
}

.update-description {
  color: var(--color-text-black);
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.update-content {
  color: var(--color-text-black);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.update-content h1,
.update-content h2,
.update-content h3,
.update-content h4,
.update-content h5,
.update-content h6 {
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: 600;
}

.update-content p {
  margin: 8px 0;
}

.update-content ul,
.update-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.update-content li {
  margin: 4px 0;
}

.update-content a {
  color: #3b82f6;
  text-decoration: none;
}

.update-content a:hover {
  text-decoration: underline;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.dialog-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dialog-btn.cancel {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-text-black);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.8);
  }
}

.dialog-btn.confirm {
  background: #3b82f6;
  color: white;

  &:hover:not(:disabled) {
    background: #2563eb;
  }
}

@keyframes dialogSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

html[data-theme='dark'] .glass-dialog {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

html[data-theme='dark'] .dialog-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

html[data-theme='dark'] .dialog-title {
  color: #f1f5f9;
}

html[data-theme='dark'] .dialog-close {
  color: #94a3b8;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

html[data-theme='dark'] .update-message,
html[data-theme='dark'] .update-description {
  color: #e2e8f0;
}

html[data-theme='dark'] .update-content {
  color: #e2e8f0;
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

html[data-theme='dark'] .update-content a {
  color: #60a5fa;
}

html[data-theme='dark'] .dialog-footer {
  border-top-color: rgba(255, 255, 255, 0.05);
}

html[data-theme='dark'] .dialog-btn.cancel {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;

  &:hover:not(:disabled) {
    background: rgba(30, 41, 59, 1);
  }
}

@media (max-width: 768px) {
  .glass-dialog {
    max-width: 90%;
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .dialog-btn {
    width: 100%;
  }
}
</style>
