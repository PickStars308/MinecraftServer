<template>
  <Teleport to="body">
    <div v-if="visible" class="glass-dialog-overlay" @click="handleOverlayClick">
      <div class="glass-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ title }}</h3>
          <button v-if="showClose" class="dialog-close" @click="handleClose">
            <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                 stroke-width="1.8"
                 viewBox="0 0 24 24" width="20">
              <line x1="18" x2="6" y1="6" y2="18"></line>
              <line x1="6" x2="18" y1="6" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="dialog-content">
          {{ content }}
        </div>
        <div class="dialog-footer">
          <button v-if="showCancel" class="dialog-btn cancel" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="dialog-btn confirm" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  content: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleClose = () => {
  emit('close');
};

const handleOverlayClick = () => {
  emit('close');
};
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
  color: var(--color-text-black);
  line-height: 1.5;
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
  min-width: 80px;
}

.dialog-btn.cancel {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-text-black);

  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
}

.dialog-btn.confirm {
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
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

html[data-theme='dark'] .dialog-content {
  color: #e2e8f0;
}

html[data-theme='dark'] .dialog-footer {
  border-top-color: rgba(255, 255, 255, 0.05);
}

html[data-theme='dark'] .dialog-btn.cancel {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;

  &:hover {
    background: rgba(30, 41, 59, 1);
  }
}
</style>
