import {defineStore} from 'pinia'

export type RequestStatus = 'idle' | 'loading' | 'loaded' | 'error'
export type PlayMode = 'sequence' | 'repeat' | 'shuffle'

export interface TimedLyricLine {
    time: number
    text: string
}

export interface Track {
    id: string | number
    name: string
    artist: string
    album: string
    cover: string
    duration: number
    lyric: TimedLyricLine[]
    url: string
    urlStatus: RequestStatus
    lyricStatus: RequestStatus
}

interface MusicPlayerState {
    playlist: Track[]
    currentTrackIndex: number
    currentTrackId: string | number | null
    isPlaying: boolean
    currentTime: number
    duration: number
    currentLyricIndex: number
    volume: number
    playMode: PlayMode
}

export const useMusicPlayerStore = defineStore('musicPlayer', {
    state: (): MusicPlayerState => ({
        playlist: [],
        currentTrackIndex: 0,
        currentTrackId: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        currentLyricIndex: 0,
        volume: 1,
        playMode: 'sequence',
    }),

    getters: {
        currentTrack: (state): Track | undefined => state.playlist[state.currentTrackIndex] ?? undefined,
        hasNextTrack: (state): boolean => state.playlist.length > 1,
        hasPreviousTrack: (state): boolean => state.playlist.length > 1,
    },

    actions: {
        setPlaylist(tracks: Track[]) {
            this.playlist = tracks

            if (tracks.length === 0) {
                this.currentTrackIndex = 0
                this.currentTrackId = null
                this.currentTime = 0
                this.duration = 0
                this.currentLyricIndex = 0
                this.isPlaying = false
                return
            }

            if (this.currentTrackId !== null) {
                const restoredIndex = tracks.findIndex((track) => String(track.id) === String(this.currentTrackId))
                if (restoredIndex >= 0) {
                    this.currentTrackIndex = restoredIndex
                }
            }

            if (this.currentTrackIndex >= tracks.length) {
                this.currentTrackIndex = 0
            }

            this.currentTrackId = tracks[this.currentTrackIndex]?.id ?? null
            this.duration = tracks[this.currentTrackIndex]?.duration ?? 0
        },

        patchTrack(trackId: string | number, patch: Partial<Track>) {
            const index = this.playlist.findIndex((track) => track.id === trackId)
            if (index === -1) return

            const currentTrack = this.playlist[index]
            if (!currentTrack) return

            this.playlist[index] = {
                ...currentTrack,
                ...patch,
            }

            if (index === this.currentTrackIndex && typeof patch.duration === 'number' && this.duration <= 0) {
                this.duration = patch.duration
            }
        },

        setCurrentTrackIndex(index: number) {
            if (index < 0 || index >= this.playlist.length) return

            this.currentTrackIndex = index
            this.currentTrackId = this.playlist[index]?.id ?? null
            this.currentTime = 0
            this.currentLyricIndex = 0
            this.duration = this.playlist[index]?.duration ?? 0
        },

        restorePlayback(index: number, currentTime: number) {
            if (index < 0 || index >= this.playlist.length) return

            this.currentTrackIndex = index
            this.currentTrackId = this.playlist[index]?.id ?? null
            this.currentTime = Math.max(0, currentTime)
            this.currentLyricIndex = 0
            this.duration = this.playlist[index]?.duration ?? 0
        },

        setIsPlaying(isPlaying: boolean) {
            this.isPlaying = isPlaying
        },

        setCurrentTime(time: number) {
            this.currentTime = Math.max(0, time)
        },

        setDuration(duration: number) {
            this.duration = Math.max(0, duration)
        },

        setCurrentLyricIndex(index: number) {
            this.currentLyricIndex = index
        },

        setVolume(volume: number) {
            this.volume = Math.max(0, Math.min(1, volume))
        },

        setPlayMode(mode: PlayMode) {
            this.playMode = mode
        },

        togglePlayMode() {
            const modes: PlayMode[] = ['sequence', 'repeat', 'shuffle']
            const currentIndex = modes.indexOf(this.playMode)
            this.playMode = modes[(currentIndex + 1) % modes.length] ?? 'sequence'
        },

        getNextTrackIndex() {
            if (this.playlist.length === 0) return -1

            if (this.playMode === 'repeat') {
                return this.currentTrackIndex
            }

            if (this.playMode === 'shuffle') {
                if (this.playlist.length === 1) return this.currentTrackIndex

                let nextIndex = this.currentTrackIndex
                while (nextIndex === this.currentTrackIndex) {
                    nextIndex = Math.floor(Math.random() * this.playlist.length)
                }
                return nextIndex
            }

            return (this.currentTrackIndex + 1) % this.playlist.length
        },

        getPreviousTrackIndex() {
            if (this.playlist.length === 0) return -1

            if (this.playMode === 'shuffle') {
                if (this.playlist.length === 1) return this.currentTrackIndex

                let prevIndex = this.currentTrackIndex
                while (prevIndex === this.currentTrackIndex) {
                    prevIndex = Math.floor(Math.random() * this.playlist.length)
                }
                return prevIndex
            }

            return (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length
        },

        seek(time: number) {
            this.currentTime = Math.max(0, Math.min(time, this.duration || time))
        },

        resetPlayer() {
            this.$reset()
        },
    },

    persist: {
        key: 'music-player-preferences',
        storage: localStorage,
        pick: ['volume', 'playMode', 'currentTrackIndex', 'currentTrackId', 'currentTime', 'isPlaying'],
    },
})

export default useMusicPlayerStore
