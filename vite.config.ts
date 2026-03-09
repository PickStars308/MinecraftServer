import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import imageCompression from 'vite-plugin-image-compress'


export default defineConfig({
    plugins: [
        vue(),
        Components({
            dts: true,
            resolvers: [],
            dirs: ['src/components', 'src/views'],
            extensions: ['vue'],
            include: [/\.vue$/, /\.vue\?vue/],
            exclude: []
        }),
        imageCompression({
            include: [
                '/public/assets/images/**/*',
                '/src/assets/images/**/*',
                '\.png$',
                '\.jpg$',
                '\.jpeg$',
                '\.webp$'
            ],
            exclude: []
        })
    ],
    resolve: {
        alias: {
            '@': '/src'
        }
    }
})
