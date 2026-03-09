<template>
  <div class="members-view">
    <h1 class="main-title">
      <Typewriter :after-text-delay="2000" :loop="true" :speed="100" :texts="introTexts"/>
    </h1>

    <p class="subtitle">认识服务器的小伙伴们，一起创造精彩</p>

    <div v-if="loading" class="page-loader">
      <div class="loader">
        <div class="box1"></div>
        <div class="box2"></div>
        <div class="box3"></div>
      </div>
    </div>

    <div v-else-if="errorMsg" class="state-message">
      {{ errorMsg }}
    </div>

    <div v-else-if="memberList.length === 0" class="state-message">
      暂无成员数据
    </div>

    <div v-else class="masonry-container">
      <div
          v-for="(column, colIndex) in columns"
          :key="colIndex"
          class="masonry-column"
      >
        <div
            v-for="member in column"
            :key="member.uuid || member.name"
            class="masonry-card"
        >
          <div class="card-glass">
            <div class="avatar-wrapper">

              <div v-if="!loadedMap[member.name]" class="image-loader">
                <div class="loader">
                  <div class="box1"></div>
                  <div class="box2"></div>
                  <div class="box3"></div>
                </div>
              </div>

              <img
                  :alt="member.name"
                  :class="{ loaded: loadedMap[member.name] }"
                  :src="generateFaceUrl(member.name, { scale: 8 })"
                  decoding="async"
                  loading="lazy"
                  @error="handleAvatarError(member)"
                  @load="handleImageLoad(member.name)"
              />

            </div>

            <div class="card-content">
              <h3 class="member-name">
                {{ member.name }}
              </h3>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {generateFaceUrl, getMemberList, type ServerMember} from '@/api/memberApi'
import {addToast} from '@/components/toast'
import Typewriter from '@/components/Typewriter.vue'

const memberList = ref<ServerMember[]>([])
const errorMsg = ref('')
const loading = ref(true)

/* 解决 index 变化导致图片闪烁 */
const loadedMap = ref<Record<string, boolean>>({})

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

const windowWidth = ref(window.innerWidth)

/* 自适应列数 */
const columnCount = computed(() => {
  const w = windowWidth.value

  if (w < 480) return 2
  if (w < 768) return 3
  if (w < 1024) return 4
  if (w < 1400) return 6
  return 8
})

/* 瀑布流列 */
const columns = computed(() => {
  const count = columnCount.value
  const result: ServerMember[][] = Array.from({length: count}, () => [])

  memberList.value.forEach((member, index) => {
    const columnIndex = index % count
    if (result[columnIndex]) {
      result[columnIndex].push(member)
    }
  })

  return result
})

const handleImageLoad = (name: string) => {
  loadedMap.value[name] = true
}

const handleAvatarError = (member: ServerMember) => {
  member.uuid = 'default'
  loadedMap.value[member.name] = true
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const loadMembers = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await getMemberList()

    if (res.success) {
      memberList.value = res.data
    } else {
      errorMsg.value = res.message || '成员加载失败'
      addToast(errorMsg.value, 'error')
    }

  } catch {
    errorMsg.value = '成员加载失败'
    addToast(errorMsg.value, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMembers()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>

$gap: 20px;
$radius: 16px;

.members-view {
  max-width: 1400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  .main-title {
    font-size: clamp(1.8rem, 7vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text-black);
    margin-bottom: clamp(8px, 3vw, 16px);
  }

  .subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: var(--color-text-black);
    margin-bottom: clamp(24px, 10vw, 48px);
  }
}

.page-loader {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-message {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.masonry-container {
  display: flex;
  gap: $gap;
  width: 100%;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $gap;
}

.card-glass {
  border-radius: $radius;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: .25s;
}

.card-glass:hover {
  transform: translateY(-6px);
}

.avatar-wrapper {
  position: relative;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.avatar-wrapper img {
  width: 100px;
  height: 100px;
  border-radius: 10%;
  opacity: 0;
  filter: blur(10px);
  border: 4px solid white;
  transition: .4s;
}

.avatar-wrapper img.loaded {
  opacity: 1;
  filter: blur(0);
}

.image-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, .4);
}

.card-content {
  padding: 5px;
  text-align: center;
}

.member-name {
  font-size: 12px;
  font-weight: 600;
}

</style>
