<script lang="ts" setup>
import {computed} from 'vue'
import type {PlayMode, Track} from '@/stores/musicPlayer'

const props = defineProps<{
  isPlaying: boolean
  currentTrack?: Track
  currentTime?: number
  duration?: number
  playMode?: PlayMode
  showLyrics?: boolean
}>()

const emit = defineEmits<{
  togglePlay: []
  playPrevious: []
  playNext: []
  seek: [time: number]
  togglePlayMode: []
  toggleLyrics: []
}>()

const displayDuration = computed(() => Math.max(0, props.duration ?? props.currentTrack?.duration ?? 0))
const displayCurrentTime = computed(() => Math.max(0, props.currentTime ?? 0))

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function seek(event: Event) {
  const target = event.target as HTMLInputElement
  emit('seek', Number(target.value))
}

function getPlayModeTitle() {
  const modeMap: Record<PlayMode, string> = {
    sequence: '顺序播放',
    repeat: '单曲循环',
    shuffle: '随机播放',
  }

  return modeMap[props.playMode || 'sequence']
}
</script>

<template>
  <div class="player-section">
    <div class="disc-container">
      <div :class="{ playing: isPlaying }" class="large-disc">
        <img v-if="props.currentTrack?.cover" :src="props.currentTrack.cover" alt="专辑封面" class="album-cover"/>
      </div>

      <div class="track-info-center">
        <div v-if="props.currentTrack" class="track-name-large">{{ props.currentTrack.name }} -
          {{ props.currentTrack.artist }}
        </div>
        <div v-else class="track-name-large">请选择歌曲</div>
        <div v-if="props.currentTrack?.album" class="track-album">{{ props.currentTrack.album }}</div>
      </div>
    </div>

    <div class="progress-container">
      <span class="time-text">{{ formatTime(displayCurrentTime) }}</span>
      <input
          :max="Math.max(displayDuration, 1)"
          :min="0"
          :value="displayCurrentTime"
          class="progress-bar"
          type="range"
          @input.stop="seek"
      />
      <span class="time-text">{{ formatTime(displayDuration) }}</span>
    </div>

    <div class="controls-large">
      <button :title="showLyrics ? '隐藏歌词' : '显示歌词'" class="control-btn-large"
              @click.stop="emit('toggleLyrics')">
        <svg class="icon" height="24"
             viewBox="0 0 1024 1024" width="24" xmlns="http://www.w3.org/2000/svg">
          <path
              d="M512 0c282.766222 0 512 229.233778 512 512s-229.233778 512-512 512S0 794.766222 0 512 229.233778 0 512 0z m0 64C264.590222 64 64 264.590222 64 512S264.590222 960 512 960 960 759.409778 960 512 759.409778 64 512 64z m262.826667 183.694222V727.04c0 29.411556-6.883556 43.804444-25.656889 51.313778-20.024889 8.135111-53.191111 8.760889-103.879111 8.760889-2.503111-12.515556-9.386667-34.417778-15.644445-46.307556 38.172444 1.877333 75.093333 1.251556 86.357334 0.625778 10.638222 0 14.392889-3.754667 14.392888-14.392889V290.872889h-300.373333V247.694222H774.826667z m-408.007111 163.953778v263.452444l64.455111-45.056c3.128889 12.515556 10.012444 30.037333 13.767111 38.798223-98.929778 73.898667-118.414222 88.206222-128.142222 100.209777l-1.393778 1.792c-5.006222-9.386667-18.147556-25.031111-26.282667-31.914666 11.889778-9.386667 33.792-32.540444 33.792-63.829334v-219.022222H230.4v-44.430222h136.419556z m288.483555 43.804444v198.997334H512v41.927111h-41.927111v-240.924445h185.230222z m-41.927111 40.049778H512v118.272h101.376V495.502222z m71.964444-142.677333v40.049778h-239.672888v-40.049778h239.672888zM297.984 235.804444c33.166222 28.16 75.719111 66.958222 95.744 92.615112l-31.288889 32.540444c-18.773333-26.282667-60.700444-67.584-94.492444-96.369778z"
          ></path>
        </svg>
      </button>

      <button class="control-btn-large" title="上一首" @click.stop="emit('playPrevious')">
        <svg fill="currentColor" height="28" viewBox="0 0 24 24" width="28">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
        </svg>
      </button>

      <button class="control-btn-large play-btn-large" title="播放或暂停" @click.stop="emit('togglePlay')">
        <svg v-if="isPlaying" fill="currentColor" height="32" viewBox="0 0 24 24" width="32">
          <path d="M6 19h4V5H6v14zm8-14v14h4V6h-4z"/>
        </svg>
        <svg v-else fill="currentColor" height="32" viewBox="0 0 24 24" width="32">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>

      <button class="control-btn-large" title="下一首" @click.stop="emit('playNext')">
        <svg fill="currentColor" height="28" viewBox="0 0 24 24" width="28">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>
      </button>

      <button :title="getPlayModeTitle()" class="control-btn-large" @click.stop="emit('togglePlayMode')">
        <!-- 顺序播放图标 -->
        <svg v-if="playMode === 'sequence'" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <!-- 单曲循环图标 -->
        <svg v-else-if="playMode === 'repeat'" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
        </svg>
        <!-- 随机播放图标（修复缺角问题） -->
        <svg v-else class="icon" height="24"
             viewBox="0 0 1024 1024" width="24" xmlns="http://www.w3.org/2000/svg">
          <path
              d="M768 763.008V682.666667l213.333333 128-213.333333 128v-89.173334a384 384 0 0 1-298.538667-228.906666L469.333333 620.373333l-0.128 0.256A384 384 0 0 1 116.266667 853.333333H85.333333v-85.333333h30.933334a298.666667 298.666667 0 0 0 274.517333-181.034667L422.912 512l-32.128-74.965333A298.666667 298.666667 0 0 0 116.266667 256H85.333333V170.666667h30.933334a384 384 0 0 1 352.938666 232.746666L469.333333 403.626667l0.128-0.256A384 384 0 0 1 768 174.506667V85.333333l213.333333 128-213.333333 128V260.992a298.666667 298.666667 0 0 0-220.117333 176.042667L515.754667 512l32.128 74.965333A298.666667 298.666667 0 0 0 768 763.008z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.player-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.disc-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
}

