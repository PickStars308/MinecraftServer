const express = require('express');
const router = express.Router();
const {neteaseApiRequest} = require('../utils/NCM/NCMAPI');
const {caesarDecrypt, aesDecrypt} = require('../utils/cryptoUtils');
const fs = require('fs');
const path = require('path');

const COOKIE_JSON_PATH = path.join(__dirname, '../config/music/cookie.json');

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
 * 读取 Cookie JSON 文件
 */
async function getCookieJson() {
    try {
        const data = fs.readFileSync(COOKIE_JSON_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {

        return {cookie: '', userId: '', nickname: '', avatarUrl: '', backgroundUrl: ''};
    }
}

/**
 * 路由：获取用户歌单列表
 * GET /api/netease/user/playlist?uid=xxx&limit=30&offset=0&token=xxx
 */
router.get('/playlist', authMiddleware, async (req, res) => {
    try {
        const {uid, limit = 30, offset = 0} = req.query;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: '缺少 uid 参数'
            });
        }


        const cookieData = await getCookieJson();

        if (!cookieData.cookie || cookieData.cookie.length === 0) {
            return res.status(401).json({
                success: false,
                message: '未登录或 Cookie 已过期'
            });
        }


        let finalCookie = '';
        try {
            if (!cookieData.cookie || typeof cookieData.cookie !== 'string') {
                return res.status(401).json({
                    success: false,
                    message: '登录信息异常，请重新登录'
                });
            }


            const caesarDecrypted = caesarDecrypt(cookieData.cookie);
            if (!caesarDecrypted) {
                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }

            finalCookie = aesDecrypt(caesarDecrypted);
            if (!finalCookie) {
                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }
        } catch (decryptError) {
            return res.status(401).json({
                success: false,
                message: 'Cookie 解密失败，请重新登录',
                error: decryptError.message
            });
        }

        console.log(`📋 正在获取用户 ${uid} 的歌单列表...`);


        const result = await neteaseApiRequest('/api/user/playlist', {
            uid: uid,
            limit: parseInt(limit),
            offset: parseInt(offset)
        }, {
            headers: {
                'Cookie': finalCookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
                'Referer': 'https://music.163.com/'
            },
            cookie: finalCookie
        });


        // 检查响应结构，支持直接返回的结果或包含 body 的结果
        const responseBody = result.body || result;
        if (responseBody.code === 200 && responseBody.playlist) {


            const playlist = responseBody.playlist.map(item => ({
                id: item.id,
                name: item.name,
                coverUrl: item.coverImgUrl || item.coverUrl || '',
                trackCount: item.trackCount || 0,
                playCount: item.playCount || 0,
                description: item.description || '',
                tags: item.tags || [],
                createTime: item.createTime || 0,
                updateTime: item.updateTime || 0
            }));


            res.json(playlist);
        } else {
            res.status(500).json({
                success: false,
                message: responseBody.message || '获取歌单失败',
                error: result
            });
        }
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '获取歌单失败',
            error: error.message
        });
    }
});

/**
 * 路由：获取歌单详情
 * GET /api/netease/user/playlist/detail?id=xxx&token=xxx
 */
router.get('/playlist/detail', authMiddleware, async (req, res) => {
    try {
        const {id} = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: '缺少歌单 ID 参数'
            });
        }


        const cookieData = await getCookieJson();

        if (!cookieData.cookie || cookieData.cookie.length === 0) {
            return res.status(401).json({
                success: false,
                message: '未登录或 Cookie 已过期'
            });
        }


        let finalCookie = '';
        try {
            if (!cookieData.cookie || typeof cookieData.cookie !== 'string') {

                return res.status(401).json({
                    success: false,
                    message: '登录信息异常，请重新登录'
                });
            }


            const caesarDecrypted = caesarDecrypt(cookieData.cookie);
            if (!caesarDecrypted) {

                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }


            finalCookie = aesDecrypt(caesarDecrypted);
            if (!finalCookie) {

                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }


        } catch (decryptError) {

            return res.status(401).json({
                success: false,
                message: 'Cookie 解密失败，请重新登录',
                error: decryptError.message
            });
        }

        console.log(`🎵 正在获取歌单 ${id} 的详情...`);


        const result = await neteaseApiRequest('/api/v6/playlist/detail', {
            id: parseInt(id),
            n: 100000,
            s: 8
        }, {
            headers: {
                'Cookie': finalCookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
                'Referer': 'https://music.163.com/'
            },
            cookie: finalCookie
        });


        // 检查响应结构，支持直接返回的结果或包含 body 的结果
        const responseBody = result.body || result;
        if (responseBody.code === 200 && responseBody.playlist) {
            const playlist = responseBody.playlist;

            const rawTracks = playlist.tracks || [];

            const tracks = Array.isArray(rawTracks) ? rawTracks.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.ar?.[0]?.name || '未知歌手',
                album: track.al?.name || '未知专辑',
                coverUrl: track.al?.picUrl || '',
                duration: track.dt || 0,
            })) : [];

            res.json({
                success: true,
                message: '获取成功',
                data: {
                    playlist: {
                        id: playlist.id,
                        name: playlist.name,
                        coverUrl: playlist.coverImgUrl || playlist.coverUrl || '',
                        description: playlist.description || '',
                        trackCount: playlist.trackCount || tracks.length,
                        playCount: playlist.playCount || 0,
                        shareCount: playlist.shareCount || 0,
                        subscribeCount: playlist.subscribeCount || 0,
                        createTime: playlist.createTime || 0,
                        updateTime: playlist.updateTime || 0,
                        tags: playlist.tags || [],
                        creator: {
                            userId: playlist.creator?.userId || '',
                            nickname: playlist.creator?.nickname || '',
                            avatarUrl: playlist.creator?.avatarUrl || ''
                        }
                    },
                    tracks: tracks,
                    trackIds: playlist.trackIds?.map(t => t.id) || []
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: responseBody.message || '获取歌单详情失败',
                error: result
            });
        }
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '获取歌单详情失败',
            error: error.message
        });
    }
});


