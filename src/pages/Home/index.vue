<template>
  <div class="home">
    <div class="home__part">
      <div class="bg bg_fr" :style="{backgroundImage: `url(${ImgBackgroundFr})`}"></div>
      <div class="home__part__wrapper" ref="wrapperFrRef" :style="wrapperFrMaskStyle">
        <svg class="wrapper-mask-svg" aria-hidden="true">
          <defs>
            <mask id="wrapper-mask-fr" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
              <rect x="0" y="0" width="1" height="1" fill="white"/>
              <rect
                v-for="(h, i) in holeRectsFr"
                :key="i"
                :x="h.x"
                :y="h.y"
                :width="h.w"
                :height="h.h"
                rx="0.02"
                ry="0.02"
                fill="black"
              />
            </mask>
          </defs>
        </svg>
        <div class="line_1_fr line">
          <div class="line_1_fr__title text_fr"> LAISSEZ</div>
          <div class="mask mask1_fr"></div>
        </div>
        <div class="line_2_fr line">
          <div class="line_2_fr__title text_fr"> VOUS</div>
          <div class="mask mask2_fr"></div>
        </div>
        <div class="line_3_fr mask line"></div>
        <div class="line_4_fr line">
          <div class="mask mask4_fr"></div>
          <div class="line_4_fr__title text_fr"> GUIDER</div>
          <ui-button theme="primary" :label="$t('home.touch_to_start')" @click="router.push('/select')" :icon="IconArrow" :big="true" :iconPosition="'right'"/>
        </div>
      </div>
    </div>
    <div class="home__part" ref="partEnRef" :style="{ backgroundImage: `url(${ImgBackgroundEn})` }">
      <div class="home__part__overlay" ref="overlayEnRef" :style="overlayEnMaskStyle"></div>
      <div class="home__part__content">
        <div class="line line_1_en">
          <div class="mask mask1_en"></div>
          <div class="line_1_en__title text_en"> LET US</div>
        </div>
        <div class="line line_2_en">
          <div class="line_2_en__title text_en"> GUIDE</div>
          <div class="mask mask2_en"></div>
        </div>
        <div class="line line_3_en">
          <div class="mask mask3_en"></div>
          <div class="line_3_en__title text_en"> YOU</div>
          <ui-button theme="primary" :label="$t('home.touch_to_start')" @click="router.push('/select')" :icon="IconArrow" :big="true" :iconPosition="'right'"/>
        </div>
      </div>
      <svg class="wrapper-mask-svg" aria-hidden="true">
        <defs>
          <mask id="wrapper-mask-en" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height="1" fill="white"/>
            <rect
              v-for="(h, i) in holeRectsEn"
              :key="i"
              :x="h.x"
              :y="h.y"
              :width="h.w"
              :height="h.h"
              rx="0.02"
              ry="0.02"
              fill="black"
            />
          </mask>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
  import IconArrow from 'assets/svg/arrow.svg?raw'
  import ImgBackgroundFr from './assets/back_fr.png'
  import ImgBackgroundEn from './assets/back_en.png'
  import { useRouter } from 'vue-router'
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

  const router = useRouter()
  const wrapperFrRef = ref<HTMLElement | null>(null)
  const overlayEnRef = ref<HTMLElement | null>(null)
  const partEnRef = ref<HTMLElement | null>(null)

  type HoleRect = { x: number; y: number; w: number; h: number }
  const holeRectsFr = ref<HoleRect[]>([])
  const holeRectsEn = ref<HoleRect[]>([])

  const maskStyle = (id: string) => ({
    maskImage: `url(#${id})`,
    WebkitMaskImage: `url(#${id})`,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  })
  const wrapperFrMaskStyle = computed(() =>
    holeRectsFr.value.length ? maskStyle('wrapper-mask-fr') : {},
  )
  const overlayEnMaskStyle = computed(() =>
    holeRectsEn.value.length ? maskStyle('wrapper-mask-en') : {},
  )

  function getHoleRects(container: HTMLElement): HoleRect[] {
    const rect = container.getBoundingClientRect()
    const masks = container.querySelectorAll<HTMLElement>('.mask')
    return Array.from(masks).map((el) => {
      const r = el.getBoundingClientRect()
      return {
        x: (r.left - rect.left) / rect.width,
        y: (r.top - rect.top) / rect.height,
        w: r.width / rect.width,
        h: r.height / rect.height,
      }
    })
  }

  function updateHoles() {
    if (wrapperFrRef.value) holeRectsFr.value = getHoleRects(wrapperFrRef.value)
    if (overlayEnRef.value && partEnRef.value) {
      const partRect = partEnRef.value.getBoundingClientRect()
      const masks = partEnRef.value.querySelectorAll<HTMLElement>('.mask')
      holeRectsEn.value = Array.from(masks).map((el) => {
        const r = el.getBoundingClientRect()
        return {
          x: (r.left - partRect.left) / partRect.width,
          y: (r.top - partRect.top) / partRect.height,
          w: r.width / partRect.width,
          h: r.height / partRect.height,
        }
      })
    }
  }

  onMounted(() => {
    nextTick(updateHoles)
    window.addEventListener('resize', updateHoles)
  })
  onUnmounted(() => window.removeEventListener('resize', updateHoles))
</script>

<style lang="stylus" scoped>
.home
  background $fjord
  f(column, $justify: flex-start, $align: flex-start)
  r(gap, 183px)
  width 100vw
  height 100vh
  r(padding-top, 696px)
  r(padding-left, 271px)
  r(padding-right, 271px)
  r(padding-bottom, 656px)
  background-size cover
  .home__part
    width 100%
    height 100%
    position relative
  .home__part__wrapper
    background-color $fjord
    position relative
    z-index 1
    .wrapper-mask-svg
      position absolute
      width 0
      height 0
      overflow hidden
    .mask
      visibility hidden
  .home__part__overlay
    position absolute
    inset 0
    z-index 1
    background-color $fjord
    pointer-events none
  .home__part__content
    position relative
    z-index 2
  .home__part:last-child .wrapper-mask-svg
    position absolute
    width 0
    height 0
    overflow hidden
  .home__part:last-child .mask
    visibility hidden
  .bg
    position absolute
    inset 0
    z-index 0
    background-size cover
    background-position center
  .text_fr
    f-style('h0')
    color $ecume
  .text_en
    f-style('h0')
    color $lueur
  .line
    height 312px
    f(row, $justify: flex-start, $align: stretch)
  .mask
    flex 1
    min-width 0
    height 100%
    border-radius 20px
</style>