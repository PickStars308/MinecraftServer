<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  checkLoginStatus,
  checkQrLoginStatus,
  getEncodedToken,
  getLoginQr,
  getLyric,
  getMusicUrl,
  getPlaylistDetail,
  logout,
} from '@/api/neteaseApi'
import {checkAdminSession} from '@/api/adminAuthApi'
import LoginModal from '@/components/music/LoginModal.vue'
import LyricsDisplay from '@/components/music/LyricsDisplay.vue'
import MusicConfigPanel from '@/components/music/MusicConfigPanel.vue'
import MusicList from '@/components/music/MusicList.vue'
import PlayerControls from '@/components/music/PlayerControls.vue'
import {type TimedLyricLine, type Track, useMusicPlayerStore} from '@/stores/musicPlayer'
import useSiteConfigStore from '@/stores/siteConfig'
import axios from 'axios'

type UserProfile = {
  userId: string
  nickname: string
  avatarUrl: string
  backgroundUrl: string
}

const musicStore = useMusicPlayerStore()
const siteConfigStore = useSiteConfigStore()
const route = useRoute()
const router = useRouter()
const audioRef = ref<HTMLAudioElement | null>(null)

const isClosing = ref(false)
const isLoading = ref(false)
const loadError = ref('')
const showLoginModal = ref(false)
const loginMessage = ref('')
const isScanned = ref(false)
const activeLoginTab = ref('qrcode')
const qrCodeImage = ref('')

const isLoggedIn = ref(false)
const isAdminLoggedIn = ref(false)
const shouldOpenPlayerAfterLogin = ref(false)
const lastNonMusicRoute = ref('/')
const userProfile = ref<UserProfile>({
  userId: '',
  nickname: '',
  avatarUrl: '',
  backgroundUrl: '',
})
const showLyrics = ref(true)

const ENABLE_QR_LOGIN = String(import.meta.env.VITE_ENABLE_QR_LOGIN || 'false').toLowerCase() === 'true'
const AUTO_PLAY = String(import.meta.env.VITE_AUTO_PLAY || 'false').toLowerCase() === 'true'

const playlist = computed(() => musicStore.playlist)
const currentTrack = computed(() => musicStore.currentTrack)
const currentTrackIndex = computed(() => musicStore.currentTrackIndex)
const isPlaying = computed(() => musicStore.isPlaying)
const currentTime = computed(() => musicStore.currentTime)
const duration = computed(() => musicStore.duration)
const isOpen = computed(() => route.meta?.musicOverlay === true)
const isConfigView = computed(() => route.meta?.musicView === 'config')
const configuredPlaylistId = computed(() => String(siteConfigStore.config?.musicPlaylistId || '').trim())


const isMobile = computed(() => window.innerWidth <= 768)

const lyricRequests = new Map<string | number, Promise<TimedLyricLine[]>>()
const urlRequests = new Map<string | number, Promise<string>>()

let qrPollTimer: number | null = null
let qrKey = ''
let activationId = 0

function extractErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (error && typeof error === 'object') {
    const response = (error as any).response?.data
    if (typeof response?.message === 'string' && response.message.trim()) {
      return response.message
    }

    if (typeof (error as any).message === 'string' && (error as any).message.trim()) {
      return (error as any).message
    }
  }

  return fallback
}

function isAuthError(error: unknown) {
  const status = (error as any)?.response?.status
  return status === 401
}

function resetUserProfile() {
  userProfile.value = {
    userId: '',
    nickname: '',
    avatarUrl: '',
    backgroundUrl: '',
  }
}

function updateUserProfile(payload: any) {
  userProfile.value = {
    userId: String(payload?.userId || payload?.profile?.userId || ''),
    nickname: String(payload?.nickname || payload?.profile?.nickname || ''),
    avatarUrl: String(payload?.avatarUrl || payload?.profile?.avatarUrl || ''),
    backgroundUrl: String(payload?.backgroundUrl || payload?.profile?.backgroundUrl || ''),
  }
}

function handleAuthRequired(message = '请先登录网易云音乐') {
  const shouldRestorePlayer = isOpen.value || shouldOpenPlayerAfterLogin.value

  isLoggedIn.value = false
  resetUserProfile()
  loadError.value = message
  loginMessage.value = message
  isClosing.value = false
  shouldOpenPlayerAfterLogin.value = shouldRestorePlayer
  showLoginModal.value = true

  if (isOpen.value) {
    void router.push(lastNonMusicRoute.value || '/')
  }
}

