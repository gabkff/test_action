<template>
  <nav class="NavBar">
    <!-- Décoration haut -->
    <div class="NavBar__cap NavBar__cap--top" v-html="IconTop" />
    
    <div class="NavBar__container">
      <!-- Bouton Back -->
      <button 
        v-if="back"
        type="button" 
        class="NavBar__item"
        @click="$emit('previous')"
      >
        <i class="NavBar__icon" v-html="IconBack" />
      </button>
      <!-- Bouton Home -->
      <button 
        v-if="home"
        type="button" 
        class="NavBar__item"
        :class="{ 'is-active': currentRoute === 'home' }"
        @click="panel ? handleClose() : handleHome(); $emit('menu');"
      >
        <i class="NavBar__icon" v-html="panel ? IconClose : IconHouse" />
      </button>
      
      <!-- Flèche haut (scroll up) -->
      <button 
        v-if="showScrollArrows"
        type="button" 
        class="NavBar__item NavBar__item--arrow NavBar__item--arrow-up"
        @click="$emit('scrollup')"
      >
        <i class="NavBar__icon NavBar__icon--arrow" v-html="IconArrow" />
      </button>
      
      <!-- Flèche bas (scroll down) -->
      <button 
        v-if="showScrollArrows"
        type="button" 
        class="NavBar__item NavBar__item--arrow NavBar__item--arrow-down"
        @click="$emit('scrolldown')"
      >
        <i class="NavBar__icon NavBar__icon--arrow" v-html="IconArrow" />
      </button>

      <button 
        v-if="next"
        type="button" 
        class="NavBar__item NavBar__item--arrow NavBar__item--arrow-next"
        @click="$emit('next')"
      >
        <i class="NavBar__icon NavBar__icon--arrow" v-html="IconArrow" />
      </button>
      
      <button 
        v-if="previous"
        type="button" 
        class="NavBar__item NavBar__item--arrow NavBar__item--arrow-previous"
        @click="$emit('previous')"
      >
        <i class="NavBar__icon NavBar__icon--arrow" v-html="IconArrow" />
      </button>

      <!-- Bouton Langue -->
      <button 
        type="button" 
        class="NavBar__item NavBar__item--lang"
        @click="handleLanguage"
      >
        <span class="NavBar__lang-text">{{ otherLang.charAt(0).toUpperCase() + otherLang.slice(1) }}</span>
      </button>
    </div>
    
    <!-- Décoration bas -->
    <div class="NavBar__cap NavBar__cap--bottom" v-html="IconBottom" />
  </nav>
</template>

<script setup lang="ts">
/**
 * NavBar - Barre de navigation latérale
 * 
 * Navigation verticale avec accès rapide à l'accueil et au changement de langue.
 * Utilise le store SidePanel pour ouvrir les panneaux correspondants.
 * Peut afficher des flèches de défilement si le contenu est scrollable.
 */

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidePanelStore } from 'store/sidePanel'
import { useI18nStore } from 'plugins/i18n/store'
import { AVAILABLE_LOCALES } from 'config'
import IconHouse from 'assets/svg/house.svg?raw'
import IconArrow from 'assets/svg/arrow.svg?raw'
import IconClose from 'assets/svg/cross.svg?raw'
import IconTop from 'assets/svg/top.svg?raw'
import IconBack from 'assets/svg/back.svg?raw'
import IconBottom from 'assets/svg/bottom.svg?raw'

interface NavBarProps {
  /** Affiche les flèches de défilement */
  showScrollArrows?: boolean
  next?: boolean
  previous?: boolean
  panel?: boolean
  lastStep?: boolean
  home?: boolean
  back?: boolean
}

const props = withDefaults(defineProps<NavBarProps>(), {
  showScrollArrows: false,
  lastStep: false,
  home: true,
})

defineEmits<{
  scrollup: []
  scrolldown: []
  next: []
  previous: []
  menu: []
}>()

const route = useRoute()
const router = useRouter()
const sidePanelStore = useSidePanelStore()
const i18nStore = useI18nStore()
// Route courante pour l'état actif
const currentRoute = computed(() => route.name as string)
const currentLocale = computed(() => i18nStore.locale)
// Autre langue disponible (pour le bouton de switch)
const otherLang = computed(() => {
  const current = currentLocale.value
  console.log('current other lang', current)
  const other = AVAILABLE_LOCALES.find(lang => lang !== current) || AVAILABLE_LOCALES[0]
  return other.charAt(0).toUpperCase() + other.slice(1)
})

/**
 * Gestion du clic sur Home
 */
function handleHome() {
  sidePanelStore.close()
  if (props.lastStep) router.push('/selection')
}

/**
 * Gestion du clic sur close
 */
function handleClose() {
  sidePanelStore.close()
}

/**
 * Gestion du clic sur Langue
 */
function handleLanguage() {
  i18nStore.setLocale(otherLang.value.toLowerCase() as LocaleKey)
}
</script>

<style lang="stylus" scoped>
.NavBar
  // Position gérée par le parent (sticky, fixed, etc.)
  z-index 100
  display flex
  flex-direction column
  align-items flex-start
  r(width, 124px 58px)
  z-index 1
  &__cap
    width 100%
    r(height, 132px 62px)
    background-size contain
    background-repeat no-repeat
    background-position center
    color white
    &--top
      margin-bottom -1px
    &--bottom
      margin-top -1px
    +layout(mobile)
      :deep(svg)
        width 100%
        height 100%

  &__container
    display flex
    flex-direction column
    align-items center
    r(gap, 20px 10px)
    r(padding, 50px 9px)
    width 100%
    background white
    transform scaleX(1)

  &__item
    r(size, 86px 20px)
    display flex
    align-items center
    justify-content center
    background none
    border none
    padding 0
    cursor pointer
    transition all 0.2s ease
    color $fjord
    
    &:hover
      opacity 0.7
    
    &.is-active
      color $primary

  &__icon
    margin auto
    display flex
    align-items center
    justify-content center
    width 45px
    
    :deep(svg)
      width 100%
      height 100%
      
      path
        stroke currentColor

  &__spacer
    display none

  &__item--arrow
    color $fjord
    
    &-up
      .NavBar__icon--arrow
        transform rotate(-90deg)
    
    &-down
      .NavBar__icon--arrow
        transform rotate(90deg)
    &-previous
      .NavBar__icon--arrow
        transform rotate(180deg)
    &-next
      .NavBar__icon--arrow
        transform rotate(0deg)

  &__icon--arrow
    r(width, 60px 30px)
    r(height, 60px 30px)

  &__item--lang
    color $fjord
    +layout(mobile)
      margin-top 1rem
    
  &__lang-text
    f-style('small-body')
    +layout(mobile)
      font-size 14px
</style>

