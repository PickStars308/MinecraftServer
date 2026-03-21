const CryptoJS = require('crypto-js')
const axios = require('axios')
const {URLSearchParams, URL} = require('url')


class ApiRequest {
    constructor() {
        this.domain = 'https://music.163.com'
        this.apiDomain = 'https://interface.music.163.com'
        this.encryptResponse = true
        this.deviceId = this.generateDeviceId()
        this.realIP = this.generateRandomChineseIP()
    }


    generateDeviceId() {
        const hexChars = '0123456789ABCDEF'
        const chars = []
        for (let i = 0; i < 52; i++) {
            const randomIndex = Math.floor(Math.random() * hexChars.length)
            chars.push(hexChars[randomIndex])
        }
        return chars.join('')
    }


    generateRandomChineseIP() {

        const fallback = `116.${this.getRandomInt(25, 94)}.${this.getRandomInt(1, 255)}.${this.getRandomInt(1, 255)}`
        return fallback
    }


    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }


    generateRandomString(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return result
    }


    rsaEncrypt(str, key) {
        const forge = require('node-forge')
        const forgePublicKey = forge.pki.publicKeyFromPem(key)
        const encrypted = forgePublicKey.encrypt(str, 'NONE')
        return forge.util.bytesToHex(encrypted)
    }


    aesEncrypt(text, mode, key, iv, format = 'base64') {
        let encrypted = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(text),
            CryptoJS.enc.Utf8.parse(key),
            {
                iv: CryptoJS.enc.Utf8.parse(iv),
                mode: CryptoJS.mode[mode.toUpperCase()],
                padding: CryptoJS.pad.Pkcs7,
            },
        )
        if (format === 'base64') {
            return encrypted.toString()
        }
        return encrypted.ciphertext.toString().toUpperCase()
    }


    weapi(object) {
        const text = JSON.stringify(object)
        const presetKey = '0CoJUm6Qyw8W8jud'
        const iv = '0102030405060708'
        const base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`

        let secretKey = ''
        for (let i = 0; i < 16; i++) {
            secretKey += base62.charAt(Math.round(Math.random() * 61))
        }

        return {
            params: this.aesEncrypt(
                this.aesEncrypt(text, 'cbc', presetKey, iv),
                'cbc',
                secretKey,
                iv,
            ),
            encSecKey: this.rsaEncrypt(secretKey.split('').reverse().join(''), publicKey),
        }
    }


    createOption(query, crypto = 'weapi') {
        return {
            crypto: query.crypto || crypto,
            cookie: query.cookie || '',
            ua: query.ua || '',
            proxy: query.proxy,
            realIP: query.realIP || this.realIP,
            randomCNIP: query.randomCNIP || false,
            e_r: query.e_r || undefined,
            domain: query.domain || '',
            checkToken: query.checkToken || false,
        }
    }


    processCookie(cookie) {
        if (typeof cookie === 'string') {
            const cookieObj = {}
            cookie.split(';').forEach(item => {
                const [key, value] = item.trim().split('=')
                if (key && value) {
                    cookieObj[key] = value
                }
            })
            return cookieObj
        }
        return cookie || {}
    }


    createHeaders(options, uri) {
        const headers = {}
        const ip = options.realIP || this.realIP

        if (ip) {
            headers['X-Real-IP'] = ip
            headers['X-Forwarded-For'] = ip
        }

        const cookie = this.processCookie(options.cookie)
        headers['Referer'] = options.domain || this.domain
        headers['User-Agent'] = options.ua || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'

        return headers
    }


    async request(uri, data, options) {
        const headers = this.createHeaders(options, uri)
        let url = ''
        let encryptData = {}
        const crypto = options.crypto || 'weapi'

        switch (crypto) {
            case 'weapi':
                encryptData = this.weapi(data)

                if (uri.startsWith('/api/')) {
                    url = (options.domain || this.domain) + '/weapi/' + uri.substr(5)
                } else {
                    url = (options.domain || this.domain) + '/weapi' + uri
                }
                break
            default:
                url = (options.domain || this.domain) + uri
                encryptData = data
                break
        }

        const settings = {
            method: 'POST',
            url: url,
            headers: headers,
            data: new URLSearchParams(encryptData).toString(),
        }

        try {
            const res = await axios(settings)
            const answer = {
                status: res.status,
                body: res.data,
                cookie: (res.headers['set-cookie'] || []).map((x) =>
                    x.replace(/\s*Domain=[^(;|$)]+;*/, ''),
                ),
            }

            if (answer.body.code) {
                answer.body.code = Number(answer.body.code)
            }

            return answer
        } catch (error) {
            return {
                status: 502,
                body: {code: 502, msg: error.message || error.toString()},
                cookie: [],
            }
        }
    }


    async getPlaylistDetail(playlistId, cookie = '') {
        const data = {
            id: playlistId,
            n: 100000,
            s: 8,
        }
        const options = this.createOption({cookie})
        return this.request(`/api/v6/playlist/detail`, data, options)
    }
}

module.exports = ApiRequest
