import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import path from 'path'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST

// Définition des dossiers pour les aliases
const DIRS = {
  SRC: '/src',
  ASSETS: '/src/assets',
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  base: '/',
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
  resolve: {
    alias: {
      '@': DIRS.SRC,
      'src': DIRS.SRC,
      'assets': DIRS.ASSETS,
      'config': `${DIRS.SRC}/config`,
      'pages': `${DIRS.SRC}/pages`,
      'components': `${DIRS.SRC}/components`,
      'ui': `${DIRS.SRC}/components/ui`,
      'UiKit': `${DIRS.SRC}/components/UiKit`,
      'plugins': `${DIRS.SRC}/plugins`,
      'store': `${DIRS.SRC}/plugins/store`,
      'router': `${DIRS.SRC}/router`,
      'utils': `${DIRS.SRC}/utils`,
      'types': `${DIRS.SRC}/types`,
      'i18n': `${DIRS.SRC}/plugins/i18n`,
      'vendors': `${DIRS.SRC}/vendors`,
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
