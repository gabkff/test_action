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
          v-if="webpSrc"
          type="image/webp"
          :srcset="webpSrc"
          :sizes="sizes"
        >
        <!-- Standard source -->
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
 */

import { ref, computed, onMounted } from 'vue'

interface ImageDetail {
  original?: {
    url: string
    sizes: { width: number; height: number }
  }
  focalPoint?: { x: number; y: number }
  optimized?: {
    standard?: Record<string, string>
    webp?: Record<string, string>
  }
}

interface PictureProps {
  /** Objet image avec les différentes sources */
  images?: ImageDetail
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
  sizes: undefined,
  lazy: true,
})

const el = ref<HTMLElement | null>(null)
const img = ref<HTMLImageElement | null>(null)
const loaded = ref(false)

const mainSrc = computed(() => props.images?.original?.url || '')
const webpSrc = computed(() => {
  if (!props.images?.optimized?.webp) return null
  return Object.entries(props.images.optimized.webp)
    .map(([size, url]) => `${url} ${size}w`)
    .join(', ')
})

const width = computed(() => props.images?.original?.sizes.width)
const height = computed(() => props.images?.original?.sizes.height)

const position = computed(() => {
  const fp = props.images?.focalPoint || { x: 0.5, y: 0.5 }
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