router.get('/music/url', authMiddleware, async (req, res) => {
    try {

        const {id, level = 'standard'} = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: '缺少音乐ID参数'
            });
        }


        const cookieData = await getCookieJson();

        if (!cookieData.cookie || cookieData.cookie.length === 0) {
            return res.status(401).json({
                success: false,
                message: '未登录或 Cookie 已过期'
            });
        }

        let finalCookie = '';
        try {
            if (!cookieData.cookie || typeof cookieData.cookie !== 'string') {
                return res.status(401).json({
                    success: false,
                    message: '登录信息异常，请重新登录'
                });
            }


            const caesarDecrypted = caesarDecrypt(cookieData.cookie);
            if (!caesarDecrypted) {
                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }


            finalCookie = aesDecrypt(caesarDecrypted);
            if (!finalCookie) {
                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }
        } catch (decryptError) {
            return res.status(401).json({
                success: false,
                message: 'Cookie 解密失败，请重新登录',
                error: decryptError.message
            });
        }


        const GlobalRequest = require('../utils/NCM/GlobalRequest');
        const request = new GlobalRequest();

        const result = await request.getSongUrl(id, level, {
            cookie: finalCookie,
            crypto: 'api'
        });


        if (result && result.body && result.body.data && result.body.data.length > 0) {
            const musicData = result.body.data[0];

            res.json({
                success: true,
                message: '获取成功',
                data: musicData.url || ''
            });
        } else {

            res.status(500).json({
                success: false,
                message: result?.body?.message || '获取音乐链接失败',
                error: result?.body
            });
        }
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '获取音乐链接失败',
            error: error.message
        });
    }
});


router.get('/music/lyric', authMiddleware, async (req, res) => {
    try {
        const {id} = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: '缺少音乐ID参数'
            });
        }

        const cookieData = await getCookieJson();

        if (!cookieData.cookie || cookieData.cookie.length === 0) {
            return res.status(401).json({
                success: false,
                message: '未登录或 Cookie 已过期'
            });
        }

        let finalCookie = '';
        try {
            if (!cookieData.cookie || typeof cookieData.cookie !== 'string') {
                return res.status(401).json({
                    success: false,
                    message: '登录信息异常，请重新登录'
                });
            }

            const caesarDecrypted = caesarDecrypt(cookieData.cookie);
            if (!caesarDecrypted) {
                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }

            finalCookie = aesDecrypt(caesarDecrypted);
            if (!finalCookie) {
                return res.status(401).json({
                    success: false,
                    message: 'Cookie 解密失败，请重新登录'
                });
            }
        } catch (decryptError) {
            return res.status(401).json({
                success: false,
                message: 'Cookie 解密失败，请重新登录',
                error: decryptError.message
            });
        }


        const GlobalRequest = require('../utils/NCM/GlobalRequest');
        const request = new GlobalRequest();

        const result = await request.getLyric(id, {
            cookie: finalCookie,
            crypto: 'api'
        });

        if (result && result.body) {

            res.json({
                success: true,
                message: '获取成功',
                data: result.body
            });
        } else {

            res.status(500).json({
                success: false,
                message: result?.body?.message || '获取歌词失败',
                error: result?.body
            });
        }
    } catch (error) {

        res.status(500).json({
            success: false,
            message: '获取歌词失败',
            error: error.message
        });
    }
});


module.exports = router;
