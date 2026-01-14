import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import path from 'path'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
    VueI18nPlugin({
      compositionOnly: true,
      runtimeOnly: false,
      strictMessage: false,
      include: path.resolve(__dirname, './src/plugins/i18n/locales/**')
    }),
  ],

  // Configuration des aliases (doit matcher tsconfig.json !)
  // Utilise path.resolve() pour des chemins cross-platform (macOS, Linux, Windows)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'src': path.resolve(__dirname, 'src'),
      'assets': path.resolve(__dirname, 'src/assets'),
      'config': path.resolve(__dirname, 'src/config'),
      'pages': path.resolve(__dirname, 'src/pages'),
      'components': path.resolve(__dirname, 'src/components'),
      'ui': path.resolve(__dirname, 'src/components/ui'),
      'UiKit': path.resolve(__dirname, 'src/components/UiKit'),
      'plugins': path.resolve(__dirname, 'src/plugins'),
      'store': path.resolve(__dirname, 'src/plugins/store'),
      'router': path.resolve(__dirname, 'src/router'),
      'utils': path.resolve(__dirname, 'src/utils'),
      'types': path.resolve(__dirname, 'src/types'),
      'i18n': path.resolve(__dirname, 'src/plugins/i18n'),
      'vendors': path.resolve(__dirname, 'src/vendors'),
    },
  },

  // Configuration CSS / Stylus
  css: {
    preprocessorOptions: {
      stylus: {
        // Import global des variables et mixins dans tous les fichiers Stylus
        // Cela permet d'utiliser les mixins comme rp(), f(), layout(), container() partout
        additionalData: `
          @import "${path.resolve(__dirname, 'src/assets/styles/settings/index.styl')}"
          @import "${path.resolve(__dirname, 'src/assets/styles/koddein/mixins/index.styl')}"
        `,
      }
    },
    devSourcemap: true,
  },

  // Configuration Vite pour Tauri (conservée)
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
}))
