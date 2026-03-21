const axios = require('axios')
const CryptoJS = require('crypto-js')


function generateRequestId() {
    return `${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`
}


function generateWNMCID() {
    const characters = 'abcdefghijklmnopqrstuvwxyz'
    let randomString = ''
    for (let i = 0; i < 6; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return `${randomString}.${Date.now().toString()}.01.0`
}


function generateDeviceId() {
    const hexChars = '0123456789ABCDEF'
    const chars = []
    for (let i = 0; i < 52; i++) {
        const randomIndex = Math.floor(Math.random() * hexChars.length)
        chars.push(hexChars[randomIndex])
    }
    return chars.join('')
}


function processCookieObject(cookie, uri) {
    const _ntes_nuid = CryptoJS.lib.WordArray.random(32).toString()
    const os = {
        os: 'pc',
        appver: '3.1.17.204416',
        osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
        channel: 'netease',
    }

    const processedCookie = {
        ...cookie,
        __remember_me: 'true',
        ntes_kaola_ad: '1',
        _ntes_nuid: cookie._ntes_nuid || _ntes_nuid,
        _ntes_nnid: cookie._ntes_nnid || `${_ntes_nuid},${Date.now().toString()}`,
        WNMCID: cookie.WNMCID || generateWNMCID(),
        WEVNSM: cookie.WEVNSM || '1.0.0',
        osver: cookie.osver || os.osver,
        deviceId: cookie.deviceId || generateDeviceId(),
        os: cookie.os || os.os,
        channel: cookie.channel || os.channel,
        appver: cookie.appver || os.appver,
    }

    if (uri.indexOf('login') === -1) {
        processedCookie['NMTID'] = CryptoJS.lib.WordArray.random(16).toString()
    }

    return processedCookie
}


function createHeaderCookie(header) {
    const cookieParts = []
    for (const key in header) {
        if (header.hasOwnProperty(key)) {
            cookieParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(header[key]))
        }
    }
    return cookieParts.join('; ')
}


async function sendRequest(url, data = {}, options = {}) {
    const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
        'Referer': 'https://music.163.com/',
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    const requestOptions = {
        method: options.method || 'POST',
        url: url,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        data: typeof data === 'object' ? new URLSearchParams(data).toString() : data,
    }

    try {
        const response = await axios(requestOptions)

        const cookieArray = (response.headers['set-cookie'] || []).map((x) =>
            x.replace(/\s*Domain=[^(;|$)]+;*/, '')
        )

        const cookie = cookieArray.join('; ')
        return {
            status: response.status,
            body: response.data,
            cookie: cookie
        }
    } catch (error) {
        console.error('请求失败:', error.message)
        throw error
    }
}

async function neteaseApiRequest(endpoint, data = {}, options = {}, retryCount = 0) {
    const url = `https://music.163.com${endpoint}`

    try {
        const result = await sendRequest(url, data, options)


        if ((result.code === -447 || result.code === 400) && retryCount < 2) {
            console.warn(`⚠️ 网易云 API 返回服务器忙碌，第 ${retryCount + 1} 次重试...`)

            await new Promise(resolve => setTimeout(resolve, 500))
            return neteaseApiRequest(endpoint, data, options, retryCount + 1)
        }

        return result
    } catch (error) {
        console.error('请求失败:', error.message)
        throw error
    }
}

module.exports = {
    sendRequest,
    neteaseApiRequest,
    generateRequestId,
    generateDeviceId,
    generateWNMCID,
    processCookieObject,
    createHeaderCookie,
}
