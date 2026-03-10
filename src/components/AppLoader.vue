<template>
  <div class="app-loader">
    <div class="loader-card">
      <div class="loader-spinner"></div>
      <p class="loader-text">加载中...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.app-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.loader-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px 60px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loader-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(251, 126, 187, 0.3);
  border-top-color: #fb7ebb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader-text {
  color: var(--color-text-black);
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 深色主题适配 */
html[data-theme='dark'] .app-loader {
  background: rgba(15, 23, 42, 0.4);
}

html[data-theme='dark'] .loader-card {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(226, 232, 240, 0.18);
}

html[data-theme='dark'] .loader-spinner {
  border-color: rgba(251, 126, 187, 0.3);
  border-top-color: #fb7ebb;
}

html[data-theme='dark'] .loader-text {
  color: #e2e8f0;
}

@media (max-width: 768px) {
  .loader-card {
    padding: 30px 40px;
  }

  .loader-spinner {
    width: 50px;
    height: 50px;
  }

  .loader-text {
    font-size: 1rem;
  }
}
</style>
