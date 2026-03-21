const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
require('dotenv').config();
const {caesarDecrypt, aesDecrypt} = require('../utils/cryptoUtils');

const HISTORY_JSON_PATH = path.join(__dirname, '../config/history.json');

const authMiddleware = async (req, res, next) => {
    try {
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
 * 读取服务器历程图片 JSON 文件
 * @returns {Array} 校验后的历程图片列表
 */
async function readHistoryFromJson() {
    try {

        await fs.access(HISTORY_JSON_PATH);

        const fileContent = await fs.readFile(HISTORY_JSON_PATH, 'utf8');
        const historyData = JSON.parse(fileContent);

        let historyList = [];
        if (Array.isArray(historyData)) {
            historyList = historyData;
        } else if (historyData?.data && Array.isArray(historyData.data)) {
            historyList = historyData.data;
        } else {
            throw new Error('JSON 文件格式错误：根节点必须是历程图片对象数组（或包含 data 数组字段）');
        }

        const validHistory = historyList.filter(item => {
            const isObject = typeof item === 'object' && item !== null;
            const hasUrl = isObject && typeof item.url === 'string' && item.url.trim() !== '';
            const hasName = isObject && typeof item.name === 'string' && item.name.trim() !== '';
            return hasUrl && hasName;
        });

        if (validHistory.length !== historyList.length) {
            console.warn(`历程数据校验：过滤了 ${historyList.length - validHistory.length} 个无效图片对象`);
        }

        return validHistory;

    } catch (error) {

        if (error.code === 'ENOENT') {
            console.warn('历程 JSON 文件不存在，返回空数据:', HISTORY_JSON_PATH);
            return [];
        }


        return [];
    }
}

router.get('/history', authMiddleware, async (req, res) => {
    try {
        const historyList = await readHistoryFromJson();

        res.status(200).json({
            success: true,
            count: historyList.length,
            data: historyList
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "加载服务器历程失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

router.post('/history', authMiddleware, async (req, res) => {
    try {
        const {history} = req.body;

        if (!Array.isArray(history)) {
            return res.status(400).json({
                success: false,
                message: "历程数据格式错误"
            });
        }

        const validHistory = history.filter(item => {
            const isObject = typeof item === 'object' && item !== null;
            const hasUrl = isObject && typeof item.url === 'string' && item.url.trim() !== '';
            const hasName = isObject && typeof item.name === 'string' && item.name.trim() !== '';
            return hasUrl && hasName;
        });

        if (validHistory.length !== history.length) {
            console.warn(`历程数据校验：过滤了 ${history.length - validHistory.length} 个无效图片对象`);
        }

        await fs.writeFile(HISTORY_JSON_PATH, JSON.stringify(validHistory, null, 2), 'utf8');

        res.status(200).json({
            success: true,
            message: "服务器历程保存成功",
            count: validHistory.length,
            data: validHistory
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "保存服务器历程失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

module.exports = router;
