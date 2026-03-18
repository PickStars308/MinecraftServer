import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

import compression from 'vite-plugin-compression'

import imageCompression from "vite-plugin-image-compress";


export default defineConfig({
    plugins: [
        vue(),

        compression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'gzip',
            ext: '.gz',
            deleteOriginFile: false
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
    build: {

        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.warn']
            },
            mangle: {

                keep_classnames: false,
                keep_fnames: false,
                toplevel: true
            }
        },

        rollupOptions: {
            output: {
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: '[ext]/[name]-[hash].[ext]',
                manualChunks(id) {

                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString()
                    }
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
})
