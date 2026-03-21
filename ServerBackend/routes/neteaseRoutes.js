const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const {neteaseApiRequest} = require('../utils/NCM/NCMAPI');
const {caesarDecrypt, aesDecrypt, caesarEncrypt, aesEncrypt} = require('../utils/cryptoUtils');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');

const COOKIE_JSON_PATH = path.join(__dirname, '../config/music/cookie.json');

/**
 * 检查是否已登录（根据 cookie.json 中的 cookie 字段）
 */
function isLoggedIn() {
    try {
        const config = JSON.parse(fs.readFileSync(COOKIE_JSON_PATH, 'utf-8'));
        return config.cookie && config.cookie.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * 读取 Cookie JSON 文件
 */
async function getCookieJson() {
    try {
        const data = await fsPromises.readFile(COOKIE_JSON_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {

        return {cookie: '', userId: '', nickname: '', avatarUrl: '', backgroundUrl: ''};
    }
}

/**
 * 更新 Cookie JSON 文件（自动创建目录和文件）
 * @param {Object} data - 要写入的 Cookie 数据
 * @returns {boolean} - 写入是否成功
 */
async function updateCookieJson(data) {
    try {

        const dirPath = path.dirname(COOKIE_JSON_PATH);


        await fsPromises.mkdir(dirPath, {recursive: true});


        await fsPromises.writeFile(COOKIE_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');

        return true;
    } catch (error) {
        console.error('更新 Cookie JSON 文件失败：', error.message);
        return false;
    }
}

/**
 * 清除登录状态
 */
async function clearLoginStatus() {
    return updateCookieJson({
        cookie: '',
        userId: '',
        nickname: '',
        avatarUrl: '',
        backgroundUrl: ''
    });
}

function decodeStoredCookie(encryptedCookie) {
    if (!encryptedCookie || typeof encryptedCookie !== 'string') {
        return '';
    }

    const caesarDecrypted = caesarDecrypt(encryptedCookie);
    if (!caesarDecrypted) {
        return '';
    }

    return aesDecrypt(caesarDecrypted) || '';
}

async function fetchCurrentUserProfile(cookie) {
    if (!cookie) {
        return null;
    }

    const result = await neteaseApiRequest('/api/nuser/account/get', {}, {
        headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
            'Referer': 'https://music.163.com/'
        },
        cookie: cookie
    });

    if (result.body.code !== 200) {
        return null;
    }

    return {
        userId: result.account?.id || result.profile?.userId || '',
        nickname: result.profile?.nickname || '',
        avatarUrl: result.profile?.avatarUrl || '',
        backgroundUrl: result.profile?.backgroundUrl || ''
    };
}

async function ensureCookieProfile(config) {
    if (!config?.cookie) {
        return config;
    }

    if (config.nickname && config.avatarUrl) {
        return config;
    }

    const decodedCookie = decodeStoredCookie(config.cookie);
    if (!decodedCookie) {
        return config;
    }

    try {
        const profile = await fetchCurrentUserProfile(decodedCookie);
        if (!profile) {
            return config;
        }

        const nextConfig = {
            ...config,
            userId: profile.userId || config.userId || '',
            nickname: profile.nickname || config.nickname || '',
            avatarUrl: profile.avatarUrl || config.avatarUrl || '',
            backgroundUrl: profile.backgroundUrl || config.backgroundUrl || ''
        };

        await updateCookieJson(nextConfig);
        return nextConfig;
    } catch (error) {
        return config;
    }
}

/**
 * Token 验证中间件
 */
const authMiddleware = async (req, res, next) => {
    try {
        let {token} = req.query;
        if (!token) {
            ;
            return res.status(401).json({
                success: false,
                message: '未授权访问 - 缺少 token'
            });
        }

        token = decodeURIComponent(token);
        const decryptedAesToken = aesDecrypt(token);
        const finalToken = caesarDecrypt(decryptedAesToken);

        if (finalToken !== process.env.CAESAR_VALID_TOKEN) {
            console.warn('[AuthMiddleware] Token 验证失败:', {
                received: finalToken,
                expected: process.env.CAESAR_VALID_TOKEN
            });
            return res.status(401).json({
                success: false,
                message: '未授权访问 - Token 无效'
            });
        }

        next();
    } catch (err) {

        return res.status(401).json({
            success: false,
            message: '未授权访问',
            error: process.env.NODE_ENV === 'development' ? err.message : ''
        });
    }
};

/**
 * 生成chainId的函数
 */
function generateChainId(cookie) {
    const version = 'v1';
    const randomNum = Math.floor(Math.random() * 1e6);
    const deviceId = getCookieValue(cookie, 'sDeviceId') || 'unknown-' + randomNum;
    const platform = 'pc';
    const action = 'login';
    const timestamp = Date.now();

    return `${version}_${deviceId}_${platform}_${action}_${timestamp}`;
}

/**
 * 从 cookie 字符串中获取指定值的辅助函数
 */
function getCookieValue(cookieStr, name) {
    if (!cookieStr) return '';

    const cookies = '; ' + cookieStr;
    const parts = cookies.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

/**
 * 发送请求获取二维码key
 */
async function getLoginQrKey() {
    try {
        return await neteaseApiRequest('/api/login/qrcode/unikey', {type: 3});
    } catch (error) {
        throw error;
    }
}

/**
 * 生成登录二维码
 */
async function createLoginQr(platform = 'pc', cookie = '') {
    try {

        const keyResponse = await getLoginQrKey();
        if (keyResponse.body.code !== 200) {
            throw new Error('获取二维码key 失败：' + (keyResponse.body.message || '未知错误'));
        }

        const key = keyResponse.body.unikey || keyResponse.body?.unikey;

        if (!key) {
            throw new Error('获取二维码key 失败：未返回 unikey');
        }


        let url = `https://music.163.com/login?codekey=${key}`;


        if (platform === 'pc') {
            const chainId = generateChainId(cookie);
            url += `&chainId=${chainId}`;
        }


        const qrimg = await QRCode.toDataURL(url);

        return {
            code: 200,
            status: 200,
            body: {
                code: 200,
                data: {
                    qrurl: url,
                    qrimg: qrimg,
                    key: key,
                    cookie: cookie
                },
            },
        };
    } catch (error) {
        return {
            code: 500,
            status: 500,
            body: {
                code: 500,
                message: error.message,
            },
        };
    }
}

/**
 * 检查登录状态
 */
async function checkLoginStatus(key) {
    try {
        return await neteaseApiRequest('/api/login/qrcode/client/login', {key, type: 3});
    } catch (error) {
        throw error;
    }
}

/**
 * 路由：获取登录二维码（需要 token 验证）
 * GET /api/netease/login/qr?token=xxx&platform=pc
 */
router.get('/login/qr', authMiddleware, async (req, res) => {
    try {
        const platform = req.query.platform || 'pc';
        const cookie = req.headers.cookie || '';

        const result = await createLoginQr(platform, cookie);

        if (result.body.code === 200) {

            res.json({
                success: true,
                message: '二维码生成成功',
                data: {
                    qrimg: result.body.data.qrimg,
                    qrurl: result.body.data.qrurl,
                    key: result.body.data.key,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: '二维码生成失败',
                error: result.body.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '生成二维码失败',
            error: error.message,
        });
    }
});

/**
 * 路由：检查登录状态（需要 token 验证）
 * GET /api/netease/login/status?key=xxx&token=xxx
 */
router.get('/login/status', authMiddleware, async (req, res) => {
    try {
        const {key} = req.query;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: '缺少 key 参数',
            });
        }

        const status = await checkLoginStatus(key);

        const statusMap = {
            800: {message: '二维码已过期', success: false},
            801: {message: '等待扫码', success: false},
            802: {message: '二维码已扫码，等待确认', success: false},
            803: {message: '授权中', success: false},
        };

        const statusInfo = statusMap[status.body.code] || {
            message: `未知状态：${status.code}`,
            success: false
        };


        if (status.body.code === 803 && status.body.data && status.body.data.cookie) {

            const {aesEncrypt, caesarEncrypt} = require('../utils/cryptoUtils');
            const cookieHeader = status.cookie || '';
            const encryptedCookie = caesarEncrypt(aesEncrypt(cookieHeader));


            const cookieJson = {
                cookie: encryptedCookie,
                userId: status.data.userId || status.data.profile?.userId || '',
                nickname: status.data.nickname || status.data.profile?.nickname || '',
                avatarUrl: status.data.avatarUrl || status.data.profile?.avatarUrl || '',
                backgroundUrl: status.data.backgroundUrl || status.data.profile?.backgroundUrl || ''
            };

            updateCookieJson(cookieJson);

        }

        if (status.body.code === 803 && (!status.body.data || !status.body.data.cookie)) {
            statusInfo.success = true;
            statusInfo.message = '授权登陆成功';
        }

        const responseData = {
            success: statusInfo.success,
            message: statusInfo.message,
            code: status.code,
            data: {
                cookie: status.cookie || '',
                userId: '',
                nickname: '',
                avatarUrl: '',
                backgroundUrl: ''
            },
        };

        if (status.code === 802 || status.code === 803 || status.data) {
            if (status.data) {
                responseData.data = {
                    cookie: status.cookie || '',
                    userId: '',
                    nickname: '',
                    avatarUrl: '',
                    backgroundUrl: ''
                };
            } else if (status.nickname || status.avatarUrl) {
                responseData.data = {
                    cookie: status.cookie || '',
                    userId: '',
                    nickname: '',
                    avatarUrl: '',
                    backgroundUrl: ''
                };
            }
        }

        res.json(responseData);
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '检查登录状态失败',
            error: error.message,
        });
    }
});

/**
 * 路由：检查本地登录状态（根据配置文件）（需要 token 验证）
 * GET /api/netease/check?token=xxx
 */
router.get('/check', authMiddleware, async (req, res) => {
    try {
        const loggedIn = isLoggedIn();

        if (loggedIn) {

            const localConfig = JSON.parse(fs.readFileSync(COOKIE_JSON_PATH, 'utf-8'));
            const config = await ensureCookieProfile(localConfig);

            res.json({
                success: true,
                message: '已登录',
                data: {
                    isLoggedIn: true,
                    userId: config.userId || '',
                    nickname: config.nickname || '',
                    avatarUrl: config.avatarUrl || '',
                    backgroundUrl: config.backgroundUrl || ''
                }
            });
        } else {
            res.json({
                success: false,
                message: '未登录',
                data: {
                    isLoggedIn: false,
                },
            });
        }
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '检查登录状态失败',
            error: error.message,
        });
    }
});

