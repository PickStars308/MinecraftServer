<template>
  <Teleport to="body">
    <div v-show="toasts.length" :class="position" class="glass-toast-container">
      <TransitionGroup appear name="toast-list" tag="div">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="[toast.type, { 'entering': toast.entering }]"
            class="glass-toast-item"
        >
          <span class="toast-icon" v-html="getIcon(toast.type || 'info')"></span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
              v-if="toast.showClose !== false"
              class="toast-close"
              @click="removeToast(toast.id)"
          >
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import {getIcon, position, removeToast, toasts} from '@/components/toast';
</script>

<style lang="scss" scoped>
.glass-toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  pointer-events: none;
  width: 100%;
  max-width: 420px;

  &.top-left {
    top: 16px;
    left: 16px;
    align-items: flex-start;
  }

  &.top-center {
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
  }

  &.top-right {
    top: 16px;
    right: 0;
    align-items: flex-end;
  }

  &.bottom-left {
    bottom: 16px;
    left: 16px;
    align-items: flex-start;
  }

  &.bottom-center {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
  }

  &.bottom-right {
    bottom: 16px;
    right: 0;
    align-items: flex-end;
  }
}

.glass-toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  min-width: 320px;
  max-width: 420px;
  margin-bottom: 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  color: #111;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.45;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.5s ease, transform 0.5s ease;


  &::after {
    content: "";
    position: absolute;
    inset: -150% -150% -150% -300%;
    background: linear-gradient(
            115deg,
            transparent 35%,
            rgba(255, 255, 255, 0.6) 48%,
            rgba(255, 255, 255, 0.3) 52%,
            transparent 65%
    );
    transform: skewX(-22deg);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.7s, transform 1.1s;
  }

  &.entering::after {
    opacity: 0.8;
    transform: translateX(320%) skewX(-22deg);
  }


  &.success {
    border-left: 4px solid #10b981;

    .toast-icon {
      color: #10b981;
    }
  }

  &.error {
    border-left: 4px solid #ef4444;

    .toast-icon {
      color: #ef4444;
    }
  }

  &.warning {
    border-left: 4px solid #f59e0b;

    .toast-icon {
      color: #f59e0b;
    }
  }

  &.info {
    border-left: 4px solid #3b82f6;

    .toast-icon {
      color: #3b82f6;
    }
  }

  .toast-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .toast-message {
    flex: 1;
  }

  .toast-close {
    background: none;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 22px;
    color: rgba(0, 0, 0, 0.45);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #000;
    }
  }
}

.toast-list-enter-active {
  animation: toastSlideIn .45s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-list-leave-active {
  animation: toastSlideOut .35s cubic-bezier(0.4, 0, 1, 1) forwards;
}

.toast-list-move {
  transition: transform .35s cubic-bezier(.4, 0, .2, 1);
}

@keyframes toastSlideIn {

  0% {
    opacity: 0;
    transform: translateX(120%) scale(.9);
    filter: blur(6px);
  }

  60% {
    opacity: 1;
    transform: translateX(-6px) scale(1.02);
    filter: blur(0);
  }

  100% {
    transform: translateX(0) scale(1);
  }

}

@keyframes toastSlideOut {

  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateX(120%) scale(.9);
  }

}
</style>

