import axios, {type AxiosResponse} from 'axios';
import {generateAuthToken} from '../utils/cryptoUtils';


export interface ServerMember {
    uuid: string;
    name: string;
}

export interface MemberListResponse {
    success: boolean;
    count: number;
    data: ServerMember[];
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
 * 获取服务器成员列表（带鉴权）
 * @returns 成员列表数据
 */
export async function getMemberList(): Promise<MemberListResponse> {
    try {
        const authToken = generateAuthToken();
        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<MemberListResponse> = await apiClient.get('/api/members', {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as MemberListResponse;
            console.error('获取成员列表失败：', errorData.message || error.message);
            return {
                success: false,
                count: 0,
                data: [],
                message: errorData?.message || '接口请求失败'
            };
        } else {
            console.error('获取成员列表异常：', error);
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
 * 保存服务器成员列表（带鉴权）
 * @param members 成员列表
 * @returns 保存结果
 */
export async function saveMemberList(members: ServerMember[]): Promise<MemberListResponse> {
    try {
        const authToken = generateAuthToken();
        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<MemberListResponse> = await apiClient.post('/api/members', {
            members
        }, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as MemberListResponse;
            console.error('保存成员列表失败：', errorData.message || error.message);
            return {
                success: false,
                count: 0,
                data: [],
                message: errorData?.message || '接口请求失败'
            };
        } else {
            console.error('保存成员列表异常：', error);
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
 * 添加单个成员（带鉴权）
 * @param member 成员信息
 * @returns 添加结果
 */
export async function addMember(member: ServerMember): Promise<MemberListResponse> {
    try {
        const authToken = generateAuthToken();
        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<MemberListResponse> = await apiClient.post('/api/members/add', {
            member
        }, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as MemberListResponse;
            console.error('添加成员失败：', errorData.message || error.message);
            return {
                success: false,
                count: 0,
                data: [],
                message: errorData?.message || '接口请求失败'
            };
        } else {
            console.error('添加成员异常：', error);
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
 * 删除单个成员（带鉴权）
 * @param uuid 成员 UUID
 * @returns 删除结果
 */
export async function deleteMember(uuid: string): Promise<MemberListResponse> {
    try {
        const authToken = generateAuthToken();
        const encodedToken = encodeURIComponent(authToken);

        const response: AxiosResponse<MemberListResponse> = await apiClient.delete(`/api/members/${uuid}`, {
            params: {
                token: encodedToken
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data as MemberListResponse;
            console.error('删除成员失败：', errorData.message || error.message);
            return {
                success: false,
                count: 0,
                data: [],
                message: errorData?.message || '接口请求失败'
            };
        } else {
            console.error('删除成员异常：', error);
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
 * 生成 Mineatar 头像 URL
 * @param name 玩家名称
 * @param _options
 * @returns 头像 URL
 */
export function generateFaceUrl(
    name: string,
    _options?: {
        scale?: number;
        overlay?: boolean;
        download?: boolean;
        format?: 'png' | 'jpg' | 'gif';
    }
): string {
    return `https://crafthead.net/bust/${name}`;
}
