<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import type {Track} from '@/stores/musicPlayer'

const props = defineProps<{
  currentTrack: Track | null
  currentTime?: number
}>()

const lyricContainerRef = ref<HTMLElement | null>(null)
const userScrolled = ref(false)
const autoScrollTimer = ref<number | null>(null)

const parsedLyrics = computed(() => props.currentTrack?.lyric ?? [])

const currentLineIndex = computed(() => {
  const lyrics = parsedLyrics.value
  const timeMs = props.currentTime ?? 0

  if (lyrics.length === 0 || timeMs < 0) {
    return -1
  }

  for (let index = lyrics.length - 1; index >= 0; index -= 1) {
    if (timeMs >= lyrics[index]!.time) {
      return index
    }
  }

  return -1
})

const stateText = computed(() => {
  if (!props.currentTrack) {
    return '请选择一首歌曲'
  }

  if (props.currentTrack.lyricStatus === 'loading') {
    return '歌词加载中...'
  }

  if (parsedLyrics.value.length === 0) {
    return '暂无歌词'
  }

  return ''
})

function scrollToLine(index: number) {
  const container = lyricContainerRef.value
  if (!container || index < 0) return

  const lineElements = container.querySelectorAll<HTMLElement>('.lyric-line')
  const targetElement = lineElements[index]
  if (!targetElement) return

  const containerHeight = container.clientHeight
  const lineTop = targetElement.offsetTop
  const lineHeight = targetElement.offsetHeight
  const scrollTarget = lineTop - (containerHeight - lineHeight) / 2

  container.scrollTo({
    top: scrollTarget,
    behavior: 'smooth',
  })
}

function handleUserScroll() {
  userScrolled.value = true

  if (autoScrollTimer.value !== null) {
    window.clearTimeout(autoScrollTimer.value)
  }

  autoScrollTimer.value = window.setTimeout(() => {
    userScrolled.value = false
    if (currentLineIndex.value >= 0) {
      scrollToLine(currentLineIndex.value)
    }
  }, 5000)
}

watch(currentLineIndex, (newIndex) => {
  if (!userScrolled.value && newIndex >= 0) {
    void nextTick(() => {
      scrollToLine(newIndex)
    })
  }
})

watch(
    () => props.currentTrack?.id,
    () => {
      userScrolled.value = false
      if (lyricContainerRef.value) {
        lyricContainerRef.value.scrollTo({top: 0, behavior: 'auto'})
      }
    },
)

onMounted(() => {
  lyricContainerRef.value?.addEventListener('scroll', handleUserScroll, {passive: true})
})

onUnmounted(() => {
  lyricContainerRef.value?.removeEventListener('scroll', handleUserScroll)

  if (autoScrollTimer.value !== null) {
    window.clearTimeout(autoScrollTimer.value)
  }
})
</script>

<template>
  <div ref="lyricContainerRef" class="lyric-container">
    <div class="lyric-wrapper">
      <div v-if="stateText" class="lyric-empty">
        {{ stateText }}
      </div>

      <div
          v-for="(line, lineIndex) in parsedLyrics"
          v-else
          :key="`${line.time}-${lineIndex}`"
          :class="{ active: currentLineIndex === lineIndex }"
          class="lyric-line"
      >
        {{ line.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.lyric-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px 0;
  overflow-y: auto;
  font-size: 15px;
  line-height: 2.2;
  -webkit-overflow-scrolling: touch;
}

.lyric-wrapper {
  width: 100%;
  padding: 60px 20px;
  text-align: center;
}

.lyric-line {
  margin: 8px 0;
  color: white;
  opacity: 0.5;
  transition: all 0.35s ease;
  white-space: pre-wrap;
  word-break: break-word;
}

.lyric-line.active {
  opacity: 1;
  font-size: 17px;
  font-weight: 500;
  color: #fb7ebb;
}

.lyric-empty {
  color: rgba(255, 255, 255, 0.75);
  font-size: 16px;
  padding: 120px 0;
}

.lyric-container::-webkit-scrollbar {
  width: 4px;
}

.lyric-container::-webkit-scrollbar-track {
  background: transparent;
}

.lyric-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

:deep(.dark) .lyric-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>
