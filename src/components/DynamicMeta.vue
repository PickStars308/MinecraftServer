<script lang="ts" setup>
import {computed, watch} from 'vue'
import useSiteConfigStore from '@/stores/siteConfig'

const siteConfigStore = useSiteConfigStore()


const config = computed(() => siteConfigStore.config)


watch(
    () => config.value,
    (newConfig) => {
      if (newConfig) {
        updateMeta(newConfig)
      }
    },
    {immediate: true}
)


function updateMeta(configData: typeof config.value) {
  if (!configData) return


  document.title = configData.siteName || 'Minecraft Server'


  updateMetaTag('description', configData.siteDescription || '')
  updateMetaTag('keywords', configData.siteKeywords || '')
  updateMetaTag('author', configData.siteAuthor || '')


  updateMetaTag('og:title', configData.siteName || '', 'property')
  updateMetaTag('og:description', configData.siteDescription || '', 'property')
}


function updateMetaTag(name: string, content: string, attrType: 'name' | 'property' = 'name') {
  let metaTag = document.querySelector(`meta[${attrType}="${name}"]`)

  if (metaTag) {

    metaTag.setAttribute('content', content)
  } else {

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
