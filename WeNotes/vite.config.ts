import { rmSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron, { onstart } from 'vite-plugin-electron'
import pkg from './package.json'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

rmSync('dist', { recursive: true, force: true }) // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
      },
    },
  },
  plugins: [
    vue(),
    electron({
      main: {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            // For Debug
            sourcemap: true,
            outDir: 'dist/electron/main',
          },
          // Will start Electron via VSCode Debug
          plugins: [process.env.VSCODE_DEBUG ? onstart() : null],
        },
      },
      preload: {
        input: {
          // You can configure multiple preload here
          index: path.join(__dirname, 'electron/preload/index.ts'),
        },
        vite: {
          build: {
            // For Debug
            sourcemap: 'inline',
            outDir: 'dist/electron/preload',
          },
        },
      },
      // Enables use of Node.js API in the Renderer-process
      // https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#electron-renderervite-serve
      // renderer: {},
    }),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      resolvers: [ElementPlusResolver()],
      imports: [
        'vue',
        '@vueuse/core',
        {
          store: [['default', 'store']],
        },
      ],
      eslintrc: {
        // 默认 false, true 启用生成。生成auto-import的eslint规则
        // 否则这个文件每次会在重新加载的时候重新生成，这会导致 eslint 有时会找不到这个文件。当需要更新配置文件的时候，再重新打开
        enabled: true,
      },
    }),
    Components({
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' }),
        IconsResolver({
          prefix: false,
          enabledCollections: [
            'ep',
            'pajamas',
            'fluent',
            'codicon',
            'mdi',
            'icon-park-outline',
            'tabler',
            'carbon',
            'ph',
          ],
        }),
      ],
      dirs: ['src/components', 'src/layout'],
    }),
    Icons({
      autoInstall: true,
      // defaultStyle: 'vertical-align: middle',
    }),
  ],
  server: process.env.VSCODE_DEBUG
    ? {
        host: pkg.debug.env.VITE_DEV_SERVER_HOSTNAME,
        port: pkg.debug.env.VITE_DEV_SERVER_PORT,
      }
    : undefined,
})
