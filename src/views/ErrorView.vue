<script lang="ts" setup>
import {useRouter} from 'vue-router'

const router = useRouter()

const handleBack = () => {
  router.back()
}

const handleRefresh = () => {
  window.location.reload()
}
</script>

<template>
  <section class="error-view">
    <div class="error-card">
      <!-- 错误图标 -->
      <div class="error-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
          <path d="M12 8V12L14 14" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <!-- 错误标题 -->
      <h1 class="error-title">网络连接错误</h1>
      
      <!-- 错误描述 -->
      <p class="error-description">
        无法连接到服务器，请检查网络连接或联系管理员。
      </p>
      
      <!-- 错误详情 -->
      <div class="error-details">
        <p>错误类型: CORS 跨域限制</p>
        <p>可能原因: 服务器配置的跨域规则与当前域名不匹配</p>
      </div>
      
      <!-- 操作按钮 -->
      <div class="error-actions">
        <button class="btn btn-secondary" @click="handleBack">
          返回
        </button>
        <button class="btn btn-primary" @click="handleRefresh">
          刷新页面
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.error-view {
  width: 100%;
  max-width: 980px;
  padding: clamp(16px, 5vw, 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.error-card {
  width: 100%;
  max-width: 500px;
  padding: clamp(22px, 4vw, 34px);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.28s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16);
  }
}

.error-icon {
  margin-bottom: 24px;
}

.error-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: var(--color-text-black);
  margin-bottom: 16px;
  font-weight: 600;
}

.error-description {
  color: var(--color-text-black);
  opacity: 0.8;
  margin-bottom: 24px;
  line-height: 1.5;
  font-size: 1rem;
}

.error-details {
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 30px;
  text-align: left;

  p {
    margin: 8px 0;
    font-size: 0.9rem;
    color: var(--color-text-black);
  }
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background: rgba(203, 213, 225, 0.5);
  color: var(--color-text-black);

  &:hover:not(:disabled) {
    background: rgba(203, 213, 225, 0.8);
  }
}

.btn-primary {
  background: linear-gradient(135deg, #fb7ebb, #ff8cc9);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(251, 126, 187, 0.35);
  }
}

html[data-theme='dark'] .error-card {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(226, 232, 240, 0.18);
}

html[data-theme='dark'] .error-details {
  background: rgba(239, 68, 68, 0.15);
  border-left-color: #f87171;
}

@media (max-width: 768px) {
  .error-card {
    padding: 20px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>