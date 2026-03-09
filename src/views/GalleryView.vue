<template>
  <div class="gallery-view">
    <h1 class="main-title">
      <Typewriter :after-text-delay="2000" :loop="true" :speed="100" :texts="introTexts"/>
    </h1>

    <p class="subtitle">浏览服务器精彩瞬间，记录美好回忆</p>

    <div v-if="loading" class="page-loader">
      <div class="loader">
        <div class="box1"></div>
        <div class="box2"></div>
        <div class="box3"></div>
      </div>
    </div>

    <div v-else-if="errorMsg" class="error-message">
      <div class="page-loader">
        <div class="loader">
          <div class="box1"></div>
          <div class="box2"></div>
          <div class="box3"></div>
        </div>
      </div>
    </div>

    <div v-else-if="imageList.length === 0" class="empty-message">
      暂无图片
    </div>

    <div v-else class="masonry-container">
      <div v-for="(item, idx) in imageList" :key="idx" class="masonry-card" @click="openPreview(idx)">
        <div class="card-glass">
          <div class="image-wrapper">
            <img alt="placeholder" class="placeholder-image" src="/src/assets/images/weapper.png"/>

            <div v-if="!loadedMap[idx]" class="image-loader">
              <div class="loader">
                <div class="box1"></div>
                <div class="box2"></div>
                <div class="box3"></div>
              </div>
            </div>

            <img
                :alt="item.name"
                :class="{ loaded: loadedMap[idx] }"
                :src="Server + item.url"
                decoding="async"
                loading="lazy"
                @error="handleImageLoad(idx)"
                @load="handleImageLoad(idx)"
            />
          </div>

          <div class="card-content">
            <h3 class="card-title">
              {{ item.name || '未命名' }}
            </h3>
            <span v-if="item.time" class="card-time">
              {{ item.time }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="previewIndex !== -1" class="preview-overlay" @click="handleOverlayClick">
      <div class="preview-wrapper">
        <div class="preview-image-container">
          <div v-if="previewLoading" class="preview-loader">
            <div class="loader">
              <div class="box1"></div>
              <div class="box2"></div>
              <div class="box3"></div>
            </div>
          </div>

          <img
              :class="{ loaded: !previewLoading }"
              :src="Server + currentPreviewItem?.url"
              :style="{ transform: `scale(${scale})` }"
              class="preview-image"
              @error="handlePreviewImageLoad"
              @load="handlePreviewImageLoad"
              @wheel="handleImageZoom"
          />
        </div>

        <div class="preview-toolbar">
          <button :disabled="previewIndex === 0" class="toolbar-btn" @click="prevImage">
            上一张
          </button>

          <div class="preview-title">
            {{ currentPreviewItem?.name }}
          </div>

          <button :disabled="previewIndex === imageList.length - 1" class="toolbar-btn" @click="nextImage">
            下一张
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {getImageList, type ImageItem} from '@/api/imageApi'
import {addToast} from '@/components/toast'
import Typewriter from '@/components/Typewriter.vue'

const imageList = ref<ImageItem[]>([])
const errorMsg = ref('')
const loading = ref(true)
const previewIndex = ref(-1)
const scale = ref(1)
const previewLoading = ref(false)
const Server = import.meta.env.VITE_API_BASE_URL
const loadedMap = ref<Record<number, boolean>>({})
const introTexts = computed(() => [
  '愿方块与你同在',
  '今日也是挖矿的好日子',
  '建造属于你的星辰大海',
  '服务器因你而更精彩',
  '每一次相遇都值得珍惜',
  '在方块世界里自由奔跑',
  '把平凡的日子过成冒险',
  '用心搭建，用爱守护',
  '探索不止，快乐不停',
  '存档里藏着我们的回忆'
])

const handleImageLoad = (index: number) => {
  loadedMap.value[index] = true
}

const currentPreviewItem = computed(() => {
  return previewIndex.value !== -1 ? imageList.value[previewIndex.value] : null
})

const openPreview = (index: number) => {
  previewIndex.value = index
  scale.value = 1
  previewLoading.value = false
  document.addEventListener('keydown', handleKeydown)
  window.dispatchEvent(new CustomEvent('preview-state-change', {detail: {visible: false}}))
}

const closePreview = () => {
  previewIndex.value = -1
  scale.value = 1
  document.removeEventListener('keydown', handleKeydown)
  window.dispatchEvent(new CustomEvent('preview-state-change', {detail: {visible: true}}))
}

const handleOverlayClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('preview-overlay')) closePreview()
}

const prevImage = () => {
  if (previewIndex.value > 0) {
    previewIndex.value--
    scale.value = 1
    previewLoading.value = true
  }
}

const nextImage = () => {
  if (previewIndex.value < imageList.value.length - 1) {
    previewIndex.value++
    scale.value = 1
    previewLoading.value = true
  }
}

const handleImageZoom = (e: WheelEvent) => {
  e.preventDefault()
  scale.value = e.deltaY < 0 ? Math.min(scale.value + 0.1, 3) : Math.max(scale.value - 0.1, 0.5)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'Escape') closePreview()
}

const handlePreviewImageLoad = () => {
  previewLoading.value = false
}

