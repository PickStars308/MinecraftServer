import axios from 'axios'

interface ApiResponse<T = unknown> {
    success: boolean
    message?: string
    authenticated?: boolean
    data?: T
}

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    method: 'POST',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

export async function loginAdmin(username: string, password: string): Promise<ApiResponse> {
    try {
        const {data} = await adminApi.post<ApiResponse>('/api/admin/login', {username, password})
        return data
    } catch (error: any) {
        if (error.response && error.response.data) {

            return error.response.data
        }

        throw new Error('网络连接失败，请检查后端服务是否运行')
    }
}

export async function checkAdminSession(): Promise<boolean> {
    try {
        const {data} = await adminApi.get<ApiResponse>('/api/admin/session')
        return Boolean(data.authenticated)
    } catch {
        return false
    }
}

export async function logoutAdmin(): Promise<void> {
    await adminApi.post('/api/admin/logout')
}
