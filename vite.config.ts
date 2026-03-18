import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

import compression from 'vite-plugin-compression'

import obfuscator from 'vite-plugin-obfuscator'
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

        process.env.NODE_ENV === 'production' &&
        obfuscator({

            options: {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.8,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.4,
                stringArray: true,
                stringArrayEncoding: 'base64',
                stringArrayThreshold: 0.8,
                renameGlobals: false,
                renameProperties: false,
                transformObjectKeys: false,
                selfDefending: true,
                debugProtection: false,
                debugProtectionInterval: false
            }
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
