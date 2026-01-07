<template>
  <component
    :is="tag"
    ref="el"
    :data-played="played"
    :data-animation="animation"
    class="UiAnimation"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
/**
 * UiKit - Animation
 * 
 * Composant générique pour créer des animations au scroll.
 * Utilise GSAP si disponible, sinon fallback CSS.
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

type AnimationOpt = 'opacity' | 'fade' | 'list' | 'hero'

interface AnimationProps {
  /** Force un tag spécifique sur l'élément */
  tag?: string
  /** Nom de l'animation */
  animation?: AnimationOpt
  /** Autoplay au scroll */
  auto?: boolean
  /** Répète l'animation quand l'élément entre/sort du viewport */
  autoRepeat?: boolean
  /** Répète uniquement lors du scroll vers le haut */
  autoTop?: boolean
}

const props = withDefaults(defineProps<AnimationProps>(), {
  tag: 'div',
  animation: 'opacity',
  auto: true,
  autoRepeat: false,
  autoTop: false,
})

const el = ref<HTMLElement | null>(null)
const played = ref(false)

// Tenter d'importer GSAP dynamiquement
let gsapModule: typeof import('vendors/gsap') | null = null
let tl: gsap.core.Timeline | null = null

const hasGsap = computed(() => gsapModule !== null)

// Initialisation de l'animation avec GSAP
const initGsapAnimation = () => {
  if (!el.value || !gsapModule) return

  const { gsap } = gsapModule
  
  // Set initial state
  gsap.set(el.value, { alpha: 0, y: 20 })

  // Create timeline
  tl = gsap.timeline({
    paused: true,
    autoRemoveChildren: false,
  })
    .fromTo(el.value,
      { alpha: 0, y: 20 },
      { alpha: 1, y: 0, delay: 0.2, duration: 0.6, ease: 'power2.out' }
    )
}

const enter = () => {
  if (tl) {
    tl.timeScale(1).play(0)
  } else if (el.value) {
    // Fallback CSS
    el.value.style.opacity = '1'
    el.value.style.transform = 'translateY(0)'
  }
}

const leave = () => {
  if (tl) {
    tl.timeScale(2).reverse()
  } else if (el.value) {
    // Fallback CSS
    el.value.style.opacity = '0'
    el.value.style.transform = 'translateY(20px)'
  }
}

const dispose = () => {
  tl?.kill()
  tl = null
}

onMounted(async () => {
  if (!el.value) return

  // Try to load GSAP dynamically
  try {
    gsapModule = await import('vendors/gsap')
    initGsapAnimation()
  } catch {
    // GSAP not available, use CSS fallback
    if (el.value) {
      el.value.style.opacity = '0'
      el.value.style.transform = 'translateY(20px)'
      el.value.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    }
  }

  // Setup intersection observer for auto animation
  if (props.auto) {
    const { stop } = useIntersectionObserver(
      el,
      ([entry]) => {
        let fromTop = true
        if (props.autoTop) {
          fromTop = entry.boundingClientRect.y > 0
        }

        if (entry.isIntersecting && fromTop) {
          if (!props.autoRepeat && played.value) return
          enter()
          played.value = true
        } else if (!entry.isIntersecting && props.autoRepeat && fromTop) {
          leave()
          played.value = false
        }
      },
      { threshold: 0.1 }
    )

    onUnmounted(() => {
      stop()
      dispose()
    })
  }
})

// Expose methods
defineExpose({
  enter,
  leave,
  played,
  tl,
  hasGsap,
})
</script>

<style lang="stylus" scoped>
.UiAnimation
  will-change opacity, transform

[data-animation="list"]
  :deep(> *)
    opacity 0
    transform translateY(20px)
</style>
