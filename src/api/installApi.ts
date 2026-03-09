import axios from 'axios'

interface InstallStatus {
    installed: boolean
}

interface InstallData {
    adminUsername: string
    adminPassword: string
}

interface ApiResponse<T = unknown> {
    success: boolean
    message?: string
    data?: T
}

const installApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003',
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * 检查安装状态
 */
export async function checkInstallStatus(): Promise<InstallStatus> {
    try {
        const {data} = await installApi.get<ApiResponse<InstallStatus>>('/api/install/status')
        return data.data || {installed: false}
    } catch (error: any) {
        console.error('检查安装状态失败:', error)

        return {installed: false}
    }
}

/**
 * 执行安装
 */
export async function executeInstall(data: InstallData): Promise<ApiResponse> {
    try {
        const {data: response} = await installApi.post<ApiResponse>('/api/install', data)
        return response
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data
        }
        throw error
    }
}

/**
 * 验证 API 连接
 */
export async function validateMcServerApi(url: string): Promise<boolean> {
    try {
        console.log('[安装 API] 开始验证 MC 服务器 API:', url)
        const {data} = await installApi.post<ApiResponse>('/api/install/validate-api', {url})
        console.log('[安装 API] 验证结果:', data)
        return data.success || false
    } catch (error: any) {
        console.error('[安装 API] 验证失败:', error)
        if (error.response) {
            console.error('[安装 API] 错误响应:', error.response.data)
        }
        return false
    }
}