/**
 * 路由：退出登录 (需要 token 验证)
 * POST /api/netease/logout?token=xxx
 */
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        const cleared = await clearLoginStatus();

        if (cleared) {
            res.json({
                success: true,
                message: '退出登录成功',
            });
        } else {
            res.status(500).json({
                success: false,
                message: '退出登录失败',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '退出登录失败',
            error: error.message,
        });
    }
});

/**
 * 路由：发送验证码 (需要 token 验证)
 * POST /api/netease/captcha/send?token=xxx
 * Body: { phone, countrycode }
 */
router.post('/captcha/send', authMiddleware, async (req, res) => {
    try {
        const {phone, countrycode = '86'} = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: '缺少手机号参数'
            });
        }

        console.log(`📱 正在发送验证码到：+${countrycode} ${phone}`);


        const result = await neteaseApiRequest('/api/sms/captcha/sent', {
            ctcode: countrycode,
            secrete: 'music_middleuser_pclogin',
            cellphone: phone
        });


        if (result.body.code === 200) {
            res.json({
                success: true,
                message: '验证码发送成功',
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message || '验证码发送失败',
                error: result
            });
        }
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '发送验证码失败',
            error: error.message
        });
    }
});

/**
 * 路由：验证验证码并登录 (需要 token 验证)
 * POST /api/netease/login/cellphone?token=xxx
 * Body: { phone, captcha, countrycode }
 */
