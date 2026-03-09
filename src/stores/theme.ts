import {defineStore} from 'pinia'

interface ThemeState {
    theme: 'light' | 'dark'
}

export const useThemeStore = defineStore('theme', {
    state: (): ThemeState => ({
        theme: 'light'
    }),

    actions: {
        setTheme(newTheme: 'light' | 'dark') {
            this.theme = newTheme

            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-theme', newTheme)
            }
        },

        toggleTheme() {
            this.setTheme(this.theme === 'light' ? 'dark' : 'light')
        },

        initTheme() {

            if (typeof document !== 'undefined') {

                if (this.theme) {
                    document.documentElement.setAttribute('data-theme', this.theme)
                } else {

                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                    const defaultTheme = prefersDark ? 'dark' : 'light'
                    this.theme = defaultTheme
                    document.documentElement.setAttribute('data-theme', defaultTheme)
                }
            }
        }
    },

    persist: {
        storage: localStorage
    }
})

export default useThemeStore
