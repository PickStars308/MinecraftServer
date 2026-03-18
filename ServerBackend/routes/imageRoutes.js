const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
require('dotenv').config();
const {caesarDecrypt, aesDecrypt} = require('../utils/cryptoUtils');
const multer = require('multer');


const IMAGE_DIR = path.join(__dirname, '../uploads/images');
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
        await ensureDirectoryExists(IMAGE_DIR);
        cb(null, IMAGE_DIR);
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
        cb(new Error('不支持的文件格式'), false);
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
                message: '未授权访问'
            });
        }

        token = decodeURIComponent(token);
        const decryptedAesToken = aesDecrypt(token);
        const finalToken = caesarDecrypt(decryptedAesToken);

        if (finalToken !== process.env.CAESAR_VALID_TOKEN) {
            return res.status(401).json({
                success: false,
                message: '未授权访问'
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
 * 从文件名解析时间（适配我的世界服务器历程图片命名）
 * 支持格式：2026-03-07_14.25.30.png → 2026-03-07 14:25:30
 * @param {string} fileName 文件名
 * @returns {string|null} 解析后的时间，失败返回null
 */
function parseTimeFromFileName(fileName) {
    const timeRegex = /(\d{4}-\d{2}-\d{2})_(\d{2})\.(\d{2})\.(\d{2})/;
    const match = fileName.match(timeRegex);

    if (match) {
        const [, date, hour, minute, second] = match;
        return `${date} ${hour}:${minute}:${second}`;
    }
    return null;
}

/**
 * 移除文件名后缀（用于前端标题展示）
 * @param {string} fileName 完整文件名
 * @returns {string} 去掉后缀的文件名
 */
function removeFileExtension(fileName) {
    return path.basename(fileName, path.extname(fileName));
}


router.get('/images', authMiddleware, async (req, res) => {
    try {

        try {
            await fs.access(IMAGE_DIR);
        } catch {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: '图片目录不存在，暂无历程图片'
            });
        }


        const files = await fs.readdir(IMAGE_DIR);


        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });


        const imageList = [];
        for (const file of imageFiles) {

            let time = parseTimeFromFileName(file);


            if (!time) {
                try {
                    const stats = await fs.stat(path.join(IMAGE_DIR, file));
                    const mtime = stats.mtime;
                    const year = mtime.getFullYear();
                    const month = String(mtime.getMonth() + 1).padStart(2, '0');
                    const day = String(mtime.getDate()).padStart(2, '0');
                    const hours = String(mtime.getHours()).padStart(2, '0');
                    const minutes = String(mtime.getMinutes()).padStart(2, '0');
                    const seconds = String(mtime.getSeconds()).padStart(2, '0');
                    time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                } catch {

                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                }
            }

            imageList.push({
                name: removeFileExtension(file),
                url: `/uploads/images/${file}`,
                time: time
            });
        }

        res.status(200).json({
            success: true,
            count: imageList.length,
            data: imageList
        });

    } catch (error) {
        console.error('获取图片列表失败：', error);
        res.status(500).json({
            success: false,
            message: '获取图片列表失败',
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

/**
 * 删除图片
 */
router.delete('/images/:filename', authMiddleware, async (req, res) => {
    try {
        const {filename} = req.params;


        if (!filename || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({
                success: false,
                message: '请求参数错误'
            });
        }

        const imagePath = path.join(IMAGE_DIR, filename);


        try {
            await fs.access(imagePath);
        } catch {
            return res.status(404).json({
                success: false,
                message: '图片不存在'
            });
        }


        await fs.unlink(imagePath);

        res.status(200).json({
            success: true,
            message: '图片删除成功'
        });

    } catch (error) {
        console.error('删除图片失败：', error);
        res.status(500).json({
            success: false,
            message: '删除图片失败',
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

/**
 * 编辑图片信息
 */
router.put('/images/:filename', authMiddleware, async (req, res) => {
    try {
        const {filename} = req.params;
        const {newName} = req.body;


        if (!filename || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({
                success: false,
                message: '请求参数错误'
            });
        }


        if (!newName || typeof newName !== 'string') {
            return res.status(400).json({
                success: false,
                message: '请求参数错误'
            });
        }

        const oldPath = path.join(IMAGE_DIR, filename);
        const ext = path.extname(filename);
        const newPath = path.join(IMAGE_DIR, `${newName}${ext}`);


        try {
            await fs.access(oldPath);
        } catch {
            return res.status(404).json({
                success: false,
                message: '图片不存在'
            });
        }


        try {
            await fs.access(newPath);
            return res.status(400).json({
                success: false,
                message: '新名称已存在'
            });
        } catch {

        }


        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const originalTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


        await fs.rename(oldPath, newPath);

        res.status(200).json({
            success: true,
            message: '修改成功',
            data: {
                oldName: removeFileExtension(filename),
                newName: newName,
                url: `/uploads/images/${newName}${ext}`,
                time: originalTime
            }
        });

    } catch (error) {
        console.error('编辑图片信息失败：', error);
        res.status(500).json({
            success: false,
            message: '编辑图片信息失败',
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

/**
 * 上传图片
 */
router.post('/images/upload', authMiddleware, upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '未选择任何图片'
            });
        }

        const uploadedImages = [];

        for (const file of req.files) {

            if (file.size > MAX_FILE_SIZE) {

                await fs.unlink(file.path);
                continue;
            }


            const ext = path.extname(file.originalname).toLowerCase();
            if (!imageExtensions.includes(ext)) {

                await fs.unlink(file.path);
                continue;
            }


            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            uploadedImages.push({
                name: removeFileExtension(file.filename),
                url: `/uploads/images/${file.filename}`,
                time: time
            });
        }

        if (uploadedImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: '未选择任何图片'
            });
        }

        res.status(200).json({
            success: true,
            message: '图片上传成功',
            data: uploadedImages
        });

    } catch (error) {
        console.error('上传图片失败：', error);
        res.status(500).json({
            success: false,
            message: '上传图片失败',
            error: process.env.NODE_ENV === 'development' ? error.message : ''
        });
    }
});

module.exports = router;
