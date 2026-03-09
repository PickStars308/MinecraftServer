<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {getImageList, type ImageItem, saveImageList} from '@/api/historyApi.ts'
import {addToast} from '@/components/toast'
import {deleteTimelineImage, editTimelineImage} from '@/api/imageApi.ts'
import GlassUploadDialogTimeline from '../../components/GlassUploadDialogTimeline.vue'
import GlassDialog from '../../components/GlassDialog.vue'

const images = ref<ImageItem[]>([])
const loading = ref(false)
const error = ref('')
const newImageName = ref('')
const newImageUrl = ref('')
const uploadDialogVisible = ref(false)
const editingImage = ref<string | null>(null)
const showDeleteDialog = ref(false)
const currentImageToDelete = ref<ImageItem | null>(null)

const loadImages = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getImageList()
    if (response.success) {
      images.value = response.data
    } else {
      error.value = response.message || '加载时间线失败'
      addToast(response.message || '加载时间线失败', 'error')
    }
  } catch (err) {
    error.value = '加载时间线失败'
    addToast('加载时间线失败', 'error')
  } finally {
    loading.value = false
  }
}

const addImage = async () => {
  if (!newImageName.value.trim() || !newImageUrl.value.trim()) {
    addToast('输入内容不能为空', 'warning')
    return
  }

  images.value.push({
    name: newImageName.value.trim(),
    url: newImageUrl.value.trim()
  })


  const saveResponse = await saveImageList(images.value)
  if (saveResponse.success) {
    addToast('添加成功', 'success')
  } else {
    addToast(saveResponse.message || '保存失败', 'error')
  }

  newImageName.value = ''
  newImageUrl.value = ''
}

const handleEdit = (image: ImageItem) => {
  editingImage.value = image.name
  newImageName.value = image.name
}

const handleSaveEdit = async (image: ImageItem) => {
  if (!newImageName.value.trim()) {
    addToast('输入内容不能为空', 'error')
    return
  }

  loading.value = true
  try {
    const urlParts = image.url.split('/')
    const filename = urlParts[urlParts.length - 1]
    const response = await editTimelineImage(filename || '', newImageName.value.trim())
    if (response.success) {
      const index = images.value.findIndex(img => img.url === image.url)
      if (index !== -1) {
        images.value[index] = {
          name: response.data.newName,
          url: response.data.url,
          time: response.data.time
        }
      }

      const saveResponse = await saveImageList(images.value)
      if (saveResponse.success) {
        addToast(response.message || '编辑成功', 'success')
      } else {
        addToast(saveResponse.message || '保存失败', 'error')
      }
      editingImage.value = null
      newImageName.value = ''
    } else {
      addToast(response.message || '编辑失败', 'error')
    }
  } catch (error) {
    addToast('编辑失败', 'error')
  } finally {
    loading.value = false
  }
}

const handleCancelEdit = () => {
  editingImage.value = null
  newImageName.value = ''
}

const handleDeleteClick = (image: ImageItem) => {
  currentImageToDelete.value = image
  showDeleteDialog.value = true
}

const handleDeleteConfirm = async () => {
  if (!currentImageToDelete.value) return

  loading.value = true
  try {
    const urlParts = currentImageToDelete.value.url.split('/')
    const filename = urlParts[urlParts.length - 1]
    const response = await deleteTimelineImage(filename || '')
    if (response.success) {
      images.value = images.value.filter(img => img.url !== currentImageToDelete.value?.url)

      const saveResponse = await saveImageList(images.value)
      if (saveResponse.success) {
        addToast(response.message || '删除成功', 'success')
      } else {
        addToast(saveResponse.message || '保存失败', 'error')
      }
    } else {
      addToast(response.message || '删除失败', 'error')
    }
  } catch (error) {
    addToast('删除失败', 'error')
  } finally {
    loading.value = false
    showDeleteDialog.value = false
    currentImageToDelete.value = null
  }
}

const handleDeleteCancel = () => {
  showDeleteDialog.value = false
  currentImageToDelete.value = null
}

const handleImageUpload = async (data: { url: string; input1: string }) => {
  newImageName.value = data.input1
  newImageUrl.value = data.url
  uploadDialogVisible.value = false


  if (data.input1.trim()) {

    await addImage()
  }
}

onMounted(() => {
  loadImages()
})

const ServerPic = import.meta.env.VITE_API_BASE_URL
</script>

