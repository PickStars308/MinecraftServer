<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {logoutAdmin} from '@/api/adminAuthApi'
import {checkForUpdates, getLatestVersion} from '@/utils/updateChecker'
import AdminToolbar from '@/components/AdminToolbar.vue'

const route = useRoute()
const router = useRouter()
const hasUpdate = ref(false)

const navItems = computed(() => [
  {key: 'overview', label: '概览', to: '/admin/panel'},
  {key: 'gallery', label: '编辑画廊', to: '/admin/gallery'},
  {key: 'timeline', label: '编辑时间线', to: '/admin/timeline'},
  {key: 'members', label: '编辑成员', to: '/admin/members'},
  {key: 'config', label: '站点配置', to: '/admin/config'},
  {key: 'about', label: '关于项目', to: '/admin/about'}
])

const currentTabLabel = computed(() => navItems.value.find(item => item.to === route.path)?.label ?? '管理面板')

const isActive = (path: string) => route.path === path

const navigateTo = async (path: string) => {
  if (path !== route.path) {
    await router.push(path)
  }
  mobileMenuOpen.value = false
}

const handleLogout = async () => {
  try {
    await logoutAdmin()
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    await router.replace('/admin/login')
  }
}


const mobileMenuOpen = ref(false)

onMounted(async () => {
  await checkForUpdates()
  const latestVersion = getLatestVersion()
  hasUpdate.value = latestVersion && latestVersion !== '1.0.0'
})
</script>

<template>
  <div class="admin-panel-container">
    <AdminToolbar/>

    <section class="admin-layout">
      <button v-if="!mobileMenuOpen" aria-label="打开菜单" class="mobile-hamburger"
              @click="mobileMenuOpen = !mobileMenuOpen">
        <span :class="{ open: mobileMenuOpen }"></span>
      </button>

      <aside :class="{ 'mobile-open': mobileMenuOpen }" class="sidebar glass">
        <div class="brand">
          <p class="brand-kicker">Minecraft Admin</p>
          <h1 class="brand-title">管理面板</h1>
        </div>
        <nav class="nav-list">
          <button v-for="item in navItems" :key="item.key" :class="{ active: isActive(item.to) }" class="nav-item"
                  type="button" @click="navigateTo(item.to)">
            {{ item.label }}
            <span v-if="item.key === 'about' && hasUpdate" class="update-badge"></span>
          </button>
        </nav>
        <button class="logout-btn" type="button" @click="handleLogout">退出登录</button>
      </aside>

      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>

      <main class="workspace">
        <header class="workspace-top glass">
          <div class="header-left">
            <h2 class="workspace-title">{{ currentTabLabel }}</h2>
            <p class="workspace-sub">版本 v1.0.0</p>
          </div>
        </header>

        <RouterView/>
      </main>
    </section>
  </div>
</template>

<style lang="scss" scoped>
$radius: 20px;
$gap: 24px;
$mobile-break: 1024px;

.admin-panel-container {
  width: 100%;
  min-height: 100vh;
}

.admin-layout {
  width: min(85%, 100%);
  min-height: calc(100vh - 32px);
  margin: 0 auto;
  padding: 100px 10px $gap 10px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: $gap;
  position: relative;
}

.glass {
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: $radius;
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}


.mobile-hamburger {
  display: none;
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1001;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  backdrop-filter: blur(8px);

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 3px;
    background: var(--color-text-black);
    border-radius: 2px;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      background: inherit;
      border-radius: inherit;
      transition: all 0.3s ease;
    }

    &::before {
      top: -8px;
    }

    &::after {
      top: 8px;
    }
  }

  &.open span {
    background: transparent;

    &::before {
      transform: rotate(45deg);
      top: 0;
    }

    &::after {
      transform: rotate(-45deg);
      top: 0;
    }
  }
}

.sidebar {
  height: calc(100vh - 144px);
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  gap: 28px;
  position: sticky;
  top: 24px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
}


@media (max-width: $mobile-break) {
  .admin-layout {
    grid-template-columns: 1fr;
    padding: 80px 12px 24px;
  }

  .mobile-hamburger {
    display: block;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 280px;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
    border-radius: 0;
    box-shadow: 4px 0 30px rgba(0, 0, 0, 0.25);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .mobile-overlay {
    display: block;
  }

  .workspace-top {
    padding: 16px 20px;
  }
}

.brand-kicker {
  font-size: 0.8125rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fb7ebb;
  font-weight: 600;
}

.brand-title {
  margin-top: 8px;
  color: var(--color-text-black);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-item {
  border: none;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.5);
  color: var(--color-text-black);
  text-align: left;
  padding: 0 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(251, 126, 187, 0.12);
}

.nav-item.active {
  background: rgba(251, 126, 187, 0.28);
  color: #a93f75;
  font-weight: 700;
}

.update-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

.nav-item {
  position: relative;
}

.logout-btn {
  margin-top: auto;
  height: 48px;
  border-radius: 14px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.workspace {
  display: flex;
  flex-direction: column;
  gap: $gap;
}

.workspace-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workspace-title {
  color: var(--color-text-black);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.workspace-sub {
  color: var(--color-text-black);
  opacity: 0.65;
  font-size: 0.95rem;
}


html[data-theme='dark'] .glass {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

html[data-theme='dark'] .nav-item {
  background: rgba(2, 6, 23, 0.5);
}

html[data-theme='dark'] .nav-item:hover {
  background: rgba(30, 41, 59, 0.7);
}

html[data-theme='dark'] .brand-title,
html[data-theme='dark'] .workspace-title {
  color: #f1f5f9;
}

html[data-theme='dark'] .workspace-sub {
  color: #94a3b8;
}


@media (max-width: 768px) {
  .admin-layout {
    padding: 80px 12px 12px;
  }

  .workspace-title {
    font-size: 1.4rem;
  }

  .workspace-sub {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .admin-layout {
    padding: 72px 8px 8px;
  }

  .mobile-hamburger {
    bottom: 16px;
    left: 16px;
  }
}
</style>
