<docs>
  # UiSWiperDocsSingle
  > Single Layout ui-swiper
  
  @author Nicolas <nicolas@kffein.com>
</docs>
  
<script lang="ts">
import { defineComponent, PropType, toRefs, reactive } from 'vue';
import { templateRef } from '@vueuse/core';
import { map, each } from 'lodash';
import { gsap } from 'vendors/gsap';
import SvgArrow from 'assets/svg/arrow.svg?raw';
import { image } from 'assets/moc';
import Cursor from 'components/UiKit/Cursor/index.vue';

export type Item = {
  title: string
  image: Image
  href: string
  description?: Multiline
}

interface Data {
  swiperOptions: any,
  currentIndex: number,
  currentTransitionSpeed: number,
}

export default defineComponent({
  name: 'UiSWiperDocsSingle',
  components: {
    Cursor,
  },
  props: {
    options: {
      type: Object,
      default: null,
    },
    items: {
      type: Array as PropType<Item[]>,
      default: () => {
        return map([0, 1, 2, 3, 4, 5], () => ({
          title: 'some random title',
          image,
          href: 'https://google.ca',
          description: '<p>with a small description</p>'
        }))
      },
    }
  },
  setup() {
    const elNext: Obj = templateRef('elNext')
    const elPrev: Obj = templateRef('elPrev')
    const elSwiper: Obj = templateRef('elSwiper')

    const data: Data = reactive({
      currentIndex: 0,
      currentTransitionSpeed: 0,
      swiperOptions: {
        loop: false,
        spaceBetween: 0,
        slidePerView: 'auto',
        virtualTranslate: false,
        overflow: false,
        options: {
          followFinger: false,
          centeredSlides: true,
          watchSlidesVisibility: true,
          watchSlidesProgress: true,
          virtualTranslate: true,
          speed: 800,
          spaceBetween: 40, // more margin due to scale down of non-active slide
          loop: false,
          on: {
            slideChange: (swiper: any) => {
              data.currentIndex = swiper?.realIndex;
            },
            setTransition(swiper: any, transition: any) {
              data.currentTransitionSpeed = transition;
            },
            setTranslate: (swiper: any) => {
              const getTransitionSpeed = () => {
                const transitionSpeed = data.currentTransitionSpeed;
                // don't forget to reset the variable for future calls
                data.currentTransitionSpeed = 0;
                return transitionSpeed;
              }

              const durationInSeconds = getTransitionSpeed() / 1000;
              // convert slides object to plain array
              const slides = Object.values(swiper.slides);

              // do magic with each slide
              each(slides, (slide: any) => {
                const title = slide.querySelector('.carousel-description')
                const portrait = slide.querySelector('.carousel-picture')

                const arrtoTween = []
                // tableau pour timer nos animations les unes après les autres
                if (title) {
                  arrtoTween.push(title)
                }
                if (portrait) {
                  arrtoTween.push(portrait)
                }
                // to put the slides behind each other we have to set their CSS translate accordingly since by default they are arranged in line.
                const offset = slide.swiperSlideOffset;
                let x = -offset;
                if (!swiper.params.virtualTranslate) x -= swiper.translate;
                gsap.to(slide, {
                  duration: 0,
                  delay: Math.round(slide.progress) > 0 ? 0 : durationInSeconds,
                  x: Math.round(slide.progress) > 0 ? x : swiper.translate,
                });
                gsap.to(slide, {
                  // here we round because of zoom, if zoom progress is never exactly 0 or 1
                  alpha: Math.round(slide.progress) > 0 ? 0 : 1,
                });

                gsap.timeline({
                  delay: Math.round(slide.progress) === 0 ? durationInSeconds : 0,
                })
                  .fromTo(arrtoTween, { alpha: Math.round(slide.progress) === 0 ? 0 : 1 }, {
                    alpha: Math.round(slide.progress) === 0 ? 1 : 0, stagger: Math.round(slide.progress) === 0 ? 0.12 : 0, ease: 'power2.out',
                  })
              })

            }
          }
        }
      }
    })

    return {
      elSwiper, elNext, elPrev,
      SvgArrow,
      ...toRefs(data),
    }
  }
});
</script>
  
<template>
  <section v-if="items.length > 0" class="_container">
    <ui-swiper ref="elSwiper"
               tag="ul"
               class="list"
               v-bind="swiperOptions"
               :overflow="false"
    >
      <li v-for="(item, index) in items"
          :key="`card-${index}`"
          class="item card"
      >
        <figure class="figure">
          <a class="image-link"
             :href="item.href"
             :title="item.title"
             target="_blank"
          >
            <ui-picture v-bind="item.image"
                        sizes="400px"
                        cover="cover"
                        lazy
                        class="carousel-picture image"
            />
          </a>
          <figcaption class=" caption carousel-description">
            <a class="link image-link"
               :href="item.href"
               :title="item.title"
               target="_blank"
            >
              <h3 v-if="item.title"
                  class="title h5"
                  v-text="item.title"
              />
            </a>
            <p v-if="item.description"
               class="description"
               v-html="item.description"
            />
          </figcaption>
        </figure>
      </li>
    </ui-swiper>
  </section>
  <!-- only for storybook, this will be injected on our main app cpn -->
  <Cursor />
</template>
  
<style lang="stylus" scoped>
  ._container
    padding 100px 0
  .list
    z-index 1
    width 100%
    overflow hidden
    
  .card
    .image
      width 50%
      ratio-box(450/250)
      margin-bottom 1em
      +mobile()
        width 100%

</style>
  