<template>
  <section class="single-panel">
    <article class="panel glass">
      <div class="panel-head">
        <div class="head-content">
          <h3>时间线管理</h3>
          <p class="panel-description">管理服务器发展时间线的图片</p>
        </div>
        <button class="btn btn-secondary upload-btn" @click="uploadDialogVisible = true">
          上传图片
        </button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="loadImages">
          重试
        </button>
      </div>

      <div v-else class="timeline-container">


        <div class="images-list">
          <div v-if="images.length === 0" class="empty-list">
            <p>暂无时间线图片</p>
          </div>
          <div v-else class="image-grid">
            <div
                v-for="(image, index) in images"
                :key="index"
                class="image-item"
            >
              <img
                  :alt="image.name"
                  :src="ServerPic + image.url"
                  class="image"
              >
              <div class="image-info">
                <div v-if="editingImage === image.name" class="edit-form">
                  <input
                      v-model="newImageName"
                      class="edit-input"
                      placeholder="输入新名称"
                      type="text"
                      @keyup.enter="handleSaveEdit(image)"
                  >
                  <div class="edit-actions">
                    <button class="action-btn save" @click="handleSaveEdit(image)">保存</button>
                    <button class="action-btn cancel" @click="handleCancelEdit">取消</button>
                  </div>
                </div>
                <div v-else>
                  <span class="image-name">{{ image.name }}</span>
                  <div class="image-actions">
                    <button class="action-btn edit" @click="handleEdit(image)">编辑</button>
                    <button class="action-btn delete" @click="handleDeleteClick(image)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </article>

    <!-- 图片上传对话框 -->
    <GlassUploadDialogTimeline
        :visible="uploadDialogVisible"
        label1="图片名称"
        placeholder1="请输入图片名称"
        title="上传图片"
        @close="uploadDialogVisible = false"
        @upload-success="handleImageUpload"
    />

    <!-- 删除确认弹窗 -->
    <GlassDialog
        :visible="showDeleteDialog"
        cancel-text="取消"
        confirm-text="删除"
        content="确定要删除这个图片吗？"
        title="确认删除"
        @cancel="handleDeleteCancel"
        @close="handleDeleteCancel"
        @confirm="handleDeleteConfirm"
    />
  </section>
</template>

<style lang="scss" scoped>
.single-panel {
  min-height: 420px;
}

.panel {
  padding: 24px;
}

.glass {
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.panel-head {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .head-content {
    flex: 1;

    h3 {
      color: var(--color-text-black);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .panel-description {
      color: var(--color-text-black);
      opacity: 0.7;
      font-size: 0.9rem;
      margin: 0;
    }
  }

  .upload-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 16px;
  }

  p {
    color: var(--color-text-black);
  }
}

.error-container {
  text-align: center;
  padding: 40px 0;

  .error-message {
    color: var(--color-danger);
    margin-bottom: 16px;
  }
}


.images-list {
  margin-bottom: 24px;

  h4 {
    color: var(--color-text-black);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .empty-list {
    text-align: center;
    padding: 40px 0;

    p {
      color: var(--color-text-black);
      opacity: 0.6;
    }
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.image-item {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.image-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .form-group {
    label {
      display: block;
      color: var(--color-text-black);
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 2px;
    }

    input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      font-size: 0.85rem;
      background: rgba(255, 255, 255, 0.8);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
    }
  }
}

.image-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.delete {
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
  }
}

.action-btn.edit {
  background: #3b82f6;
  color: white;

  &:hover {
    background: #2563eb;
  }
}

.action-btn.save {
  background: #10b981;
  color: white;

  &:hover {
    background: #059669;
  }
}

.action-btn.cancel {
  background: #6b7280;
  color: white;

  &:hover {
    background: #4b5563;
  }
}

.edit-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.image-name {
  font-size: 0.875rem;
  color: var(--color-text-black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn {
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      transform: none;
    }
  }
}

.btn-primary {
  background: var(--color-primary);
  color: white;

  &:hover {
    background: var(--color-primary-dark);
  }
}

.btn-secondary {
  background: var(--color-secondary);

  &:hover {
    background: var(--color-secondary-dark);
  }
}

.btn-success {
  background: var(--color-success);
  color: white;

  &:hover {
    background: var(--color-success-dark);
  }
}

.btn-danger {
  background: var(--color-danger);
  color: white;

  &:hover {
    background: var(--color-danger-dark);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

html[data-theme='dark'] .glass {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
}

html[data-theme='dark'] .loading-spinner {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
}

html[data-theme='dark'] .error-message {
  color: #f87171;
}

html[data-theme='dark'] .image-item {
  background: rgba(30, 41, 59, 0.6);
}

html[data-theme='dark'] .image-info label {
  color: #f1f5f9;
}

html[data-theme='dark'] .image-info input {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(226, 232, 240, 0.2);
  color: #f1f5f9;

  &:focus {
    border-color: var(--color-primary);
  }
}

html[data-theme='dark'] .action-btn.delete {
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
  }
}

html[data-theme='dark'] .action-btn.edit {
  background: #3b82f6;
  color: white;

  &:hover {
    background: #2563eb;
  }
}

html[data-theme='dark'] .action-btn.save {
  background: #10b981;
  color: white;

  &:hover {
    background: #059669;
  }
}

html[data-theme='dark'] .action-btn.cancel {
  background: #6b7280;
  color: white;

  &:hover {
    background: #4b5563;
  }
}

html[data-theme='dark'] .edit-input {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(226, 232, 240, 0.2);
  color: #f1f5f9;

  &:focus {
    border-color: var(--color-primary);
  }
}

html[data-theme='dark'] .image-name {
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: 1fr !important;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch !important;

    .btn {
      width: 100%;
    }
  }

  .input-with-button {
    flex-direction: column;
  }
}
</style>
