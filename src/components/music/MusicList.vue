<script lang="ts" setup>
import {computed, ref} from 'vue'
import type {Track} from '@/stores/musicPlayer'

const props = defineProps<{
  playlist: Track[]
  currentTrackIndex: number
  isPlaying?: boolean
}>()

const emit = defineEmits<{
  setCurrentTrack: [index: number]
}>()

const searchKeyword = ref('')

const filteredPlaylist = computed(() => {
  let result = props.playlist

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter((track) => {
      return (
          track.name.toLowerCase().includes(keyword) ||
          track.artist.toLowerCase().includes(keyword) ||
          track.album.toLowerCase().includes(keyword)
      )
    })
  }

  return result
})
</script>

<template>
  <div class="music-list-section">
    <div class="list-controls">
      <div class="search-box">
        <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索歌曲、歌手或专辑..."
            type="text"
        />
      </div>
    </div>

    <div class="music-list">
      <div
          v-for="(track, index) in filteredPlaylist"
          :key="track.id || index"
          :class="{ active: props.playlist.indexOf(track) === currentTrackIndex }"
          class="music-list-item"
          @click="emit('setCurrentTrack', props.playlist.indexOf(track))"
      >
        <div class="list-item-info">
          <span class="item-name">{{ track.name }}</span>
          <span class="item-artist">{{ track.artist }}</span>
          <span v-if="track.album" class="item-album">{{ track.album }}</span>
        </div>

        <svg
            v-if="props.playlist.indexOf(track) === currentTrackIndex"
            class="playing-icon"
            fill="currentColor"
            height="20"
            viewBox="0 0 24 24"
            width="20"
        >
          <path v-if="props.isPlaying" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          <path v-else d="M8 5v14l11-7z"/>
        </svg>
      </div>

      <div v-if="filteredPlaylist.length === 0" class="empty-state">
        <p>没有找到匹配的歌曲</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.music-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-black);
  margin: 0 0 16px 0;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.music-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.music-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
  }

  &.active {
    background: rgba(251, 126, 187, 0.15);
    border-color: rgba(251, 126, 187, 0.3);
  }
}

.list-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 0.8rem;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-album {
  font-size: 0.75rem;
  opacity: 0.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.search-box {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.playing-icon {
  flex-shrink: 0;
  color: #fff;
}

html[data-theme='dark'] .section-title {
  color: #f1f5f9;
}

html[data-theme='dark'] .music-list-item {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.06);
}

html[data-theme='dark'] .music-list-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

html[data-theme='dark'] .music-list-item.active {
  background: rgba(22, 55, 121, 0.2);
  border-color: rgba(22, 55, 121, 0.4);
}

html[data-theme='dark'] .item-name {
  color: #f1f5f9;
}

html[data-theme='dark'] .item-artist {
  color: #94a3b8;
}

html[data-theme='dark'] .item-album {
  color: #64748b;
}

html[data-theme='dark'] .search-input {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.06);
  }
}

html[data-theme='dark'] .empty-state {
  color: rgba(255, 255, 255, 0.3);
}

html[data-theme='dark'] .playing-icon {
  color: #f1f5f9;
}
</style>
