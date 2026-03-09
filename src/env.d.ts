declare module '*.vue' {
  import type {DefineComponent} from 'vue'
  const component: DefineComponent<{}, {}, any>
    export default component
}


interface ImportMetaEnv {
    readonly VITE_SITE_NAME: string
    readonly VITE_SITE_DESCRIPTION: string
    readonly VITE_SITE_DESCRIPTION_MORE: string
    readonly VITE_SITE_LOGO: string
    readonly VITE_SITE_AUTHOR: string
    readonly VITE_SITE_VERSION: string
    readonly VITE_SITE_KEYWORDS: string
    readonly VITE_SERVER_ADDRESS: string
    readonly VITE_MINECRAFT_STATUS_API_URL: string
    readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