function parseLrc(raw: string) {
  const lines: TimedLyricLine[] = []
  const source = raw.split(/\r?\n/)

  for (const row of source) {
    const line = row.trim()
    if (!line) continue

    const matches = [...line.matchAll(/\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?]/g)]
    if (matches.length === 0) continue

    const text = line.replace(/\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?]/g, '').trim()
    if (!text) continue

    for (const match of matches) {
      const minute = Number(match[1] || 0)
      const second = Number(match[2] || 0)
      const fraction = (match[3] || '0').padEnd(3, '0').slice(0, 3)
      const time = minute * 60_000 + second * 1_000 + Number(fraction)
      lines.push({time, text})
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}

function parseYrc(raw: string) {
  const lines: TimedLyricLine[] = []

  for (const row of raw.split(/\r?\n/)) {
    const line = row.trim()
    if (!line) continue

    const match = line.match(/^\[(\d+),\d+\](.*)$/)
    if (!match) continue

    const time = Number(match[1] || 0)
    const text = (match[2] || '').replace(/\(\d+,\d+,\d+\)/g, '').trim()
    if (!text) continue

    lines.push({time, text})
  }

  return lines.sort((a, b) => a.time - b.time)
}

function parseLyricPayload(payload: any) {
  const yrc = payload?.yrc?.lyric
  if (typeof yrc === 'string' && yrc.trim()) {
    const parsed = parseYrc(yrc)
    if (parsed.length > 0) return parsed
  }

  const lrc = payload?.lrc?.lyric ?? payload?.lyric ?? payload?.klyric?.lyric ?? payload?.tlyric?.lyric
  if (typeof lrc === 'string' && lrc.trim()) {
    return parseLrc(lrc)
  }

  return []
}

function mapTrack(track: any): Track {
  return {
    id: track.id,
    name: track.name || '未知歌曲',
    artist: track.artist || '未知歌手',
    album: track.album || '未知专辑',
    cover: track.coverUrl || track.cover || '',
    duration: Number(track.duration || 0),
    lyric: [],
    url: '',
    urlStatus: 'idle',
    lyricStatus: 'idle',
  }
}

async function safePlay() {
  const audio = audioRef.value
  if (!audio) return false

  try {
    await audio.play()
    musicStore.setIsPlaying(true)
    return true
  } catch (error) {
    musicStore.setIsPlaying(false)
    return false
  }
}

async function ensureTrackUrl(track: Track) {
  if (track.url) {
    return track.url
  }

  const pending = urlRequests.get(track.id)
  if (pending) {
    return pending
  }

  musicStore.patchTrack(track.id, {urlStatus: 'loading'})

  const request = getMusicUrl(track.id)
      .then((response) => {
        const url = typeof response?.data === 'string' ? response.data : ''
        if (!url) {
          throw new Error('当前歌曲暂时无法播放')
        }

        musicStore.patchTrack(track.id, {
          url,
          urlStatus: 'loaded',
        })

        return url
      })
      .catch((error) => {
        musicStore.patchTrack(track.id, {
          url: '',
          urlStatus: 'error',
        })

        if (isAuthError(error)) {
          handleAuthRequired()
        }

        throw error
      })
      .finally(() => {
        urlRequests.delete(track.id)
      })

  urlRequests.set(track.id, request)
  return request
}

async function ensureTrackLyric(track: Track) {
  if (track.lyricStatus === 'loaded') {
    return track.lyric
  }

  const pending = lyricRequests.get(track.id)
  if (pending) {
    return pending
  }

  musicStore.patchTrack(track.id, {lyricStatus: 'loading'})

  const request = getLyric(track.id)
      .then((response) => {
        const lyric = parseLyricPayload(response?.data)

        musicStore.patchTrack(track.id, {
          lyric,
          lyricStatus: 'loaded',
        })

        return lyric
      })
      .catch((error) => {
        musicStore.patchTrack(track.id, {
          lyric: [],
          lyricStatus: 'error',
        })

        if (isAuthError(error)) {
          handleAuthRequired()
        }

        throw error
      })
      .finally(() => {
        lyricRequests.delete(track.id)
      })

  lyricRequests.set(track.id, request)
  return request
}

