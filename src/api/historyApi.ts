import axios, {type AxiosResponse} from 'axios';
import {generateAuthToken} from '../utils/cryptoUtils';
import {addToast} from '@/components/toast/';


export interface ImageItem {
    name: string;
    url: string;
    time?: string | null;
}

export interface ImageListResponse {
    success: boolean;
    count: number;
    data: ImageItem[];
    message?: string;
    error?: string;
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * 获取图片列表（带鉴权）
 * @returns 图片列表数据
 */
export async function getImageList(): Promise<ImageListResponse> {
    try {
        const authToken = generateAuthToken();

        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<ImageListResponse> = await apiClient.get('/api/history', {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as ImageListResponse;
            return {
                success: false,
                count: 0,
                data: [],
                message: errorData.message || '接口请求失败'
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                count: 0,
                data: [],
                message: '网络异常，请稍后重试'
            };
        }
    }
}

/**
 * 保存图片列表（带鉴权）
 * @param history 图片列表
 * @returns 保存结果
 */
export async function saveImageList(history: ImageItem[]): Promise<ImageListResponse> {
    try {
        const authToken = generateAuthToken();
        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<ImageListResponse> = await apiClient.post('/api/history', {
            history
        }, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as ImageListResponse;
            return {
                success: false,
                count: 0,
                data: [],
                message: errorData.message || '接口请求失败'
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                count: 0,
                data: [],
                message: '网络异常，请稍后重试'
            };
        }
    }
}
