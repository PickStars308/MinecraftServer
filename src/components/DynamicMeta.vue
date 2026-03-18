<script lang="ts" setup>
import {computed, watch} from 'vue'
import useSiteConfigStore from '@/stores/siteConfig'

const siteConfigStore = useSiteConfigStore()

// 从 store 中获取配置
const config = computed(() => siteConfigStore.config)

// 动态更新 meta 信息
watch(
    () => config.value,
    (newConfig) => {
      if (newConfig) {
        updateMeta(newConfig)
      }
    },
    {immediate: true}
)

// 更新 meta 标签的函数
function updateMeta(configData: typeof config.value) {
  if (!configData) return

  // 更新文档标题
  document.title = configData.siteName || 'Minecraft Server'

  // 更新 meta 标签
  updateMetaTag('description', configData.siteDescription || '')
  updateMetaTag('keywords', configData.siteKeywords || '')
  updateMetaTag('author', configData.siteAuthor || '')

  // 更新 Open Graph meta
  updateMetaTag('og:title', configData.siteName || '', 'property')
  updateMetaTag('og:description', configData.siteDescription || '', 'property')
}

// 辅助函数：更新或创建 meta 标签
function updateMetaTag(name: string, content: string, attrType: 'name' | 'property' = 'name') {
  let metaTag = document.querySelector(`meta[${attrType}="${name}"]`)

  if (metaTag) {
    // 如果已存在，更新内容
    metaTag.setAttribute('content', content)
  } else {
    // 如果不存在，创建新的 meta 标签
    const newMetaTag = document.createElement('meta')
    newMetaTag.setAttribute(attrType, name)
    newMetaTag.setAttribute('content', content)
    document.head.appendChild(newMetaTag)
  }
}
</script>

<template>
  <div class="dynamic-meta"></div>
</template>

<style scoped>
.dynamic-meta {
  display: none;
}
</style>
