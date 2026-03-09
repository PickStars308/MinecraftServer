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

export interface ImageDeleteResponse {
    success: boolean;
    message: string;
    error?: string;
}

export interface ImageEditResponse {
    success: boolean;
    message: string;
    data: {
        oldName: string;
        newName: string;
        url: string;
        time?: string | null;
    };
    error?: string;
}

export interface ImageUploadResponse {
    success: boolean;
    message: string;
    data: ImageItem[];
    error?: string;
}

export interface TimelineImageUploadResponse {
    success: boolean;
    message: string;
    data: ImageItem;
    error?: string;
}

export interface TimelineImageDeleteResponse {
    success: boolean;
    message: string;
    error?: string;
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
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

        const response: AxiosResponse<ImageListResponse> = await apiClient.get('/api/images', {
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
 * 删除图片（带鉴权）
 * @param filename 图片文件名
 * @returns 删除结果
 */
export async function deleteImage(filename: string): Promise<ImageDeleteResponse> {
    try {
        const authToken = generateAuthToken();

        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<ImageDeleteResponse> = await apiClient.delete(`/api/images/${filename}`, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as ImageDeleteResponse;
            return {
                success: false,
                message: errorData.message || '删除失败'
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                message: '网络异常，请稍后重试'
            };
        }
    }
}

/**
 * 编辑图片信息（带鉴权）
 * @param filename 图片文件名
 * @param newName 新的图片名称
 * @returns 编辑结果
 */
export async function editImage(filename: string, newName: string): Promise<ImageEditResponse> {
    try {
        const authToken = generateAuthToken();

        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<ImageEditResponse> = await apiClient.put(`/api/images/${filename}`, {
            newName
        }, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as ImageEditResponse;
            return {
                success: false,
                message: errorData.message || '编辑失败',
                data: {
                    oldName: '',
                    newName: '',
                    url: ''
                }
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                message: '网络异常，请稍后重试',
                data: {
                    oldName: '',
                    newName: '',
                    url: ''
                }
            };
        }
    }
}

/**
 * 编辑时间线图片信息（带鉴权）
 * @param filename 图片文件名
 * @param newName 新的图片名称
 * @returns 编辑结果
 */
export async function editTimelineImage(filename: string, newName: string): Promise<ImageEditResponse> {
    try {
        const authToken = generateAuthToken();

        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<ImageEditResponse> = await apiClient.put(`/api/timeline/images/${filename}`, {
            newName
        }, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as ImageEditResponse;
            return {
                success: false,
                message: errorData.message || '编辑失败',
                data: {
                    oldName: '',
                    newName: '',
                    url: ''
                }
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                message: '网络异常，请稍后重试',
                data: {
                    oldName: '',
                    newName: '',
                    url: ''
                }
            };
        }
    }
}

/**
 * 上传图片（带鉴权）
 * @param formData 包含图片文件的FormData
 * @param options
 * @returns 上传结果
 */
export async function uploadImages(formData: FormData, options?: {
    onUploadProgress: (progressEvent: { total?: number; loaded: number; }) => void;
}): Promise<ImageUploadResponse> {
    try {
        const authToken = generateAuthToken();

        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<ImageUploadResponse> = await apiClient.post('/api/images/upload', formData, {
            params: {
                token: encodedToken
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: options?.onUploadProgress
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as ImageUploadResponse;
            return {
                success: false,
                message: errorData.message || '上传失败',
                data: []
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                message: '网络异常，请稍后重试',
                data: []
            };
        }
    }
}

/**
 * 上传时间线图片（带鉴权）
 * @param formData 包含图片文件的FormData
 * @param options
 * @returns 上传结果
 */
export async function uploadTimelineImage(formData: FormData, options?: {
    onUploadProgress: (progressEvent: { total?: number; loaded: number; }) => void;
}): Promise<TimelineImageUploadResponse> {
    try {
        const authToken = generateAuthToken();

        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<TimelineImageUploadResponse> = await apiClient.post('/api/timeline/images/upload', formData, {
            params: {
                token: encodedToken
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: options?.onUploadProgress
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as TimelineImageUploadResponse;
            return {
                success: false,
                message: errorData.message || '上传失败',
                data: {
                    name: '',
                    url: ''
                }
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                message: '网络异常，请稍后重试',
                data: {
                    name: '',
                    url: ''
                }
            };
        }
    }
}

/**
 * 删除时间线图片（带鉴权）
 * @param filename 图片文件名
 * @returns 删除结果
 */
export async function deleteTimelineImage(filename: string): Promise<TimelineImageDeleteResponse> {
    try {
        const authToken = generateAuthToken();

        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<TimelineImageDeleteResponse> = await apiClient.delete(`/api/timeline/images/${filename}`, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as TimelineImageDeleteResponse;
            return {
                success: false,
                message: errorData.message || '删除失败'
            };
        } else {
            addToast('网络异常，请稍后重试', 'error');
            return {
                success: false,
                message: '网络异常，请稍后重试'
            };
        }
    }
}
