import axios from 'axios'

interface InstallStatus {
    installed: boolean
}

interface InstallData {
    adminUsername: string
    adminPassword: string
}

interface SiteConfig {
    siteName: string
    siteDescription: string
    siteAuthor: string
    siteVersion: string
    siteKeywords: string
    serverAddress: string
    serverCreationDate: string
    startYear: string
    copyright: string
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

        if (error.message && (error.message.includes('CORS') || error.message.includes('Network Error'))) {
            throw error
        }
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

/**
 * 获取站点配置
 */
export async function getSiteConfig(token: string): Promise<ApiResponse<SiteConfig>> {
    try {
        const {data} = await installApi.get<ApiResponse<SiteConfig>>('/api/install/config', {
            params: {token}
        })
        return data
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data
        }
        throw error
    }
}

/**
 * 更新站点配置
 */
export async function updateSiteConfig(config: SiteConfig, token: string): Promise<ApiResponse> {
    try {
        const {data} = await installApi.put<ApiResponse>('/api/install/config', config, {
            params: {token}
        })
        return data
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data
        }
        throw error
    }
}