function updateCurrentLyricIndex(timeMs: number) {
  const lyrics = currentTrack.value?.lyric ?? []

  if (lyrics.length === 0) {
    musicStore.setCurrentLyricIndex(-1)
    return
  }

  let activeIndex = -1
  for (let index = lyrics.length - 1; index >= 0; index -= 1) {
    if (timeMs >= lyrics[index]!.time) {
      activeIndex = index
      break
    }
  }

  musicStore.setCurrentLyricIndex(activeIndex)
}

async function activateTrack(index: number, autoplay = true) {
  const track = playlist.value[index]
  const audio = audioRef.value

  if (!track || !audio) {
    return
  }

  const requestId = ++activationId

  musicStore.setCurrentTrackIndex(index)
  musicStore.setCurrentTime(0)
  musicStore.setCurrentLyricIndex(-1)
  musicStore.setDuration(track.duration)

  void ensureTrackLyric(track).catch(() => undefined)

  try {
    const url = await ensureTrackUrl(track)

    if (requestId !== activationId || currentTrackIndex.value !== index) {
      return
    }

    if (audio.src !== url) {
      audio.src = url
      audio.load()
    }

    audio.currentTime = 0

    if (autoplay) {
      await safePlay()
    } else {
      audio.pause()
      musicStore.setIsPlaying(false)
    }
  } catch (error) {
    musicStore.setIsPlaying(false)
    loginMessage.value = extractErrorMessage(error, '歌曲加载失败')
  }
}

async function restoreTrackState(index: number, startTimeMs: number, autoplay: boolean) {
  const track = playlist.value[index]
  const audio = audioRef.value

  if (!track || !audio) {
    return
  }

  const requestId = ++activationId
  const restoredTime = Math.max(0, startTimeMs)

  musicStore.restorePlayback(index, restoredTime)
  updateCurrentLyricIndex(restoredTime)

  void ensureTrackLyric(track).catch(() => undefined)

  try {
    const url = await ensureTrackUrl(track)

    if (requestId !== activationId || currentTrackIndex.value !== index) {
      return
    }

    if (audio.src !== url) {
      audio.src = url
      audio.load()
    }

    const applyRestoredTime = () => {
      const durationMs = Number.isFinite(audio.duration) ? Math.floor(audio.duration * 1000) : 0
      const targetTimeMs = durationMs > 0 ? Math.min(restoredTime, Math.max(durationMs - 250, 0)) : restoredTime

      audio.currentTime = targetTimeMs / 1000
      musicStore.setCurrentTime(targetTimeMs)
      updateCurrentLyricIndex(targetTimeMs)
    }

    if (audio.readyState >= 1) {
      applyRestoredTime()
    } else {
      audio.addEventListener('loadedmetadata', applyRestoredTime, {once: true})
    }

    if (autoplay) {
      await safePlay()
    } else {
      audio.pause()
      musicStore.setIsPlaying(false)
    }
  } catch (error) {
    musicStore.setIsPlaying(false)
    loginMessage.value = extractErrorMessage(error, '歌曲恢复失败')
  }
}

async function loadPlaylist() {
  const playlistId = configuredPlaylistId.value

  if (!playlistId) {
    loadError.value = '未配置网易云歌单 ID'
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const hadSavedPlaybackContext =
        musicStore.currentTrackId !== null || musicStore.currentTrackIndex > 0 || musicStore.currentTime > 0

    const response = await getPlaylistDetail(playlistId)
    const tracks = Array.isArray(response?.data?.tracks) ? response.data.tracks.map(mapTrack) : []

    if (tracks.length === 0) {
      throw new Error('歌单为空或没有可用歌曲')
    }

    musicStore.setPlaylist(tracks)
    await ensureTrackLyric(tracks[musicStore.currentTrackIndex]!)

    if (hadSavedPlaybackContext) {
      await restoreTrackState(musicStore.currentTrackIndex, musicStore.currentTime, musicStore.isPlaying)
    } else if (AUTO_PLAY) {
      await activateTrack(musicStore.currentTrackIndex, true)
    }
  } catch (error) {
    const message = extractErrorMessage(error, '歌单加载失败')

    if (isAuthError(error)) {
      handleAuthRequired(message)
    } else {
      loadError.value = message
    }
  } finally {
    isLoading.value = false
  }
}

async function checkAdminLoginStatus() {
  try {
    isAdminLoggedIn.value = await checkAdminSession()
  } catch {
    isAdminLoggedIn.value = false
  }
}

