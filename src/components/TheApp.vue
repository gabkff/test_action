<template>
  <div id="the-app" class="the-app">
    <!-- Header global (optionnel) -->
    <!-- <AppHeader /> -->

    <!-- Contenu principal via le router -->
    <main class="the-app__main">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

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

import { onMounted } from 'vue'
import { useAppStore } from 'store/app'

const appStore = useAppStore()

onMounted(async () => {
  // Initialise les données (cache + API ou mock selon le mode)
  await appStore.initData()
  console.log('✅ Application montée et prête')
})
</script>

<style lang="stylus" scoped>
.the-app
  min-height: 100vh
  display: flex
  flex-direction: column

  &__main
    flex: 1
    display: flex
    flex-direction: column

// Transitions entre les pages
.fade-enter-active
.fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from
.fade-leave-to
  opacity: 0
</style>

