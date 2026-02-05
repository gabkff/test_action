<template>
  <div class="home" v-if="isAppReady">
    <div class="home__part">
      <div class="bg bg_fr" :style="{backgroundImage: `url(${imgBackgroundFr})`}"></div>
      <div class="home__part__wrapper" ref="wrapperFrRef" :style="wrapperFrMaskStyle">
        <div class="line_1_fr line">
          <div class="line_1_fr__title text_fr"> LAISSEZ</div>
          <div class="mask mask1_fr"></div>
        </div>
        <div class="line_2_fr line">
          <div class="line_2_fr__title text_fr"> VOUS</div>
          <div class="mask mask2_fr"></div>
        </div>
        <div class="line_3_fr line">
          <div class="mask mask3_fr"></div>
        </div>
        <div class="line_4_fr line">
          <div class="mask mask4_fr"></div>
          <div class="line_4_fr__title text_fr"> GUIDER</div>
          <ui-button class="button_fr" theme="primary" :label="'touchez pour commencer'" @click="goSelect('fr')" :icon="IconArrow" :big="true" :iconPosition="'right'"/>
        </div>
      </div>
    </div>
    <div class="home__part bg_en" ref="partEnRef" :style="{ backgroundImage: `url(${imgBackgroundEn})` }">
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
          <ui-button class="button_en" theme="primary" :label="'touch to start'" @click="goSelect('en')" :icon="IconArrow" :big="true" :iconPosition="'right'"/>
        </div>
      </div>
    </div>
    
    <!-- SVG masks inline dans le DOM -->
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
</template>

<script setup lang="ts">
  import IconArrow from 'assets/svg/arrow.svg?raw'
  import ImgBackgroundBackupFr from './assets/back_fr.png'
  import ImgBackgroundBackupEn from './assets/back_en.png'
  import { useI18nStore } from 'plugins/i18n/store'
  import { useRouter } from 'vue-router'
  import { store as appStore } from 'plugins/store/app'
  import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect } from 'vue'

  const i18nStore = useI18nStore()
  const router = useRouter()
  const isAppReady = computed(() => appStore.isAppReady)
  const wrapperFrRef = ref<HTMLElement | null>(null)
  const overlayEnRef = ref<HTMLElement | null>(null)
  const partEnRef = ref<HTMLElement | null>(null)

  type HoleRect = { x: number; y: number; w: number; h: number }
  const holeRectsFr = ref<HoleRect[]>([])
  const holeRectsEn = ref<HoleRect[]>([])
  const holesReady = ref(false)

  const maskStyle = (id: string) => ({
    maskImage: `url(#${id})`,
    WebkitMaskImage: `url(#${id})`,
  })


  
  const wrapperFrMaskStyle = computed(() =>
    holesReady.value && holeRectsFr.value.length ? maskStyle('wrapper-mask-fr') : {},
  )
  const overlayEnMaskStyle = computed(() =>
    holesReady.value && holeRectsEn.value.length ? maskStyle('wrapper-mask-en') : {},
  )

  const imgBackgroundFr = computed(() => {
    if (appStore.getAllData?.fr?.home?.main_image) {
      return appStore.getAllData!.fr!.home!.main_image!.images!.original!.url
    } else {
      return ImgBackgroundBackupFr
    }
  })

  const imgBackgroundEn = computed(() => {
    if (appStore.getAllData?.en?.home?.main_image) {
      return appStore.getAllData?.en!.home!.main_image!.images!.original!.url
    } else {
      return ImgBackgroundBackupEn
    }
  })
  // TODO VOIR SI ON PEUT PAS FAIRE MIEUX NIVEAU BACKGROUND
  watchEffect(() => {
    if (isAppReady.value && imgBackgroundFr.value) {
      setTimeout(() => {
        updateHoles()
      }, 100)
    }
  })
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
    console.log('updateHoles')
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
    holesReady.value = true
  }

  function goSelect(lang: string) {
    console.log('goEnglish')
    i18nStore.setLocale(lang as LocaleKey)
    console.log('i18nStore', i18nStore.locale)
    router.push('/selection')
  }

</script>

<style lang="stylus" scoped>
.home
  background $fjord
  f(column, $justify: flex-start, $align: flex-start)
  r(gap, 183px 45px)
  width 100vw
  height 100vh
  r(padding-top, 600px 222px)
  r(padding-left, 271px 220px)
  r(padding-right, 271px 220px)
  r(padding-bottom, 656px 222px)
  background-size cover
  position relative
  
  :deep(.UiButton)
    r(width, 401px 180px)
    r(height, 312px 111px)
    margin-top auto
    margin-bottom auto
    text-align left
    
  .button_fr
    background $fleuve
    
  .button_en
    background $bouleau
    
  .home__part
    width 100%
    height 100%
    position relative
    
  .home__part__wrapper
    background-color $fjord
    position relative
    z-index 1
    width 100%
    height 100%
    transform scale(1.003)
    f(column, $align: flex-start, $justify: flex-start)
    r(gap, 30px 30px)
    
    
  .home__part__overlay
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    z-index 1
    transform scale(1.004)
    background-color $fjord
    pointer-events none
    
  .home__part__content
    position relative
    z-index 2
    width 100%
    height 100%
    f(column, $align: flex-start, $justify: flex-start)
    r(gap, 30px 30px)
    
  .bg
    position absolute
    top 0
    left 0
    width 100%
    height 100%
  .bg, .bg_en
    z-index 0
    background-size cover
    background-position center
    background-repeat no-repeat
    background-position center
    
  .wrapper-mask-svg
    position absolute
    width 0
    height 0
    overflow hidden
    pointer-events none
    
  .text_fr
    f-style('h0')
    color $ecume
    
  .text_en
    f-style('h0')
    color $lueur
    
  .line
    width 100%
    flex 1
    f(row, $justify: flex-start, $align: center)
    r(gap, 30px 14px)
    r(margin-top, -40px)
    r(margin-bottom, -40px)
    
  .line:first-child
    margin-top 0
    
  .line:last-child
    margin-bottom 0
    
  .line_3_fr
    r(min-height, 433px 154px)
    
  .mask
    flex 1
    min-width 0
    r(height, 312px 111px)
    border-radius 20px
    visibility hidden
</style>