router.post('/login/cellphone', authMiddleware, async (req, res) => {
    try {
        const {phone, captcha, countrycode = '86'} = req.body;

        if (!phone || !captcha) {
            return res.status(400).json({
                success: false,
                message: '缺少手机号或验证码参数'
            });
        }

        console.log(`🔐 正在验证并登录：+${countrycode} ${phone}`);


        const verifyResult = await neteaseApiRequest('/api/sms/captcha/verify', {
            ctcode: countrycode,
            cellphone: phone,
            captcha: captcha
        });


        if (verifyResult.body.code !== 200) {
            return res.status(400).json({
                success: false,
                message: verifyResult.message || '验证码错误',
                error: verifyResult
            });
        }


        const loginResult = await neteaseApiRequest('/api/w/login/cellphone', {
            type: '1',
            https: 'true',
            phone: phone,
            countrycode: countrycode,
            captcha: captcha,
            remember: 'true'
        });


        if (loginResult.body.code === 200 && loginResult.account) {

            const cookieHeader = loginResult.cookie || '';

            const processedCookie = cookieHeader;


            const {aesEncrypt, caesarEncrypt} = require('../utils/cryptoUtils');
            const encryptedCookie = caesarEncrypt(aesEncrypt(processedCookie));


            const cookieJson = {
                cookie: encryptedCookie,
                userId: loginResult.account.id,
                nickname: loginResult.profile?.nickname || '',
                avatarUrl: loginResult.profile?.avatarUrl || '',
                backgroundUrl: loginResult.profile?.backgroundUrl || ''
            };

            await updateCookieJson(cookieJson);


            res.json({
                success: true,
                message: '登录成功',
                data: {
                    userId: cookieJson.userId,
                    nickname: cookieJson.nickname,
                    avatarUrl: cookieJson.avatarUrl,
                    backgroundUrl: cookieJson.backgroundUrl,
                    vipType: loginResult.profile?.vipType || 0,
                    loginTime: Date.now()
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: loginResult.message || '登录失败',
                error: loginResult
            });
        }
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '登录失败',
            error: error.message
        });
    }
});

/**
 * 路由：Cookie 登录 (需要 token 验证)
 * POST /api/netease/login/cookie?token=xxx
 * Body: { cookie }
 */
router.post('/login/cookie', authMiddleware, async (req, res) => {
    try {
        const {cookie} = req.body;

        if (!cookie || !cookie.trim()) {
            return res.status(400).json({
                success: false,
                message: '缺少 Cookie 参数'
            });
        }


        const processedCookie = cookie.split(';')
            .map(c => c.replace(/\s*Domain=[^(;|$)]+;*/, '').trim())
            .filter(c => c)
            .join('; ');


        const encryptedCookie = caesarEncrypt(aesEncrypt(processedCookie));
        const profile = await fetchCurrentUserProfile(processedCookie);


        const cookieJson = {
            cookie: encryptedCookie,
            userId: profile?.userId || '',
            nickname: profile?.nickname || '',
            avatarUrl: profile?.avatarUrl || '',
            backgroundUrl: profile?.backgroundUrl || ''
        };

        await updateCookieJson(cookieJson);


        res.json({
            success: true,
            message: 'Cookie保存成功'
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Cookie 保存失败',
            error: error.message
        });
    }
});

module.exports = router;
