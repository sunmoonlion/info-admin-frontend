import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

import { VueRouterAutoImports } from 'unplugin-vue-router'

import VueRouter from 'unplugin-vue-router/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

import Layouts from 'vite-plugin-vue-layouts'
import UnoCSS from 'unocss/vite'

import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import { VitePWA } from 'vite-plugin-pwa'

import { viteMockServe } from 'vite-plugin-mock'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { visualizer } from 'rollup-plugin-visualizer'
import { cdn } from 'vite-plugin-cdn-next'

// electron
import electron from 'vite-plugin-electron'
import pkg from './package.json'
import { notBundle } from 'vite-plugin-electron/plugin'

import { VpAutoImports, VpComponentsResolver } from 'el-admin-components/vite'

import copy from 'rollup-plugin-copy'

function customExternals(id: string) {
  const isElectron = process.env.ELECTRON === 'true'
  // return true -> external, false -> not external
  if (isElectron && id.includes('virtual:pwa-register/vue')) {
    return true
  }
  // 其他的外部依赖
  return false
}

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd()) // 加载 `.env.[mode]`  const isServe = command === 'serve'
  const isProd = mode === 'production'
  // In dev, use absolute base so assets/modules resolve correctly
  // when accessed via external IP (e.g. http://43.159.148.235:5173).
  const base = isProd ? process.env.BASE_PATH || '/' : '/'

  const isAnalysis = process.env.ANALYSIS === 'true'
  const isSourceMap = process.env.SOURCE_MAP === 'true'

  const isElectron = process.env.ELECTRON === 'true'
  const isBuild = command === 'build'
  const isServe = command === 'serve'

  const enablePWADEBUG = env.VITE_PWA_DEBUG === 'true'
  const enableMock = env.VITE_MOCK_ENABLE === 'true'

  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  const EPComponentsResolver: never[] = [] // disabled: app.use(ElementPlus) handles global registration

  return {
    base,
    // 通过局域网/公网 IP 访问 dev 时，Vite 会校验 Host；不放行则 /@vite、/src 等请求 403，页面空白。
    ...(isServe
      ? {
          server: {
            host: true,
            allowedHosts: true
          }
        }
      : {}),
    // preview / 部分部署方式同样走 Host 校验
    preview: {
      host: true,
      allowedHosts: true
    },
    build: {
      sourcemap: isSourceMap,
      rollupOptions: {
        external: (id) => customExternals(id)
      }
    },
    plugins: [
      VueRouter(),
      vue(),
      vueJsx(),
      // vueDevTools(), // disabled: causes path resolution errors when accessed via external IP
      UnoCSS(),
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/ // .md
        ],

        // global imports to register
        imports: [
          // presets
          'vue',
          // 'vue-router'
          VueRouterAutoImports,
          '@vueuse/core',
          VpAutoImports
        ],
        resolvers: [],
        vueTemplate: true
      }),
      Components({
        directoryAsNamespace: false,
        collapseSamePrefixes: true,
        resolvers: [] // ElementPlus and el-admin-components registered globally in main.ts
      }),
      Layouts({
        layoutsDirs: 'src/layouts',
        defaultLayout: 'default'
      }),
      ...(isElectron
        ? [
          electron([
            {
              // Main process entry file of the Electron App.
              entry: 'electron/main/index.ts',
              onstart({ startup }) {
                if (process.env.VSCODE_DEBUG) {
                  console.log(/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App')
                } else {
                  startup()
                }
              },
              vite: {
                build: {
                  sourcemap,
                  minify: isBuild,
                  outDir: 'dist-electron/main',
                  rollupOptions: {
                    // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons,
                    // we can use `external` to exclude them to ensure they work correctly.
                    // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
                    // Of course, this is not absolute, just this way is relatively simple. :)
                    external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
                  }
                },
                plugins: [
                  // This is just an option to improve build performance, it's non-deterministic!
                  // e.g. `import log from 'electron-log'` -> `const log = require('electron-log')`
                  isServe && notBundle()
                ]
              }
            },
            {
              entry: 'electron/preload/index.ts',
              onstart({ reload }) {
                // Notify the Renderer process to reload the page when the Preload scripts build is complete,
                // instead of restarting the entire Electron App.
                reload()
              },
              vite: {
                build: {
                  sourcemap: sourcemap ? 'inline' : undefined, // #332
                  minify: isBuild,
                  outDir: 'dist-electron/preload',
                  rollupOptions: {
                    external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
                  }
                },
                plugins: [isServe && notBundle()]
              }
            }
          ])
        ]
        : [
          VitePWA({
            injectRegister: 'auto',
            manifest: {
              name: 'Info Admin CSR',
              short_name: 'Info Admin',
              theme_color: '#ffffff',
              icons: [
                {
                  src: '/192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
                },
                {
                  src: '/512x512.png',
                  sizes: '512x512',
                  type: 'image/png'
                }
              ]
            },
            registerType: 'autoUpdate',
            workbox: {
              navigateFallback: '/',
              // 如果大家有很大的资源文件，wasm bundle.js
              globPatterns: ['**/*.*']
            },
            devOptions: {
              enabled: enablePWADEBUG,
              suppressWarnings: true,
              navigateFallbackAllowlist: [/^\/$/],
              type: 'module'
            }
          }),
          viteMockServe({
            mockPath: 'mock',
            enable: enableMock
          }),
          cdn({
            // url: 'https://unpkg.com',
            modules: [
              { name: 'vue', relativeModule: './dist/vue.global.prod.js' },
              'vue-demi',
              { name: 'pinia', relativeModule: './dist/pinia.iife.prod.js' },
              // 关注issue: https://github.com/nonzzz/vite-plugin-cdn/issues/30
              // { name: 'vue-router',aliases: ['auto', 'auto/routes'], relativeModule: './dist/vue-router.global.prod.js' },
              {
                name: 'element-plus',
                aliases: ['lib', 'es'],
                spare: [
                  { url: 'https://cdn.jsdelivr.net/npm/element-plus@2.4.2/dist/index.css' },
                  { url: 'https://cdn.jsdelivr.net/npm/element-plus@2.4.2/theme-chalk/dark/css-vars.css' }
                ]
              },
              {
                name: 'echarts',
                aliases: ['core', 'renderers', 'components', 'features', 'charts'],
                spare: [
                  {
                    url: 'https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js',
                    defer: true
                  }
                ]
              },
              {
                name: 'sortablejs',
                global: 'Sortable',
                relativeModule: './Sortable.min.js',
                spare: [
                  {
                    async: true,
                    url: 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js'
                  }
                ]
              },
              {
                name: 'vditor',
                global: 'Vditor',
                relativeModule: './dist/index.min.js',
                spare: [{ url: 'https://cdn.jsdelivr.net/npm/vditor@3.9.6/dist/index.css', defer: true }]
              },
              {
                name: 'video.js',
                global: 'videojs',
                relativeModule: './dist/video.min.js',
                spare: [
                  { url: 'https://cdn.jsdelivr.net/npm/video.js@8.6.1/dist/video-js.min.css', defer: true }
                ]
              }
            ],
            resolve: {
              name: 'resolve:custom',
              setup({ extra }) {
                const baseURL = 'https://cdn.jsdelivr.net/npm/'
                const { version, name, relativeModule } = extra
                const url = new URL(`${name}@${version}/${relativeModule}`, baseURL)
                return {
                  url: url.href,
                  injectTo: 'head-prepend',
                  attrs: {}
                }
              }
            },
            apply: 'build'
          })
        ]),

      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]'
      }),
      visualizer({
        open: isAnalysis
      }),
      copy({
        targets: []
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'pinia-plugin-persistedstate',
        '@vueuse/core',
        'element-plus',
        'element-plus/es',
        '@element-plus/icons-vue',
        'el-admin-components',
        'vue-i18n',
        'echarts',
        'vue-echarts',
        'sortablejs',
        'howler',
        'vditor',
        'video.js',
        '@iconify/vue',
        'axios'
      ]
    }
  }
})





