const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
require('dotenv').config();
const {caesarDecrypt, aesDecrypt} = require('../utils/cryptoUtils');
const multer = require('multer');

const TIMELINE_IMAGE_DIR = path.join(__dirname, '../uploads/history');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ensureDirectoryExists = async (dir) => {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, {recursive: true});
    }
};

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureDirectoryExists(TIMELINE_IMAGE_DIR);
        cb(null, TIMELINE_IMAGE_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const filename = `${timestamp}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (imageExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("请求参数错误"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

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

function removeFileExtension(fileName) {
    return path.basename(fileName, path.extname(fileName));
}

/**
 * 上传时间线图片
 */
router.post('/timeline/images/upload', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "请求参数错误"
            });
        }

        const file = req.file;

        if (file.size > MAX_FILE_SIZE) {
            await fs.unlink(file.path);
            return res.status(400).json({
                success: false,
                message: "图片上传失败"
            });
        }

        const ext = path.extname(file.originalname).toLowerCase();
        if (!imageExtensions.includes(ext)) {
            await fs.unlink(file.path);
            return res.status(400).json({
                success: false,
                message: "图片上传失败"
            });
        }

        const now = new Date();
        const time = now.toISOString().replace('T', ' ').substring(0, 19);

        res.status(200).json({
            success: true,
            message: "图片上传成功",
            data: {
                name: removeFileExtension(file.filename),
                url: `/uploads/history/${file.filename}`,
                time: time
            }
        });

    } catch (error) {
        console.error('上传时间线图片失败：', error);
        res.status(500).json({
            success: false,
            message: "图片上传失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

/**
 * 编辑时间线图片信息（重命名）
 */
router.put('/timeline/images/:filename', authMiddleware, async (req, res) => {
    try {
        const {filename} = req.params;
        const {newName} = req.body;

        if (!filename || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({
                success: false,
                message: "请求参数错误"
            });
        }

        if (!newName || typeof newName !== 'string') {
            return res.status(400).json({
                success: false,
                message: "请求参数错误"
            });
        }

        const oldPath = path.join(TIMELINE_IMAGE_DIR, filename);
        const ext = path.extname(filename);
        const newPath = path.join(TIMELINE_IMAGE_DIR, `${newName}${ext}`);

        try {
            await fs.access(oldPath);
        } catch {
            return res.status(404).json({
                success: false,
                message: "资源不存在"
            });
        }

        try {
            await fs.access(newPath);
            return res.status(400).json({
                success: false,
                message: "文件名已存在"
            });
        } catch {
        }

        const now = new Date();
        const time = now.toISOString().replace('T', ' ').substring(0, 19);

        await fs.rename(oldPath, newPath);

        res.status(200).json({
            success: true,
            message: "图片信息修改成功",
            data: {
                oldName: removeFileExtension(filename),
                newName: newName,
                url: `/uploads/history/${newName}${ext}`,
                time: time
            }
        });

    } catch (error) {
        console.error('编辑时间线图片信息失败：', error);
        res.status(500).json({
            success: false,
            message: "图片信息修改失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

/**
 * 删除时间线图片
 */
router.delete('/timeline/images/:filename', authMiddleware, async (req, res) => {
    try {
        const {filename} = req.params;

        if (!filename || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({
                success: false,
                message: "请求参数错误"
            });
        }

        const imagePath = path.join(TIMELINE_IMAGE_DIR, filename);

        try {
            await fs.access(imagePath);
        } catch {
            return res.status(404).json({
                success: false,
                message: "资源不存在"
            });
        }

        await fs.unlink(imagePath);

        res.status(200).json({
            success: true,
            message: "图片删除成功"
        });

    } catch (error) {
        console.error('删除时间线图片失败：', error);
        res.status(500).json({
            success: false,
            message: "图片删除失败",
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

module.exports = router;
