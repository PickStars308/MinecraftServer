import axios from 'axios'
import {generateAuthToken} from '@/utils/cryptoUtils'

export function getEncodedToken() {
    return encodeURIComponent(generateAuthToken())
}

export async function checkLoginStatus() {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/netease/check', {
        params: {token: getEncodedToken()},
        withCredentials: true,
    })
    return response.data
}

export async function getLoginQr(platform: string = 'pc') {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/netease/login/qr', {
        params: {platform, token: getEncodedToken()},
        withCredentials: true,
    })
    return response.data
}

export async function checkQrLoginStatus(key: string) {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/netease/login/status', {
        params: {key, token: getEncodedToken()},
        withCredentials: true,
    })
    return response.data
}

export async function logout() {
    const response = await axios.post(
        import.meta.env.VITE_API_BASE_URL + '/api/netease/logout',
        {},
        {
            params: {token: getEncodedToken()},
            withCredentials: true,
        },
    )
    return response.data
}

export async function getUserPlaylist(uid: string, limit: number = 30, offset: number = 0) {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/netease/music/playlist', {
        params: {
            uid,
            token: getEncodedToken(),
            limit,
            offset,
        },
        withCredentials: true,
    })
    return response.data
}

export async function getPlaylistDetail(id: string | number) {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/netease/music/playlist/detail', {
        params: {
            id,
            token: getEncodedToken(),
        },
        withCredentials: true,
    })
    return response.data
}

export async function getMusicUrl(id: string | number, level: string = 'standard') {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/netease/music/music/url', {
        params: {
            id,
            level,
            token: getEncodedToken(),
        },
        withCredentials: true,
    })
    return response.data
}

export async function getLyric(id: string | number) {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/netease/music/music/lyric', {
        params: {
            id,
            token: getEncodedToken(),
        },
        withCredentials: true,
    })
    return response.data
}
