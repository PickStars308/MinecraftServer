const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/config.json');

/**
 * 初始化配置文件
 * 如果 config.json 不存在，则从环境变量创建
 */
function initConfig() {
    // 检查配置文件是否已存在
    if (fs.existsSync(configPath)) {
        console.log('✅ 配置文件已存在，跳过初始化');
        return false;
    }

    try {
        // 确保 config 目录存在
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, {recursive: true});
        }

        // 尝试读取项目根目录的 .env（如果存在）
        const rootEnvPath = path.join(__dirname, '../../.env');
        let rootEnvConfig = {};

        if (fs.existsSync(rootEnvPath)) {
            const envContent = fs.readFileSync(rootEnvPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const trimmedKey = key.trim();
                    const trimmedValue = valueParts.join('=').trim();
                    if (trimmedKey.startsWith('VITE_')) {
                        rootEnvConfig[trimmedKey] = trimmedValue;
                    }
                }
            });
            console.log('📄 已从根目录 .env 加载配置');
        }

        // 从环境变量读取配置（优先使用 process.env，其次使用根目录 .env）
        const config = {
            // 站点配置
            siteName: process.env.VITE_SITE_NAME || rootEnvConfig.VITE_SITE_NAME || 'My Server',
            siteDescription: process.env.VITE_SITE_DESCRIPTION || rootEnvConfig.VITE_SITE_DESCRIPTION || 'Minecraft Server',
            siteAuthor: process.env.VITE_SITE_AUTHOR || rootEnvConfig.VITE_SITE_AUTHOR || 'Admin',
            siteVersion: process.env.VITE_SITE_VERSION || rootEnvConfig.VITE_SITE_VERSION || '1.0.0',
            siteKeywords: process.env.VITE_SITE_KEYWORDS || rootEnvConfig.VITE_SITE_KEYWORDS || '',

            // 服务器配置
            serverAddress: process.env.VITE_SERVER_ADDRESS || rootEnvConfig.VITE_SERVER_ADDRESS || 'localhost',
            serverCreationDate: process.env.VITE_SERVER_CREATION_DATE || rootEnvConfig.VITE_SERVER_CREATION_DATE || new Date().toISOString().split('T')[0],

            // 版权信息
            startYear: process.env.VITE_START_YEAR || rootEnvConfig.VITE_START_YEAR || new Date().getFullYear().toString(),
            copyright: process.env.VITE_COPYRIGHT || rootEnvConfig.VITE_COPYRIGHT || 'PickStars'
        };

        // 写入配置文件
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

        console.log('✅ 配置文件创建成功:', configPath);
        console.log('📄 配置内容:', JSON.stringify(config, null, 2));

        return true;
    } catch (error) {
        console.error('❌ 创建配置文件失败:', error.message);
        throw error;
    }
}

/**
 * 获取配置
 * @returns {Object} 配置对象
 */
function getConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            return null;
        }

        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('读取配置文件失败:', error.message);
        return null;
    }
}

/**
 * 更新配置
 * @param {Object} newConfig 新的配置
 * @returns {boolean} 是否成功
 */
function updateConfig(newConfig) {
    try {
        const currentConfig = getConfig() || {};
        const updatedConfig = {...currentConfig, ...newConfig};

        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8');
        console.log('✅ 配置文件更新成功');

        return true;
    } catch (error) {
        console.error('更新配置文件失败:', error.message);
        return false;
    }
}

module.exports = {
    initConfig,
    getConfig,
    updateConfig
};
