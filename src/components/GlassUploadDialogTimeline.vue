<template>
  <Teleport to="body">
    <div v-if="visible" class="glass-dialog-overlay" @click.self="handleClose">
      <div class="glass-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ title }}</h3>
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
          <div
              :class="{ active: isDragging, disabled: isUploading }"
              class="upload-area"
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @dragenter.prevent="isDragging = true"
          >
            <input
                ref="fileInput"
                :disabled="isUploading"
                accept="image/jpeg,image/png,image/gif,image/webp"
                class="file-input"
                type="file"
                @change="handleFileChange"
            />
            <div class="upload-content">
              <div class="upload-icon">
                <svg fill="none" height="48" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" x2="12" y1="15" y2="3"></line>
                </svg>
              </div>
              <p class="upload-text">上传图片</p>
              <p class="upload-hint">支持格式: JPG / PNG / GIF / WebP，单文件最大 10MB</p>
            </div>
          </div>

          <div v-if="selectedFile" class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>

          <div class="input-fields">
            <div class="input-group">
              <label class="input-label">{{ label1 }}</label>
              <input
                  v-model="input1"
                  :disabled="isUploading"
                  :placeholder="placeholder1"
                  class="input-field"
                  type="text"
              />
            </div>
          </div>

          <div v-if="uploadProgress > 0 || isUploading" class="upload-progress">
            <div class="progress-bar">
              <div :style="{ width: `${uploadProgress}%` }" class="progress-fill"></div>
            </div>
            <p class="progress-text">{{ uploadProgress }}% {{ isUploading ? '上传中...' : '完成' }}</p>
          </div>
        </div>

        <div class="dialog-footer">
          <button v-if="showCancel" :disabled="isUploading" class="dialog-btn cancel" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button :disabled="!selectedFile || isUploading" class="dialog-btn confirm" @click="handleUpload">
            {{ isUploading ? '上传中...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import {uploadTimelineImage} from '@/api/imageApi'
import {addToast} from '@/components/toast/'

const props = defineProps({
  visible: Boolean,
  title: {type: String, default: '上传图片'},
  confirmText: {type: String, default: '上传'},
  cancelText: {type: String, default: '取消'},
  showClose: {type: Boolean, default: true},
  showCancel: {type: Boolean, default: true},
  autoCloseOnSuccess: {type: Boolean, default: true},
  label1: {type: String, default: '图片名称'},
  placeholder1: {type: String, default: '输入图片名称'}
})

const emit = defineEmits(['close', 'cancel', 'upload-success', 'upload-error'])

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const input1 = ref('')
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)

const reset = () => {
  selectedFile.value = null
  input1.value = ''
  uploadProgress.value = 0
  isUploading.value = false
  isDragging.value = false
  if (fileInput.value) fileInput.value.value = ''
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  if (file && file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
    selectedFile.value = file

    const fileName = file.name
    input1.value = fileName.substring(0, fileName.lastIndexOf('.'))
  }
  target.value = ''
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
    selectedFile.value = file

    const fileName = file.name
    input1.value = fileName.substring(0, fileName.lastIndexOf('.'))
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (!selectedFile.value) return


  if (!input1.value.trim()) {
    addToast('请输入有效的图片名称', 'warning')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)

    const response = await uploadTimelineImage(formData, {
      onUploadProgress: (progressEvent: { total?: number; loaded: number }) => {
        const total = progressEvent.total ?? 0
        const loaded = progressEvent.loaded
        if (total > 0) {
          uploadProgress.value = Math.round((loaded * 100) / total)
        }
      }
    })

    if (response.success) {
      addToast(response.message || '图片上传成功', 'success')
      emit('upload-success', {
        ...response.data,
        input1: input1.value
      })
      if (props.autoCloseOnSuccess) {
        emit('close')
        reset()
      }
    } else {
      throw new Error(response.message || '图片上传失败')
    }
  } catch (error: any) {
    addToast(error.message || '图片上传失败', 'error')
    emit('upload-error', error)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const handleClose = () => {
  reset()
  emit('close')
}

const handleCancel = () => {
  reset()
  emit('cancel')
}

watch(() => props.visible, (val) => {
  if (!val) reset()
})

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
  max-width: 600px;
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

.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &.active {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
  }

  &:hover {
    border-color: #3b82f6;
  }
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.upload-content {
  position: relative;
  z-index: 0;
}

.upload-icon {
  color: #3b82f6;
  margin-bottom: 16px;
}

.upload-text {
  color: var(--color-text-black);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.upload-hint {
  color: var(--color-text-black);
  font-size: 0.875rem;
  opacity: 0.6;
  margin: 0;
}

.file-info {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name {
  color: var(--color-text-black);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.file-size {
  color: var(--color-text-black);
  font-size: 0.75rem;
  opacity: 0.6;
}

.input-fields {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  color: var(--color-text-black);
  font-size: 0.875rem;
  font-weight: 600;
}

.input-field {
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.upload-progress {
  margin-top: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--color-text-black);
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
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

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

html[data-theme='dark'] .upload-area.disabled {
  opacity: 0.4;
}

html[data-theme='dark'] .progress-fill {
  background: linear-gradient(90deg, #60a5fa, #93c5fd);
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

html[data-theme='dark'] .upload-text,
html[data-theme='dark'] .upload-hint,
html[data-theme='dark'] .file-name,
html[data-theme='dark'] .file-size,
html[data-theme='dark'] .input-label,
html[data-theme='dark'] .progress-text {
  color: #e2e8f0;
}

html[data-theme='dark'] .upload-area {
  border-color: rgba(255, 255, 255, 0.2);

  &.active {
    background: rgba(59, 130, 246, 0.1);
  }
}

html[data-theme='dark'] .file-info {
  background: rgba(30, 41, 59, 0.8);
}

html[data-theme='dark'] .input-field {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }
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
</style>