async function syncLoginStatus() {
  try {
    const response = await checkLoginStatus()
    const loggedIn = Boolean(response?.data?.isLoggedIn)

    isLoggedIn.value = loggedIn

    if (loggedIn) {
      updateUserProfile(response?.data)
    } else {
      resetUserProfile()
    }

    if (!loggedIn) {
      loadError.value = '请先登录网易云音乐'
      loginMessage.value = '请先登录网易云音乐'
      showLoginModal.value = false
      return
    }

    showLoginModal.value = false
    loginMessage.value = ''

    if (playlist.value.length === 0) {
      await loadPlaylist()
    }
  } catch (error) {
    const message = extractErrorMessage(error, '无法确认网易云登录状态')

    if (isOpen.value || shouldOpenPlayerAfterLogin.value) {
      handleAuthRequired(message)
      return
    }

    isLoggedIn.value = false
    resetUserProfile()
    loadError.value = message
    loginMessage.value = message
    showLoginModal.value = false
  }
}

async function finalizeLoginSuccess() {
  isLoggedIn.value = true
  showLoginModal.value = false
  loginMessage.value = ''
  stopQrPolling()

  try {
    const response = await checkLoginStatus()
    updateUserProfile(response?.data)
  } catch (_error) {
    resetUserProfile()
  }

  if (playlist.value.length === 0) {
    await loadPlaylist()
  }

  if (shouldOpenPlayerAfterLogin.value) {
    await router.push({name: 'music-player'})
    shouldOpenPlayerAfterLogin.value = false
  }
}

function stopQrPolling() {
  if (qrPollTimer !== null) {
    window.clearInterval(qrPollTimer)
    qrPollTimer = null
  }
}

async function prepareQrLogin() {
  if (!ENABLE_QR_LOGIN) return

  try {
    const response = await getLoginQr('pc')
    qrCodeImage.value = response?.data?.qrimg || ''
    qrKey = response?.data?.key || ''
    isScanned.value = false
    loginMessage.value = '请使用网易云音乐扫码登录'

    stopQrPolling()
    qrPollTimer = window.setInterval(async () => {
      if (!qrKey) return

      try {
        const status = await checkQrLoginStatus(qrKey)
        const code = Number(status?.code || 0)

        if (code === 802) {
          isScanned.value = true
          loginMessage.value = status?.message || '已扫码，请在手机上确认'
          return
        }

        if (code === 803 || status?.success) {
          loginMessage.value = '登录成功，正在加载歌单'
          await finalizeLoginSuccess()
          return
        }

        loginMessage.value = status?.message || '等待扫码中'
      } catch (error) {
        loginMessage.value = extractErrorMessage(error, '二维码登录状态检查失败')
      }
    }, 3000)
  } catch (error) {
    loginMessage.value = extractErrorMessage(error, '二维码生成失败')
  }
}

function handleLoginModalClose() {
  showLoginModal.value = false
  shouldOpenPlayerAfterLogin.value = false
  stopQrPolling()
}

async function handleCookieLogin(cookie: string) {
  try {
    loginMessage.value = '正在登录...'

    const response = await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/netease/login/cookie', {cookie}, {
      params: {token: getEncodedToken()},
      withCredentials: true
    })

    if (response.data.success) {
      loginMessage.value = '登录成功！'
      isLoggedIn.value = true
      showLoginModal.value = false

      if (shouldOpenPlayerAfterLogin.value) {
        void openPlayer()
      }
    } else {
      loginMessage.value = response.data.message || '登录失败'
    }
  } catch (error) {
    console.error('Cookie 登录失败:', error)
    loginMessage.value = '登录失败，请检查 Cookie 是否正确'
  }
}

function handleSwitchToQrCode() {
  activeLoginTab.value = 'qrcode'
  void prepareQrLogin()
}

function handleSwitchToCookie() {
  activeLoginTab.value = 'cookie'
  stopQrPolling()
}

async function openPlayer() {
  if (!isLoggedIn.value) {
    shouldOpenPlayerAfterLogin.value = true
    showLoginModal.value = true
    void prepareQrLogin()
    return
  }

  if (route.name !== 'music-player') {
    await router.push({name: 'music-player'})
  }

  if (playlist.value.length === 0 && !isLoading.value) {
    void loadPlaylist()
  }
}

function closePlayer() {
  if (isClosing.value) return

  isClosing.value = true
  stopQrPolling()
  void router.push(lastNonMusicRoute.value || '/')
}

