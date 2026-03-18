import {defineStore} from 'pinia'
import {ref} from 'vue'
import {getSiteConfig} from '@/api/installApi'
import {generateAuthToken} from '@/utils/cryptoUtils'

export interface SiteConfig {
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

export default defineStore('siteConfig', () => {
    const config = ref<SiteConfig | null>(null)
    const isLoading = ref(false)

    /**
     * 从后端加载站点配置
     */
    async function loadConfig() {
        if (config.value) {
            return config.value
        }

        isLoading.value = true
        try {
            const token = generateAuthToken()
            const result = await getSiteConfig(token)

            if (result.success && result.data) {
                config.value = result.data
                return result.data
            }
            return null
        } catch (error) {
            console.error('加载站点配置失败:', error)
            return null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 更新站点配置
     */
    function updateConfig(newConfig: Partial<SiteConfig>) {
        if (config.value) {
            config.value = {...config.value, ...newConfig}
        }
    }

    /**
     * 重置配置（用于安装后）
     */
    function resetConfig() {
        config.value = null
    }

    return {
        config,
        isLoading,
        loadConfig,
        updateConfig,
        resetConfig
    }
})