const loadImages = async () => {
  loading.value = true
  try {
    const res = await getImageList()
    if (res.success) {
      imageList.value = res.data
    } else {
      errorMsg.value = res.message || '图片加载失败'
      addToast(errorMsg.value, 'error')
    }
  } catch {
    errorMsg.value = '图片加载失败'
    addToast(errorMsg.value, 'error')
  }
  loading.value = false
}

onMounted(loadImages)
</script>

<style lang="scss" scoped>
$gap: 20px;
$radius: 16px;

.gallery-view {
  max-width: 1400px;
  margin: auto;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .main-title {
    font-size: clamp(1.8rem, 7vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text-black);
    overflow: hidden;
    margin-bottom: clamp(8px, 3vw, 16px);
    line-height: 1.2;
    word-break: break-word;
  }

  .subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: var(--color-text-black);
    margin-bottom: clamp(24px, 10vw, 48px);
    line-height: 1.5;
  }
}

.page-loader {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message,
.empty-message {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
}

.dark .error-message,
.dark .empty-message {
  color: #aaa;
}

.masonry-container {
  column-count: 1;
  column-gap: $gap;

  @media (min-width: 640px) {
    column-count: 2;
  }
  @media (min-width: 900px) {
    column-count: 3;
  }
  @media (min-width: 1200px) {
    column-count: 4;
  }
  @media (min-width: 1500px) {
    column-count: 5;
  }
}

.masonry-card {
  break-inside: avoid;
  margin-bottom: $gap;
  cursor: pointer;
}

.card-glass {
  border-radius: $radius;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: 0.25s;
}

.card-glass:hover {
  transform: translateY(-6px);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.placeholder-image {
  width: 100%;
  height: auto;
  display: block;
}

.image-wrapper img:not(.placeholder-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  filter: blur(10px);
  transition: 0.4s;
}

.image-wrapper img.loaded {
  opacity: 1;
  filter: blur(0);
}

.image-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(6px);
}

.dark .image-loader {
  background: rgba(0, 0, 0, 0.4);
}

.loader {
  width: 112px;
  height: 112px;
  position: relative;
}

.box1,
.box2,
.box3 {
  background-color: #ffffff;
  border-radius: 10px;
  box-sizing: border-box;
  position: absolute;
  display: block;
}

.box1 {
  width: 112px;
  height: 48px;
  margin-top: 64px;
  margin-left: 0;
  animation: abox1 3s 1s forwards ease-in-out infinite;
}

.box2 {
  width: 48px;
  height: 48px;
  margin-top: 0;
  margin-left: 0;
  animation: abox2 3s 1s forwards ease-in-out infinite;
}

.box3 {
  width: 48px;
  height: 48px;
  margin-top: 0;
  margin-left: 64px;
  animation: abox3 3s 1s forwards ease-in-out infinite;
}

.card-content {
  padding: 14px;
}

.card-title {
  color: var(--color-button-hover);
  font-size: 14px;
  margin-bottom: 6px;
}

.card-time {
  font-size: 12px;
  color: var(--color-button-hover);
}

.preview-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: $radius;
  overflow: hidden;
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: calc(95vh - 70px);
  transition: transform 0.2s ease, opacity 0.3s ease;
  cursor: zoom-in;
  opacity: 0;
}

.preview-image.loaded {
  opacity: 1;
}

.preview-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10;
}

.preview-toolbar {
  height: 70px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: white;
}

.toolbar-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.preview-title {
  max-width: 300px;
  overflow: hidden;

  white-space: nowrap;
  font-size: 14px;
}

@keyframes abox1 {
  0% {
    width: 112px;
    height: 48px;
    margin-top: 64px;
    margin-left: 0;
  }
  12.5% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 0;
  }
  25% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 0;
  }
  37.5% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 0;
  }
  50% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 0;
  }
  62.5% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 0;
  }
  75% {
    width: 48px;
    height: 112px;
    margin-top: 0;
    margin-left: 0;
  }
  87.5% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 0;
  }
  100% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 0;
  }
}

@keyframes abox2 {
  0% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 0;
  }
  12.5% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 0;
  }
  25% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 0;
  }
  37.5% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 0;
  }
  50% {
    width: 112px;
    height: 48px;
    margin-top: 0;
    margin-left: 0;
  }
  62.5% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 64px;
  }
  75% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 64px;
  }
  87.5% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 64px;
  }
  100% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 64px;
  }
}

@keyframes abox3 {
  0% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 64px;
  }
  12.5% {
    width: 48px;
    height: 48px;
    margin-top: 0;
    margin-left: 64px;
  }
  25% {
    width: 48px;
    height: 112px;
    margin-top: 0;
    margin-left: 64px;
  }
  37.5% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 64px;
  }
  50% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 64px;
  }
  62.5% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 64px;
  }
  75% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 64px;
  }
  87.5% {
    width: 48px;
    height: 48px;
    margin-top: 64px;
    margin-left: 64px;
  }
  100% {
    width: 112px;
    height: 48px;
    margin-top: 64px;
    margin-left: 0;
  }
}

:deep(.dark) {
  .card-glass {
    background: rgba(30, 30, 30, 0.6);
    border-color: rgba(80, 80, 80, 0.3);
  }

  .card-time {
    color: #aaa;
  }

  .image-loader {
    background: rgba(0, 0, 0, 0.4);
  }
}
</style>
