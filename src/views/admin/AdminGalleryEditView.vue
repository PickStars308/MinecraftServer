<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {deleteImage, editImage, getImageList, type ImageItem} from '@/api/imageApi';
import {addToast} from '@/components/toast/';
import GlassDialog from '@/components/GlassDialog.vue';
import GlassUploadDialog from "@/components/GlassUploadDialog.vue";

const images = ref<ImageItem[]>([]);
const loading = ref(false);
const editingImage = ref<string | null>(null);
const newImageName = ref('');
const showDeleteDialog = ref(false);
const currentImageToDelete = ref<ImageItem | null>(null);
const showUploadDialog = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const response = await getImageList();
    if (response.success) {
      images.value = response.data;
    } else {
      addToast(response.message || '获取图片列表失败', 'error');
    }
  } catch (error) {
    addToast('获取图片列表失败', 'error');
  } finally {
    loading.value = false;
  }
});


const handleEdit = (image: ImageItem) => {
  editingImage.value = image.name;
  newImageName.value = image.name;
};

const handleSaveEdit = async (image: ImageItem) => {
  if (!newImageName.value.trim()) {
    addToast('新名称不能为空', 'error');
    return;
  }

  loading.value = true;
  try {
    const filename = image.url.split('/').pop() || '';
    const response = await editImage(filename, newImageName.value.trim());
    if (response.success) {

      const index = images.value.findIndex(img => img.url === image.url);
      if (index !== -1) {
        images.value[index] = {
          name: response.data.newName,
          url: response.data.url,
          time: response.data.time
        };
      }
      addToast(response.message, 'success');
      editingImage.value = null;
      newImageName.value = '';
    } else {
      addToast(response.message || '编辑失败', 'error');
    }
  } catch (error) {
    addToast('编辑失败', 'error');
  } finally {
    loading.value = false;
  }
};

const handleCancelEdit = () => {
  editingImage.value = null;
  newImageName.value = '';
};

const handleDeleteClick = (image: ImageItem) => {
  currentImageToDelete.value = image;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (!currentImageToDelete.value) return;

  loading.value = true;
  try {
    const filename = currentImageToDelete.value.url.split('/').pop() || '';
    const response = await deleteImage(filename);
    if (response.success) {

      images.value = images.value.filter(img => img.url !== currentImageToDelete.value?.url);
      addToast(response.message, 'success');
    } else {
      addToast(response.message || '删除失败', 'error');
    }
  } catch (error) {
    addToast('删除失败', 'error');
  } finally {
    loading.value = false;
    showDeleteDialog.value = false;
    currentImageToDelete.value = null;
  }
};

const handleDeleteCancel = () => {
  showDeleteDialog.value = false;
  currentImageToDelete.value = null;
};

const handleUploadClick = () => {
  showUploadDialog.value = true;
};

const handleUploadSuccess = (uploadedImages: ImageItem[]) => {
  images.value = [...images.value, ...uploadedImages];
  showUploadDialog.value = false;
};

const handleUploadError = () => {
  showUploadDialog.value = false;
};

const ServerURL = import.meta.env.VITE_API_BASE_URL;
</script>

<template>
  <section class="single-panel">
    <article class="panel glass">
      <div class="panel-head">
        <h3>管理面板</h3>
        <div class="panel-actions">
          <button class="upload-btn" @click="handleUploadClick">
            <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                 stroke-width="1.8"
                 viewBox="0 0 24 24" width="20">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            上传图片
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="images.length > 0" class="image-grid">
        <div v-for="(image, index) in images" :key="index" class="image-item">
          <img :alt="image.name" :src="ServerURL +image.url" class="image"/>
          <div class="image-info">
            <div v-if="editingImage === image.name" class="edit-form">
              <input
                  v-model="newImageName"
                  class="edit-input"
                  placeholder="输入新名称"
                  type="text"
                  @keyup.enter="handleSaveEdit(image)"
              />
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

      <p v-else class="empty">暂无图片</p>
    </article>

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

    <!-- 上传图片弹窗 -->
    <GlassUploadDialog
        :visible="showUploadDialog"
        cancel-text="取消"
        confirm-text="上传"
        title="上传图片"
        @cancel="showUploadDialog = false"
        @close="showUploadDialog = false"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: #3b82f6;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }
}

html[data-theme='dark'] .upload-btn {
  background: #3b82f6;
  color: white;

  &:hover {
    background: #2563eb;
  }
}

.panel-head h3 {
  color: var(--color-text-black);
  font-size: 1.25rem;
  font-weight: 700;
}

.empty {
  color: var(--color-text-black);
  opacity: 0.6;
  text-align: center;
  padding: 40px 0;
  font-size: 1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #333;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
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
}

.image-item:hover {
  transform: translateY(-2px);
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
}

.image-name {
  font-size: 0.875rem;
  color: var(--color-text-black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.action-btn.edit {
  background: #3b82f6;
  color: white;
}

.action-btn.edit:hover {
  background: #2563eb;
}

.action-btn.delete {
  background: #ef4444;
  color: white;
}

.action-btn.delete:hover {
  background: #dc2626;
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

.action-btn.save {
  background: #10b981;
  color: white;
}

.action-btn.save:hover {
  background: #059669;
}

.action-btn.cancel {
  background: #6b7280;
  color: white;
}

.action-btn.cancel:hover {
  background: #4b5563;
}

html[data-theme='dark'] .edit-input {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
}

html[data-theme='dark'] .glass {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
}

html[data-theme='dark'] .panel-head h3 {
  color: #f1f5f9;
}

html[data-theme='dark'] .empty {
  color: #94a3b8;
}

html[data-theme='dark'] .loading-spinner {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: #f1f5f9;
}

html[data-theme='dark'] .loading p {
  color: #94a3b8;
}

html[data-theme='dark'] .image-item {
  background: rgba(30, 41, 59, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

html[data-theme='dark'] .image-name {
  color: #f1f5f9;
}
</style>
