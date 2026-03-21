import {ref} from 'vue';
import axios from 'axios';

const currentVersion = '1.0.0';
let latestVersion = ref<string>('');
let updateCheckTimer: number | null = null;

/**
 * 从GitHub API获取最新版本信息
 * @returns 最新版本号
 */
async function getLatestVersionFromGitHub(): Promise<string | null> {
    try {
        const response = await axios.get('https://api.github.com/repos/PickStars308/MinecraftServer/releases/latest', {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.data) {
            return null;
        }

        const data = response.data;
        return data.tag_name?.replace('v', '') || null;
    } catch (error) {
        console.error('获取GitHub版本信息失败:', error);
        return null;
    }
}

/**
 * 比较版本号
 * @param current 当前版本
 * @param latest 最新版本
 * @returns 是否需要更新
 */
function shouldUpdate(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
        const currentPart = currentParts[i] || 0;
        const latestPart = latestParts[i] || 0;

        if (latestPart > currentPart) {
            return true;
        } else if (latestPart < currentPart) {
            return false;
        }
    }

    return false;
}

/**
 * 检测是否有更新
 */
export async function checkForUpdates() {
    try {
        const latestVersionFromGitHub = await getLatestVersionFromGitHub();
        if (!latestVersionFromGitHub) return;

        latestVersion.value = latestVersionFromGitHub;

        if (shouldUpdate(currentVersion, latestVersionFromGitHub)) {
            console.log(`检测到新版本 v${latestVersionFromGitHub}`);
            return true
        }
    } catch (error) {
        console.error('更新检测失败:', error);
    }
}

/**
 * 启动更新检测
 * @param interval 检测间隔（毫秒），默认300000ms（5分钟）
 */
export function startUpdateChecker(interval: number = 300000) {
    checkForUpdates();
    updateCheckTimer = window.setInterval(checkForUpdates, interval);
}

/**
 * 停止更新检测
 */
export function stopUpdateChecker() {
    if (updateCheckTimer) {
        clearInterval(updateCheckTimer);
        updateCheckTimer = null;
    }
}

/**
 * 获取当前版本
 */
export function getCurrentVersion(): string {
    return currentVersion;
}

/**
 * 获取最新版本
 */
export function getLatestVersion(): string {
    return latestVersion.value;
}