.large-disc {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5),
  inset 0 0 20px rgba(0, 0, 0, 0.8);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  overflow: hidden;

  .album-cover {
    position: absolute;
    width: 60%;
    height: 60%;
    border-radius: 50%;
    object-fit: cover;
    z-index: 2;
  }

  &::before {
    content: '';
    position: absolute;
    width: 90%;
    height: 90%;
    border-radius: 50%;
    background: repeating-radial-gradient(
            circle at center,
            transparent 0px,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 3px
    );
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    width: 20%;
    height: 20%;
    border-radius: 50%;
    background: #1a1a1a;
    z-index: 3;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8),
    0 1px 2px rgba(255, 255, 255, 0.1);
  }

  &.playing {
    animation: rotateDisc 8s linear infinite;
  }
}

@keyframes rotateDisc {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.track-info-center {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-name-large {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.track-artist {
  font-size: 1rem;
  color: #fff;
  opacity: 0.8;
}

.track-album {
  font-size: 0.875rem;
  color: #fff;
  opacity: 0.6;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 8px;
}

.time-text {
  font-size: 0.875rem;
  color: #fff;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
  min-width: 45px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fb7ebb;
    box-shadow: 0 4px 12px rgba(251, 126, 187, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 6px 16px rgba(251, 126, 187, 0.6);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fb7ebb;
    box-shadow: 0 4px 12px rgba(251, 126, 187, 0.4);
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 6px 16px rgba(251, 126, 187, 0.6);
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.controls-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.control-btn-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--color-text-black);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg {
    fill: #fff;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.play-btn-large {
  width: 72px;
  height: 72px;
  background: #fb7ebb;
  border: none;
  box-shadow: 0 8px 24px rgba(251, 126, 187, 0.4);

  svg {
    fill: #fff;
  }

  &:hover {
    background: #e66da8;
    box-shadow: 0 12px 32px rgba(251, 126, 187, 0.5);
    transform: scale(1.12);
  }
}

html[data-theme='dark'] .track-name-large {
  color: #f1f5f9;
}

html[data-theme='dark'] .track-artist {
  color: #94a3b8;
}

html[data-theme='dark'] .track-album {
  color: #64748b;
}

html[data-theme='dark'] .time-text {
  color: #cbd5e1;
}

html[data-theme='dark'] .control-btn-large {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

html[data-theme='dark'] .control-btn-large:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}

html[data-theme='dark'] .progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

html[data-theme='dark'] .progress-bar:hover {
  background: rgba(255, 255, 255, 0.15);
}

html[data-theme='dark'] .large-disc::after {
  background: #163779;
  box-shadow: 0 4px 15px rgba(22, 55, 121, 0.5),
  inset 0 2px 5px rgba(255, 255, 255, 0.15);
}

html[data-theme='dark'] .progress-bar::-webkit-slider-thumb {
  background: #163779;
  box-shadow: 0 4px 12px rgba(22, 55, 121, 0.5);
}

html[data-theme='dark'] .progress-bar::-webkit-slider-thumb:hover {
  box-shadow: 0 6px 16px rgba(22, 55, 121, 0.7);
}

html[data-theme='dark'] .progress-bar::-moz-range-thumb {
  background: #163779;
  box-shadow: 0 4px 12px rgba(22, 55, 121, 0.5);
}

html[data-theme='dark'] .progress-bar::-moz-range-thumb:hover {
  box-shadow: 0 6px 16px rgba(22, 55, 121, 0.7);
}

html[data-theme='dark'] .play-btn-large {
  background: #163779;
  box-shadow: 0 8px 24px rgba(22, 55, 121, 0.5);
}

html[data-theme='dark'] .play-btn-large:hover {
  background: #132f66;
  box-shadow: 0 12px 32px rgba(22, 55, 121, 0.7);
}
</style>