async function openConfig() {
  if (route.name === 'music-config') {
    await router.push({name: 'music-player'})
    return
  }

  await router.push({name: 'music-config'})
}

async function handleMusicConfigSaved() {
  const audio = audioRef.value

  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }

  musicStore.setPlaylist([])
  loadError.value = ''

  if (isLoggedIn.value) {
    await loadPlaylist()
  }

  await router.push({name: 'music-player'})
}

async function handleMusicLogout() {
  try {
    await logout()
  } catch (error) {
    loginMessage.value = extractErrorMessage(error, '退出登录失败')
    return
  }

  const audio = audioRef.value
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }

  musicStore.resetPlayer()
  isLoggedIn.value = false
  resetUserProfile()
  shouldOpenPlayerAfterLogin.value = true
  loadError.value = '请先登录网易云音乐'
  loginMessage.value = '请先登录网易云音乐'

  await router.push(lastNonMusicRoute.value || '/')
  isClosing.value = false
  showLoginModal.value = true
  void prepareQrLogin()
}

async function togglePlay() {
  const audio = audioRef.value

  if (!audio) return

  if (playlist.value.length === 0) {
    await loadPlaylist()
  }

  if (!currentTrack.value) {
    return
  }

  if (!audio.src) {
    await activateTrack(currentTrackIndex.value, true)
    return
  }

  if (musicStore.isPlaying) {
    audio.pause()
    musicStore.setIsPlaying(false)
    return
  }

  await safePlay()
}

async function playTrack(index: number) {
  await activateTrack(index, true)
}

async function playPrevious() {
  const audio = audioRef.value

  if (audio && musicStore.currentTime > 3000 && musicStore.playMode !== 'shuffle') {
    seek(0)
    return
  }

  const previousIndex = musicStore.getPreviousTrackIndex()
  if (previousIndex >= 0) {
    await activateTrack(previousIndex, true)
  }
}

async function playNext() {
  const nextIndex = musicStore.getNextTrackIndex()
  if (nextIndex >= 0) {
    await activateTrack(nextIndex, true)
  }
}

function seek(time: number) {
  const audio = audioRef.value
  if (!audio) return

  musicStore.seek(time)
  audio.currentTime = time / 1000
}

function togglePlayMode() {
  musicStore.togglePlayMode()
}

function toggleLyrics() {
  showLyrics.value = !showLyrics.value
}

function handleLyricsClick() {

  if (isMobile.value) {

    showLyrics.value = !showLyrics.value
  }
}

function handleTimeUpdate() {
  const audio = audioRef.value
  if (!audio) return

  const timeMs = Math.floor(audio.currentTime * 1000)
  musicStore.setCurrentTime(timeMs)
  updateCurrentLyricIndex(timeMs)
}

function handleLoadedMetadata() {
  const audio = audioRef.value
  const track = currentTrack.value

  if (!audio || !track || !Number.isFinite(audio.duration)) {
    return
  }

  const durationMs = Math.floor(audio.duration * 1000)
  musicStore.setDuration(durationMs)

  if (durationMs > 0 && track.duration !== durationMs) {
    musicStore.patchTrack(track.id, {duration: durationMs})
  }
}

function handleAudioPlay() {
  musicStore.setIsPlaying(true)
}

function handleAudioPause() {
  musicStore.setIsPlaying(false)
}

async function handleAudioEnded() {
  await playNext()
}

function handleAudioError() {
  const track = currentTrack.value
  musicStore.setIsPlaying(false)

  if (track) {
    musicStore.patchTrack(track.id, {
      url: '',
      urlStatus: 'error',
    })
  }
}

watch(
    () => route.fullPath,
    (path) => {
      if (!route.meta?.musicOverlay) {
        lastNonMusicRoute.value = path
      }
    },
    {immediate: true},
)

watch(isOpen, (open) => {
  if (!open) {
    isClosing.value = false
  }
})

watch(
    () => musicStore.volume,
    (volume) => {
      if (audioRef.value) {
        audioRef.value.volume = volume
      }
    },
    {immediate: true},
)

onMounted(async () => {
  if (!siteConfigStore.config) {
    await siteConfigStore.loadConfig()
  }

  await syncLoginStatus()
  await checkAdminLoginStatus()
})

onBeforeUnmount(() => {
  stopQrPolling()
})
</script>

