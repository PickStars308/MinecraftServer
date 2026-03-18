require('dotenv').config();
const fs = require('fs');
const path = require('path');

const express = require('express');
const crypto = require('crypto');
const cookie = require('cookie');

const router = express.Router();

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';
const isProd = process.env.NODE_ENV === 'production';

// 延迟加载凭据，避免模块缓存问题
function loadAdminCredentials() {
    let adminUsername = 'admin';
    let adminPasswordHash = null;

    try {
        const encryptedConfigPath = path.join(__dirname, '../config', 'admin.enc');
        if (fs.existsSync(encryptedConfigPath)) {
            const encryptedData = fs.readFileSync(encryptedConfigPath, 'utf-8');

            const installUtils = require('../utils/installUtils');
            const decryptedText = installUtils.decrypt(encryptedData);

            if (decryptedText) {
                const [username, passwordHash] = decryptedText.split(';').map(s => s.trim());

                if (username && passwordHash) {
                    adminUsername = username;
                    adminPasswordHash = passwordHash;
                } else {
                    throw new Error('解密后的数据格式不正确');
                }
            } else {
                throw new Error('解密失败');
            }
        } else {
            adminUsername = process.env.ADMIN_USERNAME || 'admin';
            const plainPassword = process.env.ADMIN_PASSWORD || '';
            adminPasswordHash = crypto.createHash('sha256').update(plainPassword).digest('hex');
            console.log('[登录验证] 使用默认管理员账户（未检测到加密配置）');
        }
    } catch (error) {
        console.error('[登录验证] 读取加密配置失败:', error.message);
        adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const plainPassword = process.env.ADMIN_PASSWORD || '';
        adminPasswordHash = crypto.createHash('sha256').update(plainPassword).digest('hex');
    }

    return {adminUsername, adminPasswordHash};
}

const sessions = new Map();

function safeEquals(a, b) {
    const aBuf = Buffer.from(String(a));
    const bBuf = Buffer.from(String(b));
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
}

function cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sid, exp] of sessions.entries()) {
        if (exp <= now) sessions.delete(sid);
    }
}

function signSessionId(sessionId) {
    const sig = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(sessionId)
        .digest('hex');
    return `${sessionId}.${sig}`;
}

function verifySignedSession(value) {
    if (!value || typeof value !== 'string' || !value.includes('.')) return null;
    const [sessionId, signature] = value.split('.');
    if (!sessionId || !signature) return null;

    const expected = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(sessionId)
        .digest('hex');

    if (!safeEquals(signature, expected)) return null;
    const exp = sessions.get(sessionId);
    if (!exp || exp <= Date.now()) {
        sessions.delete(sessionId);
        return null;
    }

    return sessionId;
}

function getSessionCookie(req) {
    const cookies = cookie.parse(req.headers.cookie || '');
    return cookies[COOKIE_NAME];
}

function setSessionCookie(res, signedValue) {
    res.cookie(COOKIE_NAME, signedValue, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL_MS
    });
}

function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/'
    });
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/admin/login', (req, res) => {
    cleanupExpiredSessions();

    // 每次请求时动态加载凭据，确保获取最新配置
    const {adminUsername, adminPasswordHash} = loadAdminCredentials();

    const {username, password} = req.body || {};
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: '用户名或密码不能为空'
        });
    }

    const passwordHash = hashPassword(password);
    if (!safeEquals(username || '', adminUsername) || !safeEquals(passwordHash || '', adminPasswordHash)) {
        return res.status(401).json({
            success: false,
            message: '用户名或密码错误'
        });
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_TTL_MS;
    sessions.set(sessionId, expiresAt);

    setSessionCookie(res, signSessionId(sessionId));

    return res.json({
        success: true,
        message: '登录成功'
    });
});

router.get('/admin/session', (req, res) => {
    cleanupExpiredSessions();
    const raw = getSessionCookie(req);
    const sessionId = verifySignedSession(raw);

    return res.json({
        success: true,
        authenticated: Boolean(sessionId)
    });
});

router.post('/admin/logout', (req, res) => {
    const raw = getSessionCookie(req);
    const sessionId = verifySignedSession(raw);
    if (sessionId) sessions.delete(sessionId);
    clearSessionCookie(res);

    return res.json({
        success: true
    });
});

module.exports = router;
