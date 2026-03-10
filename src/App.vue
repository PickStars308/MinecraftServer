<script lang="ts" setup>
import useThemeStore from './stores/theme'
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import Background from "@/components/Background.vue";
import Toolbar from "@/components/Toolbar.vue";
import GlassToast from "@/components/toast/GlassToast.vue";
import AppLoader from "@/components/AppLoader.vue";
import {startUpdateChecker, stopUpdateChecker} from "@/utils/updateChecker";
import {checkInstallStatus as checkInstallStatusApi} from "@/api/installApi";

const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()
const showToolbar = computed(() => !route.meta?.hideToolbar)
const viewKey = computed(() => route.path)
const isLoading = ref(true)

themeStore.initTheme()


async function checkInstallStatus(): Promise<boolean> {
  try {
    return await checkInstallStatusApi()
  } catch (error) {
    console.error('检查安装状态失败:', error)
    return false
  }
}

async function initInstallCheck() {
  try {
    const installed = await checkInstallStatus()

    if (!installed && route.path !== '/install') {
      router.replace('/install')
    } else if (installed && route.path === '/install') {
      router.replace('/')
    }
  } catch (error) {
    if (route.path !== '/install') {
      router.replace('/install')
    }
  } finally {
    isLoading.value = false
  }
}


onMounted(() => {
  initInstallCheck()
  startUpdateChecker();
});


onUnmounted(() => {
  stopUpdateChecker();
});
</script>

<template>
  <AppLoader v-if="isLoading"/>
  <div v-else class="app-container">
    <Background/>
    <Toolbar v-if="showToolbar"/>
    <GlassToast/>
    <main :class="{ 'no-toolbar': !showToolbar }" class="content-wrapper">
      <RouterView v-slot="{ Component }">
        <Transition mode="out-in" name="fade">
          <component :is="Component" :key="viewKey"/>
        </Transition>
      </RouterView>
    </main>
    <footer class="global-footer">
      <div class="footer-content">
        <p>Copyright © 2024 Minecraft Server. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex: 1;
  padding-top: 116px;
  box-sizing: border-box;
  justify-content: center;
}

.content-wrapper.no-toolbar {
  padding-top: 16px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding-top: 180px;
    padding-bottom: 16px;
  }

  .content-wrapper.no-toolbar {
    padding-top: 10px;
  }
}


/* 全局页脚样式 */
.global-footer {
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 20px 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-black);
  opacity: 0.7;
}

/* 深色主题适配 */
html[data-theme='dark'] .global-footer {
  background: rgba(15, 23, 42, 0.6);
  border-top-color: rgba(255, 255, 255, 0.1);
}

html[data-theme='dark'] .footer-content p {
  color: #f1f5f9;
  opacity: 0.6;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .global-footer {
    padding: 16px 0;
    margin-top: 30px;
  }

  .footer-content p {
    font-size: 0.8rem;
  }
}
</style>
