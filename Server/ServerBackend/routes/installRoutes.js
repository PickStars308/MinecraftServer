const express = require('express');
const router = express.Router();
require('dotenv').config();
const installUtils = require('../utils/installUtils');
const {caesarDecrypt, aesDecrypt} = require('../utils/cryptoUtils');

/**
 * 认证中间件（仅在已安装状态下需要验证）
 */
const authMiddleware = async (req, res, next) => {
    try {

        const config = installUtils.getInstallConfig();
        if (!config.installed) {
            return next();
        }

        let {token} = req.query;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "未授权访问"
            });
        }

        token = decodeURIComponent(token);
        const decryptedAesToken = aesDecrypt(token);
        const finalToken = caesarDecrypt(decryptedAesToken);

        if (finalToken !== process.env.CAESAR_VALID_TOKEN) {
            return res.status(401).json({
                success: false,
                message: "未授权访问"
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "未授权访问",
            error: process.env.NODE_ENV === 'development' ? err.message : ''
        });
    }
};

/**
 * 检查安装状态（无需认证）
 */
router.get('/status', (req, res) => {
    try {
        const config = installUtils.getInstallConfig();

        res.json({
            success: true,
            message: config.installed ? '系统已安装' : '未安装',
            data: {installed: config.installed}
        });
    } catch (error) {
        console.error('[安装路由] 获取安装状态失败:', error)
        res.status(500).json({
            success: false,
            message: '获取安装状态失败',
            data: {installed: false}
        });
    }
});

/**
 * 执行安装（使用认证中间件）
 */
router.post('/', authMiddleware, (req, res) => {
    try {
        const installData = req.body;


        if (!installData.adminUsername || !installData.adminPassword) {
            return res.status(400).json({
                success: false,
                message: '请填写所有必填字段'
            });
        }


        const result = installUtils.performInstall(installData);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('执行安装失败:', error);
        res.status(500).json({
            success: false,
            message: '执行安装失败',
            error: error.message
        });
    }
});

module.exports = router;
