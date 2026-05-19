<template>
  <div id="the-app" class="the-app">
    <!-- Écran de chargement (fond fjord + logo) pendant init/merge, puis fondu vers opacity 0 -->
    <div
      v-if="!appStore.isAppReady || isFadingOut"
      class="app-splash"
      :class="{ 'app-splash--out': isFadingOut }"
      aria-hidden="true"
      @transitionend="onSplashTransitionEnd"
    >
      <img :src="logoSrc" alt="" class="app-splash__logo" />
    </div>

    <!-- Contenu principal via le router -->
    <main class="the-app__main">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <sidePanel />
    <menuModal />
    <!-- Footer global (optionnel) -->
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup lang="ts">
/**
 * TheApp - Composant racine de l'application
 * 
 * Ce composant englobe toute l'application et gère :
 * - La structure globale (header, main, footer)
 * - Les transitions entre les pages
 * - Le layout général
 */

import { ref, watch, onMounted } from 'vue'
import { initMap } from 'components/ui/Maps/googleServices'
import { store as appStore } from 'plugins/store/app'
import sidePanel from 'components/UiKit/SidePanel/index.vue'
import menuModal from 'components/UiKit/Menu/menuModal.vue'
import logoSrc from 'assets/svg/logo.svg'

const isFadingOut = ref(false)

watch(
  () => appStore.isAppReady,
  (ready) => {
    if (ready) isFadingOut.value = true
  }
)

function onSplashTransitionEnd(e: TransitionEvent) {
  if (e.target !== e.currentTarget || !isFadingOut.value) return
  isFadingOut.value = false
}

onMounted(async () => {
  // Initialise les données (cache + API ou mock selon le mode)
  await appStore.initData()
  await initMap()
  console.log('✅ Application montée et prête')
})
</script>

<style lang="stylus" scoped>
.the-app
  min-height 100vh
  display flex
  flex-direction column
  background $fjord

  &__main
    flex: 1
    display: flex
    flex-direction: column

.app-splash
  position fixed
  inset 0
  background $fjord
  display flex
  align-items center
  justify-content center
  z-index 9999
  transition opacity 0.4s ease

  &--out
    opacity 0
    pointer-events none

  &__logo
    max-width 180px
    width 100%
    height auto
    object-fit contain
    // Logo SVG est en #102838 (fjord) : on l’affiche en clair sur le fond fjord
    filter brightness(0) invert(1)

// Transitions entre les pages
.fade-enter-active
.fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from
.fade-leave-to
  opacity: 0
</style>

