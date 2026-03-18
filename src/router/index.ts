import type {RouteLocationNormalized, RouteRecordRaw} from 'vue-router'
import {createRouter, createWebHistory} from 'vue-router'
import type {RouteConfig as DynamicRouteConfig} from '@/types/routes'
import {checkAdminSession} from '@/api/adminAuthApi'

const fallbackComponent = () => import('@/views/HomeView.vue')


const componentMap: Record<string, () => Promise<any>> = {
    HomeView: () => import('@/views/HomeView.vue'),
    ServerView: () => import('@/views/ServerView.vue'),
    GalleryView: () => import('@/views/GalleryView.vue'),
    ExperienceView: () => import('@/views/ExperienceView.vue'),
    MembersView: () => import('@/views/MembersView.vue'),
    AdminLoginView: () => import('@/views/AdminLoginView.vue'),
    AdminPanelView: () => import('@/views/AdminPanelView.vue'),
    InstallView: () => import('@/views/InstallView.vue'),
    ErrorView: () => import('@/views/ErrorView.vue'),
    AdminOverviewView: () => import('@/views/admin/AdminOverviewView.vue'),
    AdminGalleryEditView: () => import('@/views/admin/AdminGalleryEditView.vue'),
    AdminTimelineEditView: () => import('@/views/admin/AdminTimelineEditView.vue'),
    AdminMembersEditView: () => import('@/views/admin/AdminMembersEditView.vue'),
    AdminConfigEditView: () => import('@/views/admin/AdminConfigEditView.vue')
}

const resolveComponent = (name: string): (() => Promise<any>) => componentMap[name] ?? fallbackComponent

async function requireAdminSession(to: RouteLocationNormalized, _from: RouteLocationNormalized) {
    const hasSession = await checkAdminSession()
    if (!hasSession) {
        return {
            path: '/admin/login',
            query: {redirect: to.fullPath}
        }
    }

    return true
}


async function redirectIfAuthenticated(_to: RouteLocationNormalized, from: RouteLocationNormalized) {
    if (from.path.startsWith('/admin')) {
        return true
    }

    const hasSession = await checkAdminSession()
    if (hasSession) {
        return '/admin/panel'
    }

    return true
}

function buildAdminRoutes(): RouteRecordRaw[] {
    return [
        {
            path: '/admin/login',
            name: 'admin-login',
            component: resolveComponent('AdminLoginView'),
            beforeEnter: redirectIfAuthenticated,
            meta: {
                title: 'Admin Login',
                hidden: true,
                hideToolbar: true
            }
        },
        {
            path: '/admin',
            component: resolveComponent('AdminPanelView'),
            redirect: '/admin/panel',
            meta: {
                hidden: true,
                hideToolbar: true
            },
            children: [
                {
                    path: 'panel',
                    name: 'admin-panel',
                    component: resolveComponent('AdminOverviewView'),
                    beforeEnter: requireAdminSession,
                    meta: {title: 'Control Panel', hideToolbar: true, hidden: true}
                },
                {
                    path: 'gallery',
                    name: 'admin-gallery',
                    component: resolveComponent('AdminGalleryEditView'),
                    beforeEnter: requireAdminSession,
                    meta: {title: 'Gallery Edit', hideToolbar: true, hidden: true}
                },
                {
                    path: 'timeline',
                    name: 'admin-timeline',
                    component: resolveComponent('AdminTimelineEditView'),
                    beforeEnter: requireAdminSession,
                    meta: {title: 'Timeline Edit', hideToolbar: true, hidden: true}
                },
                {
                    path: 'members',
                    name: 'admin-members',
                    component: resolveComponent('AdminMembersEditView'),
                    beforeEnter: requireAdminSession,
                    meta: {title: 'Members Edit', hideToolbar: true, hidden: true}
                },
                {
                    path: 'config',
                    name: 'admin-config',
                    component: resolveComponent('AdminConfigEditView'),
                    beforeEnter: requireAdminSession,
                    meta: {title: 'Site Config Edit', hideToolbar: true, hidden: true}
                }
            ]
        }
    ]
}

async function loadRoutesFromConfig(): Promise<RouteRecordRaw[]> {
    try {
        const isDev = import.meta.env.DEV
        let routesConfig: { routes: DynamicRouteConfig[] }

        if (isDev) {
            const response = await fetch('/assets/json/routes.json')
            if (!response.ok) {
                throw new Error('无法加载路由配置文件')
            }
            routesConfig = await response.json()
        } else {
            routesConfig = await import('../../public/assets/json/routes.json')
        }

        const dynamicRoutes: RouteRecordRaw[] = routesConfig.routes.map(route => ({
            path: route.path,
            name: route.name,
            component: resolveComponent(route.component),
            meta: {
                title: route.title,
                ...route.meta
            }
        }))

        return [

            {
                path: '/install',
                name: 'install',
                component: resolveComponent('InstallView'),
                meta: {
                    title: '安装向导',
                    hidden: true,
                    hideToolbar: true
                }
            },
            {
                path: '/error',
                name: 'error',
                component: resolveComponent('ErrorView'),
                meta: {
                    title: '错误页面',
                    hidden: true,
                    hideToolbar: true
                }
            },
            ...dynamicRoutes,
            ...buildAdminRoutes()
        ]
    } catch (error) {
        console.error('加载路由配置失败:', error)

        return [

            {
                path: '/install',
                name: 'install',
                component: resolveComponent('InstallView'),
                meta: {
                    title: '安装向导',
                    hidden: true,
                    hideToolbar: true
                }
            },
            {
                path: '/error',
                name: 'error',
                component: resolveComponent('ErrorView'),
                meta: {
                    title: '错误页面',
                    hidden: true,
                    hideToolbar: true
                }
            },
            {path: '/', component: resolveComponent('HomeView')},
            {path: '/server', component: resolveComponent('ServerView')},
            {path: '/gallery', component: resolveComponent('GalleryView')},
            {path: '/experience', component: resolveComponent('ExperienceView')},
            {path: '/members', component: resolveComponent('MembersView')},
            ...buildAdminRoutes()
        ]
    }
}

let router: ReturnType<typeof createRouter> | null = null

export async function initRouter() {
    if (router) return router

    const routes = await loadRoutesFromConfig()

    router = createRouter({
        history: createWebHistory(),
        routes
    })


    router.afterEach(to => {
        document.title = to.meta?.title
            ? `${to.meta.title} - ${import.meta.env.VITE_SITE_NAME || 'Minecraft Server'}`
            : import.meta.env.VITE_SITE_NAME || 'Minecraft Server'
    })

    return router
}

export default initRouter
