const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const encryptedConfigPath = path.join(__dirname, '../config', 'admin.enc');

// 从环境变量读取加密密钥
const ENCRYPTION_KEY = process.env.AES_SECRET_KEY || '';
const IV_LENGTH = 16;

/**
 * AES 加密函数
 */
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * AES 解密函数
 */
function decrypt(text) {
    try {
        const parts = text.split(':');
        if (parts.length !== 2) {
            throw new Error('无效的加密格式');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        let decrypted = decipher.update(parts[1], 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('[加密] 解密失败:', error.message);
        return null;
    }
}

/**
 * 获取安装配置
 */
function getInstallConfig() {
    try {

        if (!fs.existsSync(encryptedConfigPath)) {
            return {installed: false};
        }

        const encryptedData = fs.readFileSync(encryptedConfigPath, 'utf-8');
        const decryptedText = decrypt(encryptedData);

        if (!decryptedText) {
            return {installed: false};
        }


        const lines = decryptedText.trim().split('\n');
        const credentialsLine = lines.find(line => line.includes(';'));

        if (!credentialsLine) {
            return {installed: false};
        }

        const [username, passwordHash] = credentialsLine.split(';').map(s => s.trim());

        return {
            installed: true,
            adminUsername: username || '',
            adminPasswordHash: passwordHash || ''
        };
    } catch (error) {
        console.error('[配置] 读取安装配置失败:', error);
        return {installed: false};
    }
}

/**
 * 保存安装配置
 */
function saveInstallConfig(config) {
    try {
        const plainText = `${config.adminUsername || ''};${config.adminPasswordHash || ''}`;

        const encryptedData = encrypt(plainText);
        fs.writeFileSync(encryptedConfigPath, encryptedData, 'utf-8');
        return true;
    } catch (error) {
        console.error('[配置] 保存安装配置失败:', error);
        return false;
    }
}


/**
 * 密码加密（使用 bcrypt 或简单的 hash）
 */
function hashPassword(password) {

    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * 执行安装
 */
function performInstall(installData) {
    const config = getInstallConfig();


    if (config.installed) {
        return {
            success: false,
            message: '系统已经安装完成，请勿重复安装'
        };
    }


    if (!installData.adminUsername || !installData.adminPassword) {
        return {
            success: false,
            message: '请填写所有必填字段'
        };
    }
    config.installed = true;
    config.adminUsername = installData.adminUsername;
    config.adminPasswordHash = hashPassword(installData.adminPassword);
    config.installDate = new Date().toISOString();

    const saved = saveInstallConfig(config);

    if (!saved) {
        return {
            success: false,
            message: '保存配置失败'
        };
    }

    return {
        success: true,
        message: '安装成功！请重启服务器以应用配置'
    };
}


module.exports = {
    getInstallConfig,
    performInstall,
    decrypt
};