<template>
  <div class="music-player-container">
    <audio ref="audioRef" preload="auto" @ended="handleAudioEnded" @error="handleAudioError"
           @loadedmetadata="handleLoadedMetadata" @pause="handleAudioPause" @play="handleAudioPlay"
           @timeupdate="handleTimeUpdate"/>

    <button :class="{ playing: isPlaying }" class="music-button" @click="openPlayer">
      <svg fill="currentColor" height="28" viewBox="0 0 24 24" width="28">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="player-overlay" @click="closePlayer"></div>
    </Transition>

    <Transition name="slide">
      <div v-if="isOpen" class="player-panel" @click.stop>
        <div class="player-header">
          <h3 class="player-title">{{ isConfigView ? '播放器配置' : '音乐播放器' }}</h3>
          <div class="header-actions">
            <button v-if="isAdminLoggedIn || isConfigView" :title="isConfigView ? '返回播放器' : '播放器配置'"
                    class="config-btn"
                    @click="openConfig">
              <svg v-if="isConfigView" fill="currentColor" height="22" viewBox="0 0 24 24" width="22">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>
              </svg>
              <svg v-else fill="currentColor" height="22" viewBox="0 0 24 24" width="22">
                <path
                    d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.18 7.18 0 0 0-1.63-.94l-.36-2.54a.49.49 0 0 0-.49-.42h-3.84a.49.49 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54c.05.24.25.42.49.42h3.84c.24 0 .44-.18.49-.42l.36-2.54c.58-.23 1.13-.54 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/>
              </svg>
            </button>
            <button class="close-btn" @click="closePlayer">
              <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <Transition mode="out-in" name="panel-swap">
          <div v-if="isConfigView" key="config" class="config-content">
            <MusicConfigPanel :avatar-url="userProfile.avatarUrl" :is-logged-in="isLoggedIn"
                              :nickname="userProfile.nickname" @logout="handleMusicLogout"
                              @saved="handleMusicConfigSaved"/>
          </div>

          <div v-else key="player" :class="{ 'show-lyrics-only': isMobile && showLyrics }" class="player-content">
            <div class="left-section">
              <PlayerControls :current-time="currentTime" :current-track="currentTrack" :duration="duration"
                              :is-playing="isPlaying" :play-mode="musicStore.playMode" :show-lyrics="showLyrics"
                              @seek="seek"
                              @play-next="playNext" @play-previous="playPrevious" @toggle-play="togglePlay"
                              @toggle-play-mode="togglePlayMode" @toggle-lyrics="toggleLyrics"/>

              <div class="music-list-section">
                <h4 class="section-title">播放列表</h4>
                <div v-if="isLoading" class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>正在加载歌单...</p>
                </div>
                <div v-else-if="loadError" class="error-state">
                  <p>{{ loadError }}</p>
                  <button class="retry-btn" @click="loadPlaylist">重试</button>
                </div>
                <MusicList v-else :current-track-index="currentTrackIndex" :is-playing="isPlaying" :playlist="playlist"
                           @set-current-track="playTrack"/>
              </div>
            </div>

            <!-- 整个右侧区域的动画容器 -->
            <Transition :name="isMobile ? 'mobile-fade' : 'pc-slide'" mode="out-in">
              <div v-if="showLyrics" key="right-panel" class="right-section">
                <LyricsDisplay :current-time="currentTime" :current-track="currentTrack || null"
                               @click="handleLyricsClick"/>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </Transition>

    <LoginModal :is-scanned="isScanned" :login-message="loginMessage" :qr-code-image="qrCodeImage"
                :show="showLoginModal" :show-login-info="activeLoginTab === 'qrcode'" @close="handleLoginModalClose"
                @refresh-qr-code="prepareQrLogin" @login-with-cookie="handleCookieLogin"
                @switch-to-qr-code="handleSwitchToQrCode"
                @switch-to-cookie="handleSwitchToCookie"/>
  </div>
</template>

<style lang="scss" scoped>
.music-player-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.music-button {
  width: 60px;
  height: 60px;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--color-text-black);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);

  &:hover {
    transform: scale(1.12);
    background: rgba(255, 255, 255, 0.28);
    box-shadow: 0 14px 48px rgba(0, 0, 0, 0.25);
  }

  svg {
    fill: #fb7ebb;
  }

  &:active {
    transform: scale(1.05);
  }

  &.playing {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 0 16px rgba(255, 255, 255, 0);
  }
}

.player-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-bg-popup);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 1001;
}

