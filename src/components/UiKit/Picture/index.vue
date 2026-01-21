<template>
  <div
    ref="el"
    class="UiPicture"
    :data-cover="cover"
    :data-loaded="loaded"
    :data-lazy="lazy"
  >
    <div class="container">
      <picture class="picture">
        <!-- WebP source -->
        <source
          v-if="webpSrcset"
          type="image/webp"
          :srcset="webpSrcset"
          :sizes="sizes"
        >
        <!-- Standard source -->
        <source
          v-if="standardSrcset"
          :srcset="standardSrcset"
          :sizes="sizes"
        >
        <!-- Fallback img -->
        <img
          ref="img"
          class="img"
          :src="mainSrc"
          :alt="alt"
          :width="width"
          :height="height"
          :loading="lazy ? 'lazy' : 'eager'"
          @load="onLoad"
        >
      </picture>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * UiKit - Picture
 * 
 * Composant image avec support du lazy loading, webp et focal point.
 * Utilise automatiquement les URLs locales si les assets sont en cache.
 */

import { ref, computed, onMounted } from 'vue'

interface PictureProps {
  /** Objet image (type Image global) */
  images?: Image
  /** Texte alternatif */
  alt?: string
  /** Mode de couverture: cover | contain */
  cover?: 'cover' | 'contain'
  /** Attribut sizes pour le responsive */
  sizes?: string
  /** Lazy loading */
  lazy?: boolean
}

const props = withDefaults(defineProps<PictureProps>(), {
  images: undefined,
  alt: '',
  cover: 'contain',
  sizes: '100vw',
  lazy: true,
})

const el = ref<HTMLElement | null>(null)
const img = ref<HTMLImageElement | null>(null)
const loaded = ref(false)

/**
 * Retourne l'URL telle quelle (les URLs sont déjà locales dans data.json)
 */
const getUrl = (url: string | undefined): string => {
  return url || ''
}

/**
 * Source principale (original ou fallback sur optimized)
 */
const mainSrc = computed(() => {
  // Préfère l'URL originale
  if (props.images?.images?.original?.url) {
    return getUrl(props.images.images.original.url)
  }
  // Fallback sur la plus grande taille optimisée
  const standard = props.images?.images?.optimized?.standard
  if (standard) {
    const sizes = Object.keys(standard).map(Number).sort((a, b) => b - a)
    if (sizes.length > 0) {
      return getUrl(standard[sizes[0].toString()])
    }
  }
  return ''
})

/**
 * Srcset pour les images WebP (optimisées)
 */
const webpSrcset = computed(() => {
  const webp = props.images?.images?.optimized?.webp
  if (!webp) return null
  
  return Object.entries(webp)
    .map(([size, url]) => `${getUrl(url)} ${size}w`)
    .join(', ')
})

/**
 * Srcset pour les images standard (optimisées)
 */
const standardSrcset = computed(() => {
  const standard = props.images?.images?.optimized?.standard
  console.log('standard', props.images)
  if (!standard) return null
  
  return Object.entries(standard)
    .map(([size, url]) => `${getUrl(url)} ${size}w`)
    .join(', ')
})

const width = computed(() => props.images?.images?.original?.sizes?.width)
const height = computed(() => props.images?.images?.original?.sizes?.height)

const position = computed(() => {
  const fp = props.images?.images?.focalPoint || { x: 0.5, y: 0.5 }
  return `${fp.x * 100}% ${fp.y * 100}%`
})

const onLoad = () => {
  loaded.value = true
}

onMounted(() => {
  if (img.value?.complete) {
    loaded.value = true
  }
})
</script>

<style lang="stylus" scoped>
.UiPicture
  position relative
  overflow hidden
  display block
  line-height 0
  border-radius 12px

.container
  display inline-block
  position relative
  overflow hidden
  width 100%
  height 100%

.picture
.img
  position relative
  display block
  z-index 2

.img
  transition opacity 0.6s ease, transform 0.6s ease
  
  [data-lazy="true"] &
    opacity 0
    transform scale(1.02)
    
  [data-lazy="true"][data-loaded="true"] &
    opacity 1
    transform scale(1)

[data-cover="cover"]
  .picture
    width 100%
    height 100%
  .img
    object-fit cover
    object-position v-bind(position)
    width 100%
    height 100%

[data-cover="contain"]
  .img
    object-fit contain
    object-position v-bind(position)
    max-width 100%
    height auto
</style>
