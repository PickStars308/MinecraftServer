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
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * 检查安装状态
 */
export async function checkInstallStatus(): Promise<boolean> {
    try {
        const {data} = await installApi.get<ApiResponse<InstallStatus>>('/api/install/status')
        return data.data?.installed || false
    } catch (error: any) {
        console.error('检查安装状态失败:', error)
        // 如果 API 调用失败，返回未安装状态
        return false
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
