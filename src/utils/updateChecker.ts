import {ref} from 'vue';
import {addToast} from '@/components/toast';


const currentHash = ref<string | null>(null);

let updateCheckTimer: number | null = null;

/**
 * 计算字符串的哈希值
 * @param str 要计算哈希值的字符串
 * @returns 哈希值
 */
function calculateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

/**
 * 获取最新页面的HTML内容
 * @returns 页面HTML内容
 */
async function getLatestPageContent(): Promise<string> {
    try {
        const response = await fetch('/', {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        return await response.text();
    } catch (error) {

        return '';
    }
}

/**
 * 检测页面是否有更新
 */
async function checkForUpdates() {
    try {
        const latestContent = await getLatestPageContent();
        if (!latestContent) return;

        const latestHash = calculateHash(latestContent);


        if (!currentHash.value) {
            currentHash.value = latestHash;
            return;
        }


        if (latestHash !== currentHash.value) {
            currentHash.value = latestHash;
            showUpdateToast();
        }
    } catch (error) {

    }
}

/**
 * 显示更新提示toast
 */
function showUpdateToast() {
    addToast('检测到新版本，将在5秒后自动更新', 'info', 5000, false);


    setTimeout(() => {
        window.location.reload();
    }, 5000);
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
