/**
 * 路由配置类型定义
 */
export interface RouteMeta {
    /** 页面描述 */
    description?: string
    /** 图标名称 */
    icon?: string
    /** 是否需要认证 */
    requiresAuth?: boolean

    /** 其他自定义元信息 */
    [key: string]: any
}

export interface RouteConfig {
    /** 路由路径 */
    path: string
    /** 路由名称 */
    name: string
    /** 页面标题 */
    title: string
    /** 组件名称（用于动态导入） */
    component: string
    /** 路由元信息 */
    meta?: RouteMeta
}

export interface RoutesConfig {
    /** 路由配置列表 */
    routes: RouteConfig[]
}
