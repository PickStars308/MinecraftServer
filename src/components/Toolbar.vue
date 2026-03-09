<script lang="ts" setup>
import useThemeStore from '@/stores/theme'
import {onMounted, ref} from 'vue'

const themeStore = useThemeStore()

const siteName = import.meta.env.VITE_SITE_NAME
const logoUrl = import.meta.env.VITE_SITE_LOGO

interface NavItem {
  path: string
  title: string
}

const navItems = ref<NavItem[]>([])
const isToolbarVisible = ref(true)

onMounted(() => {
  window.addEventListener('preview-state-change', (e: any) => {
    isToolbarVisible.value = e.detail.visible
  })


  window.addEventListener('scroll', handleScroll)
})

onMounted(async () => {
  try {
    const response = await fetch('/assets/json/routes.json')
    if (response.ok) {
      const config = await response.json()
      navItems.value = config.routes
          .filter((r: any) => r.path !== '*' && !r.meta?.hidden)
          .map((r: any) => ({
            path: r.path,
            title: r.title
          }))
    }
  } catch (error) {
    navItems.value = [
      {path: '/', title: '首页'},
      {path: '/gallery', title: '图库'},
      {path: '/experience', title: '历程'},
      {path: '/members', title: '成员'},
      {path: '/server', title: '服务器'}
    ]
  }
})


const handleScroll = () => {
  const scrollTop = window.scrollY
  isToolbarVisible.value = scrollTop < 100
}
</script>

<template>
  <header :class="{ hidden: !isToolbarVisible }" class="toolbar-wrap">
    <nav aria-label="主导航" class="toolbar">
      <div class="logo-section">
        <a class="logo-link" href="/">
          <img :src="logoUrl" alt="Logo" class="site-logo"/>
          <span class="site-name">{{ siteName }}</span>
        </a>
      </div>

      <div class="nav-section">
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" class="toolbar-link">
          {{ item.title }}
        </RouterLink>
      </div>

      <div class="right-section">
        <button
            id="theme-toggle"
            :aria-label="themeStore.theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
            class="theme-toggle"
            type="button"
            @click="themeStore.toggleTheme()"
        >
          <span aria-hidden="true" class="icon sun">
            <svg fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                 stroke-width="1.8"
                 viewBox="0 0 24 24" width="18">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2"></path>
              <path d="m19.07 4.93-1.77 1.77M6.7 17.3l-1.77 1.77M19.07 19.07l-1.77-1.77M6.7 6.7 4.93 4.93"></path>
            </svg>
          </span>
          <span aria-hidden="true" class="icon moon">
            <svg fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                 stroke-width="1.8"
                 viewBox="0 0 24 24" width="18">
              <path
                  d="M21 12.79A9 9 0 1 1 11.21 3c-.05.34-.08.68-.08 1.03A8 8 0 0 0 19.97 13c.35 0 .69-.03 1.03-.08z"></path>
            </svg>
          </span>
        </button>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.toolbar-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 14px 12px;
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: translateY(0);
}

.toolbar-wrap.hidden {
  transform: translateY(-100%);
}

.toolbar {
  width: min(1300px, 100%);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  padding: 14px 20px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.45);
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.site-logo {
  width: 32px;
  height: 32px;
  border-radius: 30%;
  object-fit: contain;
}

.site-name {
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
}

.toolbar-link {
  color: #1f2937;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 20px;
}

.toolbar-link:hover {
  color: #111827;
  background-color: rgba(0, 0, 0, 0.05);
}

.toolbar-link {
  color: #ffffff;
  background-color: #fb7ebb;
}

.right-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(30, 41, 59, 0.2);
  background: rgba(255, 255, 255, 0.65);
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.85);
}

.icon {
  display: inline-flex;
}

.moon {
  display: none;
}

html[data-theme="dark"] .toolbar {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(226, 232, 240, 0.18);
}

html[data-theme="dark"] .site-name,
html[data-theme="dark"] .toolbar-link {
  color: #e2e8f0;
}

html[data-theme="dark"] .toolbar-link:hover {
  color: #f8fafc;
  background-color: rgba(255, 255, 255, 0.1);
}

html[data-theme="dark"] .toolbar-link {
  color: #ffffff;
  background-color: #fb7ebb;
}

html[data-theme="dark"] .theme-toggle {
  background: rgba(15, 23, 42, 0.75);
  border-color: rgba(226, 232, 240, 0.28);
  color: #f8fafc;
}

html[data-theme="dark"] .theme-toggle:hover {
  background: rgba(15, 23, 42, 0.95);
}

html[data-theme="dark"] .moon {
  display: inline-flex;
}

@media (max-width: 900px) {
  .toolbar {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "logo actions"
      "nav nav";
    gap: 12px;
    padding: 12px 14px;
    border-radius: 18px;
  }

  .logo-section {
    grid-area: logo;
  }

  .right-section {
    grid-area: actions;
  }

  .nav-section {
    grid-area: nav;
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 2px;
    scrollbar-width: none;
    display: flex;
    justify-content: center;
  }

  .nav-section::-webkit-scrollbar {
    display: none;
  }

  .toolbar-link {
    font-size: 14px;
    padding: 7px 12px;
    flex: 0 0 auto;
  }
}

@media (max-width: 560px) {
  .toolbar-wrap {
    padding: 10px 8px;
  }

  .site-name {
    max-width: 120px;
    overflow: hidden;

  }

  .site-logo {
    width: 28px;
    height: 28px;
  }

  .theme-toggle {
    height: 34px;
  }
}
</style>
