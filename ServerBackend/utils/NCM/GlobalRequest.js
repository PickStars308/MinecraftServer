const axios = require('axios')
const CryptoJS = require('crypto-js')
const {URLSearchParams, URL} = require('url')


function generateDeviceId() {
    const hexChars = '0123456789ABCDEF'
    const chars = []
    for (let i = 0; i < 52; i++) {
        const randomIndex = Math.floor(Math.random() * hexChars.length)
        chars.push(hexChars[randomIndex])
    }
    return chars.join('')
}


function generateRequestId() {
    return `${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`
}


function generateRandomChineseIP() {
    return `116.${Math.floor(Math.random() * 70) + 25}.${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255) + 1}`
}


function cookieToJson(cookie) {
    if (!cookie) return {}
    let cookieArr = cookie.split(';')
    let obj = {}
    for (let i = 0, len = cookieArr.length; i < len; i++) {
        let item = cookieArr[i]
        let arr = item.split('=')
        if (arr.length === 2) {
            obj[arr[0].trim()] = arr[1].trim()
        }
    }
    return obj
}

function cookieObjToString(cookie) {
    const cookieKeys = Object.keys(cookie)
    const result = []
    for (let i = 0, len = cookieKeys.length; i < len; i++) {
        const key = cookieKeys[i]
        result[i] = `${encodeURIComponent(key)}=${encodeURIComponent(cookie[key])}`
    }
    return result.join('; ')
}


function processCookieObject(cookie) {
    const _ntes_nuid = CryptoJS.lib.WordArray.random(32).toString()
    const now = Date.now()

    const processedCookie = {
        ...cookie,
        __remember_me: 'true',
        ntes_kaola_ad: '1',
        _ntes_nuid: cookie._ntes_nuid || _ntes_nuid,
        _ntes_nnid: cookie._ntes_nnid || `${_ntes_nuid},${now.toString()}`,
        WNMCID: cookie.WNMCID || generateWNMCID(),
        WEVNSM: cookie.WEVNSM || '1.0.0',
        osver: cookie.osver || '14',
        deviceId: cookie.deviceId || generateDeviceId(),
        os: cookie.os || 'android',
        channel: cookie.channel || 'xiaomi',
        appver: cookie.appver || '8.20.20.231215173437',
    }

    if (!processedCookie.MUSIC_U) {
        processedCookie.MUSIC_A = processedCookie.MUSIC_A || ''
    }

    return processedCookie
}


function generateWNMCID() {
    const characters = 'abcdefghijklmnopqrstuvwxyz'
    let randomString = ''
    for (let i = 0; i < 6; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return `${randomString}.${Date.now().toString()}.01.0`
}


function createHeaderCookie(header) {
    const headerKeys = Object.keys(header)
    const cookieParts = new Array(headerKeys.length)

    for (let i = 0, len = headerKeys.length; i < len; i++) {
        const key = headerKeys[i]
        cookieParts[i] = encodeURIComponent(key) + '=' + encodeURIComponent(header[key])
    }

    return cookieParts.join('; ')
}


class GlobalRequest {
    constructor(options = {}) {
        this.defaultOptions = {
            domain: 'https://music.163.com',
            apiDomain: 'https://interface.music.163.com',
            crypto: 'api',
            ua: 'NeteaseMusic/9.1.65.240927161425(9001065);Dalvik/2.1.0 (Linux; U; Android 14; 23013RK75C Build/UKQ1.230804.001)',
            randomCNIP: false,
            ...options
        }
    }


    async request(uri, data = {}, options = {}) {
        const mergedOptions = {...this.defaultOptions, ...options}
        const headers = mergedOptions.headers ? {...mergedOptions.headers} : {}


        const ip = mergedOptions.realIP || mergedOptions.ip || (mergedOptions.randomCNIP ? generateRandomChineseIP() : '')
        if (ip) {
            headers['X-Real-IP'] = ip
            headers['X-Forwarded-For'] = ip
        }


        let cookie = mergedOptions.cookie || {}
        if (typeof cookie === 'string') {
            cookie = cookieToJson(cookie)
        }

        if (typeof cookie === 'object') {
            cookie = processCookieObject(cookie)
            headers['Cookie'] = cookieObjToString(cookie)
        }


        let url = ''
        let encryptData = data
        const csrfToken = cookie['__csrf'] || ''


        switch (mergedOptions.crypto) {
            case 'api':

                const header = {
                    osver: cookie.osver,
                    deviceId: cookie.deviceId,
                    os: cookie.os,
                    appver: cookie.appver,
                    versioncode: cookie.versioncode || '140',
                    mobilename: cookie.mobilename || '',
                    buildver: cookie.buildver || Date.now().toString().substr(0, 10),
                    resolution: cookie.resolution || '1920x1080',
                    __csrf: csrfToken,
                    channel: cookie.channel,
                    requestId: generateRequestId(),
                }

                if (cookie.MUSIC_U) header['MUSIC_U'] = cookie.MUSIC_U
                if (cookie.MUSIC_A) header['MUSIC_A'] = cookie.MUSIC_A

                headers['Cookie'] = createHeaderCookie(header)
                headers['User-Agent'] = mergedOptions.ua

                url = (mergedOptions.domain || mergedOptions.apiDomain) + uri
                break

            default:
                url = (mergedOptions.domain || mergedOptions.apiDomain) + uri
                headers['User-Agent'] = mergedOptions.ua
                break
        }


        const settings = {
            method: 'POST',
            url: url,
            headers: headers,
            data: new URLSearchParams(encryptData).toString(),
        }


        if (mergedOptions.proxy) {
            try {
                const purl = new URL(mergedOptions.proxy)
                if (purl.hostname) {
                    settings.proxy = mergedOptions.proxy
                }
            } catch (e) {
                console.error('代理URL解析失败:', e.message)
            }
        }

        try {
            const res = await axios(settings)
            const body = res.data
            const cookie = (res.headers['set-cookie'] || []).map((x) =>
                x.replace(/\s*Domain=[^(;|$)]+;*/, '')
            )

            return {
                status: res.status,
                body: typeof body === 'object' ? body : JSON.parse(body.toString()),
                cookie: cookie
            }
        } catch (err) {
            return {
                status: 502,
                body: {code: 502, msg: err.message || err},
                cookie: []
            }
        }
    }


    async getLyric(id, options = {}) {
        const data = {
            id: id,
            cp: false,
            tv: 0,
            lv: 0,
            rv: 0,
            kv: 0,
            yv: 0,
            ytv: 0,
            yrv: 0,
        }

        return this.request('/api/song/lyric/v1', data, options)
    }


    async getSongUrl(id, level = 'standard', options = {}) {
        const data = {
            ids: '[' + id + ']',
            level: level,
            encodeType: 'flac',
        }

        if (level === 'sky') {
            data.immerseType = 'c51'
        }

        return this.request('/api/song/enhance/player/url/v1', data, options)
    }
}


module.exports = GlobalRequest
