<template>
  <component :is="tag" ref="el" class="UiMarquee">
    <span v-if="border" class="border -top" />
    
    <!-- Model (hidden, used for measurement) -->
    <div ref="model" class="list model">
      <span class="item">
        <template v-if="Array.isArray(text)">
          <span
            v-for="(entry, index) in text"
            :key="`marquee-entry-${index}`"
            class="text"
            v-html="entry"
          />
        </template>
        <span v-else class="text" v-html="text" />
      </span>
    </div>
    
    <!-- Animated clones -->
    <div class="wrapper">
      <div ref="clones" class="list clones" />
    </div>
    
    <span v-if="border" class="border -bottom" />
  </component>
</template>

<script lang="ts">
/**
 * UiKit - Marquee
 * 
 * Texte défilant horizontal avec support GSAP.
 */

// Direction constants - must be outside setup for use in props defaults
export const DIRECTION = {
  LEFT_RIGHT: 1,
  RIGHT_LEFT: -1,
} as const
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { range } from 'lodash'

interface MarqueeProps {
  /** Texte ou tableau de textes */
  text: string | string[]
  /** Tag HTML */
  tag?: string
  /** Bordures haut/bas */
  border?: boolean
  /** Vitesse de base (0 = pas de mouvement) */
  speed?: number
  /** Direction: 1 = gauche->droite, -1 = droite->gauche */
  direction?: number
}

const props = withDefaults(defineProps<MarqueeProps>(), {
  text: '',
  tag: 'div',
  border: false,
  speed: 0.25,
  direction: 1, // DIRECTION.LEFT_RIGHT
})

const el = ref<HTMLElement | null>(null)
const model = ref<HTMLElement | null>(null)
const clones = ref<HTMLElement | null>(null)

let timeline: gsap.core.Timeline | null = null
let gsapModule: typeof import('vendors/gsap') | null = null
let initialized = false
let animationFrame: number | null = null

const init = () => {
  if (!model.value || !clones.value) return

  const content = model.value.innerHTML
  const width = model.value.scrollWidth
  const parentWidth = window.innerWidth

  // Create clones to fill the screen
  const repeat = width >= parentWidth ? 1 : Math.ceil((parentWidth - width) / width)
  clones.value.innerHTML = ''
  
  range(repeat * 8).forEach(() => {
    if (clones.value) {
      clones.value.innerHTML += content
    }
  })

  initialized = true
}

const createGsapTimeline = () => {
  if (!model.value || !clones.value || !initialized || !gsapModule) return

  const { gsap } = gsapModule

  timeline?.kill()

  const width = model.value.scrollWidth
  const direction = props.direction === DIRECTION.LEFT_RIGHT ? -(width * 2) : 0

  timeline = gsap.timeline({ repeat: -1, paused: props.speed === 0 })
    .fromTo(
      clones.value,
      { x: direction },
      { x: `+=${props.direction * width}`, ease: 'linear', duration: 1 / (props.speed || 0.25) }
    )

  if (props.speed > 0) {
    timeline.play()
  }
}

// CSS Animation fallback
const createCssAnimation = () => {
  if (!clones.value || !model.value) return

  const width = model.value.scrollWidth
  const duration = (1 / (props.speed || 0.25)) * 1000

  let position = props.direction === DIRECTION.LEFT_RIGHT ? -(width * 2) : 0
  const targetPosition = position + props.direction * width
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = (elapsed % duration) / duration
    const currentPos = position + (targetPosition - position) * progress

    if (clones.value) {
      clones.value.style.transform = `translateX(${currentPos}px)`
    }

    animationFrame = requestAnimationFrame(animate)
  }

  if (props.speed > 0) {
    animationFrame = requestAnimationFrame(animate)
  }
}

onMounted(async () => {
  setTimeout(async () => {
    init()
    
    // Try to load GSAP
    try {
      gsapModule = await import('vendors/gsap')
      createGsapTimeline()
    } catch {
      // Fallback to CSS animation
      createCssAnimation()
    }
  }, 100)
})

onUnmounted(() => {
  timeline?.kill()
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style lang="stylus" scoped>
.UiMarquee
  position relative
  rp(padding-top, 60px 30px)
  rp(padding-bottom, 60px 30px)
  width 100%
  overflow hidden
  white-space nowrap

.list
  f(row, $align: center)
  width fit-content

.item
  f(row, $align: center)
  width fit-content
  flex-shrink 0

.model
  visibility hidden
  position absolute

.text
  display block
  position relative
  font-weight $fw-semibold
  rp(font-size, 80px 24px)
  line-height 1
  rp(padding-right, 60px 30px)
  f(row, $align: center)
  flex-shrink 0

.border
  height 1px
  background-color currentColor
  display block
  
  &.-top
    margin-bottom 1em
  
  &.-bottom
    margin-top 1em
</style>