.player-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90vh;
  background: rgb(0 0 0 / 16%);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  z-index: 1002;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.player-title {
  color: var(--color-text-black);
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-btn, .close-btn, .lyrics-btn {
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-black);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    fill: var(--color-text-black);
  }
}

.lyrics-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.32);
}

.config-btn:hover {
  background: rgba(251, 126, 187, 0.15);
  border-color: rgba(251, 126, 187, 0.32);
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

.config-content {
  display: flex;
  flex: 1;
}


.player-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-section {
  width: 90%;
  padding: 28px;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 28px;

  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
  border-right 0.4s ease;
}


.player-content:not(:has(.right-section)) .left-section {
  width: 100%;
  border-right: none;
}


.right-section {
  padding: 28px;
  overflow-y: auto;
  box-sizing: border-box;
}


.pc-slide-enter-from {
  transform: translateX(100%);
}

.pc-slide-enter-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.pc-slide-enter-to {
  transform: translateX(0);
}

.pc-slide-leave-from {
  transform: translateX(0);
}

.pc-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.pc-slide-leave-to {
  transform: translateX(100%);
}


.mobile-fade-enter-from,
.mobile-fade-leave-to {
  opacity: 0;
  height: 0 !important;
  padding: 0 28px !important;
  transform: translateY(100%);
}

.mobile-fade-enter-active,
.mobile-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
  height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
  padding 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
  transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.mobile-fade-enter-to,
.mobile-fade-leave-from {
  opacity: 1;
  height: auto !important;
  padding: 28px !important;
  transform: translateY(0);
}

.music-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--color-text-black);
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fb7ebb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #ffffff;
  padding: 40px 20px;
  text-align: center;
}

.retry-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 0.9rem;
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
}


html[data-theme='dark'] .section-title {
  color: #f1f5f9;
}

html[data-theme='dark'] .loading-state,
html[data-theme='dark'] .error-state {
  color: #94a3b8;
}

html[data-theme='dark'] .retry-btn {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
}

html[data-theme='dark'] .retry-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

html[data-theme='dark'] .loading-spinner {
  border-color: rgba(255, 255, 255, 0.2);
  border-top-color: #163779;
}

html[data-theme='dark'] .player-panel {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(226, 232, 240, 0.18);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

html[data-theme='dark'] .music-button {
  background: rgba(30, 41, 59, 0.85);
  border-color: rgba(226, 232, 240, 0.18);
  color: #f1f5f9;
}

html[data-theme='dark'] .music-button:hover {
  background: rgba(30, 41, 59, 1);
}

html[data-theme='dark'] .player-header {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

html[data-theme='dark'] .player-title {
  color: #f1f5f9;
}

html[data-theme='dark'] .config-btn,
html[data-theme='dark'] .close-btn,
html[data-theme='dark'] .lyrics-btn {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

html[data-theme='dark'] .lyrics-btn:hover {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.34);
}

html[data-theme='dark'] .config-btn:hover {
  background: rgba(251, 126, 187, 0.18);
  border-color: rgba(251, 126, 187, 0.34);
}

html[data-theme='dark'] .close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

html[data-theme='dark'] .left-section {
  border-right-color: rgba(255, 255, 255, 0.06);
}

/* 过渡动画效果 */
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.3s ease 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: transform 0.4s ease 0.3s;
}

.slide-leave-active {
  transition: transform 0.4s ease;
}

.slide-enter-from {
  transform: translate(-50%, -50%) translateX(100%);
}

.slide-leave-to {
  transform: translate(-50%, -50%) translateX(-100%);
}


@media (max-width: 768px) {
  .player-panel {
    width: 90%;
    height: 90%;
    position: fixed;
    border-radius: 28px;
  }

  .player-content {
    flex-direction: column;
  }

  .left-section {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    box-sizing: border-box;

    height: 100%;
    opacity: 1;
    padding: 28px;
  }

  .right-section {
    width: 100%;
    border-right: none;
    border-bottom: none;

    height: 0;
    padding: 0 28px;
    opacity: 0;
    overflow: hidden;
    flex: 1;
  }


  .player-content.show-lyrics-only .left-section {
    height: 0 !important;
    padding: 0 28px !important;
    opacity: 0 !important;
    overflow: hidden;
  }

  .player-content.show-lyrics-only .right-section {
    height: 100% !important;
    padding: 28px !important;
    opacity: 1 !important;
  }
}
</style>
