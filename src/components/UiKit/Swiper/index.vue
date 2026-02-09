<script lang="ts">
import { templateRef, until } from '@vueuse/core';
import { motion } from 'config';
import { each, isNumber, merge } from 'lodash';
import Swiper from 'swiper';
////import { Autoplay, FreeMode, Keyboard, Navigation, Pagination, Scrollbar, Thumbs } from 'swiper/modules';
import { Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-creative';
import IconArrow from 'assets/svg/arrow.svg?raw'
import { store as interfaceStore } from 'plugins/store/interface'
import type { 
  SwiperOptions, 
  AutoplayOptions, 
  NavigationOptions, 
  PaginationOptions, 
  ScrollbarOptions 
} from 'swiper/types';
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, reactive, toRefs, useSlots, watch } from 'vue';

import { gsap, ScrollTrigger } from 'vendors/gsap';
//Swiper.use([Navigation, Pagination, Autoplay, Scrollbar, Keyboard, Thumbs, FreeMode]);
Swiper.use([Navigation]);

//import 'swiper/css/effect-creative';
export interface Data {
  swiper?: Swiper,
  thumbSwiper?: Swiper,
  options?: SwiperOptions,
  optionsThumb?: SwiperOptions,
  index: number,
  allowSlidePrev: boolean,
  allowSlideNext: boolean,
}

export default defineComponent({
  name: "UiSwiper",
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    /** Number of slides per view : 1 or `auto` */
    slidesPerView: {
      type: [Number, String] as PropType<number | 'auto'>,
      default: 'auto',
    },
    /** Swiperjs options - Attention, will override default props : https://swiperjs.com/swiper-api#parameters */
    options: {
      type: Object as PropType<SwiperOptions>,
      default: undefined,
    },
    /** easy pagination : https://idangero.us/swiper/api/#pagination */
    pagination: {
      type: [Boolean, Object] as PropType<boolean | PaginationOptions>,
      default: false,
    },
    /** easy navigation : https://idangero.us/swiper/api/#navigation */
    navigation: {
      type: [Boolean, Object] as PropType<boolean | NavigationOptions>,
      default: true,
    },
    /** easy autoplay : https://idangero.us/swiper/api/#autoplay */
    autoplay: {
      type: [Boolean, Object] as PropType<boolean | AutoplayOptions>,
      default: false,
    },
    /** if true (and autoplay), display some progressbar for autoplay */
    progressBar: {
      type: Boolean,
      default: false,
    },
    /** if true display a scrollbar */
    scrollbar: {
      type: [Boolean, Object] as PropType<boolean | ScrollbarOptions>,
      default: false,
    },

    /** Distance between slides in px */
    spaceBetween: {
      type: Number,
      default: 0,
    },
    /** is slides centered */
    centeredSlides: {
      type: Boolean,
      default: false,
    },
    /** is swiper loop */
    loop: {
      type: Boolean,
      default: false,
    },
    thumb: {
      type: Boolean,
      default: false,
    },
    /** listen to onChange event */
    onChange: {
      type: Boolean,
      default: false,
    },
    watchEnd: {
      type: Boolean,
      default: false,
    },
    /** if true display a custom cursor hold & grab */
    cursor: {
      type: Boolean,
      default: false,
    },
    /** Type of the cursor (text or arrow) */
    cursorType: {
      type: String,
      default: 'text',
    },
    /** if true disply overflow scroll from swiper container */
    overflow: {
      type: Boolean,
      default: false,
    },
    /** if true show intro animation */
    animated: {
      type: Boolean,
      default: true,
    },
    /** if we need to overwritte the intro animation */
    animation: {
      type: Object as PropType<GSAPAnimation>,
      default: undefined,
    },
    /** Swiperjs thumb options - Attention, will override default props : https://swiperjs.com/swiper-api#parameters */
    optionsThumb: {
      type: Object as PropType<SwiperOptions>,
      // default: () => {
      //   return {
      //     spaceBetween: 10,
      //     slidesPerView: 2,
      //     FreeMode: true,
      //     breakpoints: {
      //       768: {
      //         slidesPerView: 4,
      //       }
      //     },
      //   }
      // }
      default: null,
    },
  },
  emits: [
    'slide-change',  // on slide change
    'reach-end' // at last slide
  ],
  setup(props, { emit }) {

    const data: Data = reactive(
      {
        swiper: undefined,
        thumbSwiper: undefined,
        options: undefined,
        index: 0,
        allowSlidePrev: false,
        allowSlideNext: false,
      }
    );
    const el = templateRef<HTMLElement | null>('el', null)
    const thumbElem = templateRef<HTMLElement | null>('thumbElem', null)
    const wrapper = templateRef<HTMLElement | null>('wrapper', null)
    const wrapperThumb = templateRef<HTMLElement | null>('wrapperThumb', null)
    const pagination = templateRef('pagination')
    const next = templateRef('next')
    const prev = templateRef('prev')
    const progressBar = templateRef('progressBar')
    const slots = useSlots();
    const isDesktop = computed(() => interfaceStore.isDesktop)
    const isSingle = computed(() => {
      return wrapper?.value ? isNumber(wrapper?.value.children?.length) && wrapper?.value.children?.length <= 1 : false;
    })

    onMounted(() => {
      nextTick(() => {
        if (el.value && wrapper?.value) {
          data.swiper = createSwiper() as Swiper;
          initSt();
        }
      })
    });


    onBeforeUnmount(() => {
      if (data.swiper) {
        // will destroy instance but keep style aka keep currentslide active. :magic:
        data.swiper.destroy(true, false);
        data.swiper = undefined;
      }
    });

    // Watch resize
    if(!import.meta.env.SSR) {
      watch(
        () => window.innerWidth,
        () => {
          update();
        },
      )
    }

    const initSt = async () => {
      if (motion && props.animated) {
        await setTimeout(() => {}, 1000)
        const children = wrapper?.value?.children;
        const slides = [].slice.call(children);
        const tween = props.animation ? props.animation : gsap.to(slides, { opacity: 1, y: 0, stagger: 0.09, duration: 0.4, delay: 0.2 })

        const st = ScrollTrigger.create({
          // markers: true,
          trigger: el.value,
          start: 'top bottom',
          end: 'bottom top',
          animation: gsap.timeline({
            onComplete: () => {
              nextTick(() => { st.kill() }) // only 1time ?
            }
          }).add(tween),
        })
      }
    }
    initSt();

    // compute all swiper options withh curent props + add default specs
    const computeOptions = (): SwiperOptions => {
      const opts: SwiperOptions = {
        loop: props.loop,
        centeredSlides: props.centeredSlides,
        //'slides-per-view': props.slidesPerView ? props.slidesPerView as number | 'auto' : 1,
        spaceBetween: props.spaceBetween,
        pagination: computePagination(),
        navigation: computeNavigation(),
        autoplay: computeAutoplay(),
        scrollbar: computeScrollbar(),
        threshold: 0,
        resistanceRatio: 0.1,
        longSwipesRatio: 0.1,
        speed: 800,
        grabCursor: true,
        slideToClickedSlide: false,
        touchStartPreventDefault: false,
        watchOverflow: true,
        keyboard: {
          enabled: true,
          onlyInViewport: true,
          pageUpDown: false,
        },
        ...props.options,
      };

      if (isSingle.value) {
        opts.loop = false;
        opts.grabCursor = false;
      }

      if (props.cursor) {
        opts.grabCursor = false;
      }

      return opts as SwiperOptions;
    }
    
    /* compute pagination to easy set up if pass `pagination` props to true */
    const computePagination = (): boolean | PaginationOptions => {
      if (!props.pagination || isSingle.value) return false;
      if (props.pagination === true) {
        return {
          el: pagination?.value,
          // el: '.swiper-pagination',
          clickable: true,
          type: 'bullets',
        } as PaginationOptions;
      }
      return props.pagination as PaginationOptions;
    }

    /* compute navigation to easy set up if pass `navigation` props to true */
    const computeNavigation = (): boolean | NavigationOptions => {
      if (!props.navigation) return false;
      if (props.navigation === true) {
        console.log('navigation', next?.value, prev?.value)
        return {
          nextEl: next?.value,
          prevEl: prev?.value,
        } as NavigationOptions;
      }
      return props.navigation as NavigationOptions;
    }

    /* compute autoplay to easy set up if pass `autoplay` props to true */
    const computeAutoplay = (): boolean | AutoplayOptions => {
      if (!props.autoplay || isSingle.value) return false;
      if (props.autoplay === true) {
        return {
          delay: 2000,
          disableOnInteraction: false,
        } as AutoplayOptions;
      }
      return props.autoplay as AutoplayOptions;
    }

    /* compute scrollbar to easy set up if pass `scrollbar` props to true */
    const computeScrollbar = (): boolean | ScrollbarOptions => {
      if (!props.scrollbar || isSingle.value) return false;
      if (props.scrollbar === true) {

        return {
          el: '.swiper-scrollbar',
          hide: false,
          dragSize: 235,
        } as ScrollbarOptions;
      }
      return props.scrollbar as ScrollbarOptions;
    };

    /* actual swiper cration with all the computed options */
    const createSwiper = (): Swiper => {
      data.options = computeOptions();
      // ensure `swiper-slide` class to slides
      if (wrapper?.value && wrapper?.value.children.length) {
        each(wrapper.value.children, (node) => {
          node?.classList.add('swiper-slide');
        });
      }

      if (props.thumb) {
        if (wrapperThumb?.value && wrapperThumb?.value.children.length) {
          each(wrapperThumb.value.children, (node) => {
            node?.classList.add('swiper-slide');
          });
        }
        const thumbsOptions = {
          spaceBetween: 30,
          slidesPerView: 2,
          FreeMode: true,
          breakpoints: {
            768: {
              slidesPerView: 4,
            }
          },
          ...props.optionsThumb
        }
        data.thumbSwiper = new Swiper(thumbElem.value as HTMLElement, thumbsOptions as SwiperOptions) as Swiper;

        data.options.thumbs = {
          swiper: data.thumbSwiper
        }
      }

      const swiper: Swiper = new Swiper(el.value as HTMLElement, data.options as SwiperOptions) as Swiper;
      swiper.on('slideChange', () => {
        if (data.swiper) {
          data.index = data.swiper.realIndex;
        }
        if (props.onChange) emit('slide-change');
      })
      if (props.watchEnd) {
        swiper.on('reachEnd', () => emit('reach-end', true));
      }

      if (props.progressBar && props.autoplay) {
        swiper.on('progress', animProgressBar);
      }

      setTimeout(() => {
        update();
      }, 1000);

      return swiper as Swiper;
    };

    /* anim progress bar if enabled */
    const animProgressBar = () => {
      if (progressBar?.value && data.options && data.options?.autoplay && data.options?.autoplay !== true && data.options?.autoplay?.delay) {
        const duration = Math.floor(data.options?.autoplay?.delay / 1000);
        gsap.timeline()
          .set(progressBar?.value, { transformOrigin: 'left center', scaleX: 0 })
          .fromTo(progressBar?.value, { scaleX: 0 }, { scaleX: 1, duration, ease: 'power1.easeIn' });
      }
    };

    /* just in case we actually need it, probably with the watch system */
    const update = () => {
      console.log('update', data.swiper)
      data.swiper?.update();
      data.swiper?.pagination?.update();
      data.swiper?.navigation?.update();
    };

    watch(() => props.options,
      (opts) => {
        if (!data.swiper) return
        merge(data.swiper?.params, opts)
    })
    watch(() => slots.default?.(), () => {
      console.log('slots.default?.()', slots.default?.())
      nextTick(() => {
        if (data.swiper) {
          // will destroy instance but keep style aka keep currentslide active. :magic:
          data.swiper.destroy(true, false);
          data.swiper = undefined;
          data.swiper = createSwiper() as Swiper;
          update();
        }
      });
    })

      

    // return public data for our template
    return {
      ...toRefs(data), //data for refs...
      slots,
      isDesktop,
      // hasCursor: props.cursor, // not reactive
      hasProgressBar: props.progressBar,
      IconArrow,
      // if true, compute auto so add slots - !== if object may be external so no slot here
      hasNavigation: props.navigation === true,
      hasPagination: !!computePagination(),
      hasScrollbar: !!computeScrollbar(),
      computeOptions,
      isSingle,
      // //functions
    };
  },
});
</script>

<template>
  <div class="UiSwiper">
    <!-- Slider main container -->
    <div ref="el"
         class="swiper-container"
         :class="{
           'cursor-swiper': (cursor && cursorType === 'text' /*&& !isSingle*/),
           'cursor-arrow': (cursor && cursorType === 'arrow' /*&& !isSingle*/),
           '-overflow': overflow
         }"
         :data-cursor="cursor"
    >
      <!-- Additional required wrapper -->
      <component :is="tag"
                 ref="wrapper"
                 class="swiper-wrapper"
      >
        <!-- @slot Default - slides - will auto append 'swiper-slide' class -->
        <slot />
      </component>
      
      <!-- need `pagination` props to true  -->
      <div v-if="hasPagination"
           ref="pagination"
           :class="`swiper-pagination ${cursor ? 'cursor-remove' : ''}`"
      />


      <!-- need `progress-bar` props to true  -->
      <div v-if="hasProgressBar"
           ref="progressBar"
           :class="`swiper-progress-bar ${cursor ? 'cursor-remove' : ''}`"
      />
      <div class="swiper-button-wrapper" v-if="hasNavigation && isDesktop">
        <!-- need `navigation` props to true (default)  -->
        <button 
                ref="prev"
                :class="`swiper-button-prev _no-btn ${cursor ? 'cursor-remove' : ''}`"
        >
          <div class="swiper-button-prev-icon">
              <i v-html="IconArrow" />
          </div>
        </button>
        <!-- need `navigation` props to true (default)  -->
        <button
                ref="next"
                :class="`swiper-button-next _no-btn ${cursor ? 'cursor-remove' : ''}`"
        >
          <div class="swiper-button-next-icon">
              <i v-html="IconArrow" />
          </div>
        </button>
      </div>
      <!-- need `scrollbar` props to true  -->
      <div v-if="hasScrollbar" class="swiper-scrollbar">
        <div :class="`swiper-scrollbar-drag ${cursor ? 'cursor-remove' : ''}`" />
      </div>
    </div>
    <div v-if="thumb"
         ref="thumbElem"
         class="thumbs swiper-container"
         :class="{
           'cursor-link': (cursor /*&& !isSingle*/),
         }"
         :data-cursor="cursor"
    >
      <!-- Additional required wrapper -->
      <component :is="tag"
                 ref="wrapperThumb"
                 class="swiper-wrapper"
      >
        <!-- @slot Thumbs -> fallback to default if empty - slides - will auto append 'swiper-slide' class -->
        <slot v-if="!slots.thumbs" />
        <slot v-else name="thumbs" />
      </component>
    </div>
  </div>
</template>

<style lang="stylus">
  .UiSwiper
    overflow visible
    position relative
    height 100%
    
  .swiper-container
    overflow hidden
    height 100%
    &.-overflow
      overflow visible
  
    .swiper-wrapper
      :deep(> *)
        opacity 0
        transform translateY(10px)
        
  .swiper-button-disabled
    opacity 0.1
    pointer-events none
  
  .swiper-pagination-bullet
    cursor pointer
    outline none
  
  .swiper-progress-bar
    display block
    margin-top 10px
    height 5px
    background $c-black
    opacity 0.55
  .swiper-button-wrapper
    position absolute
    bottom 30px
    right 90px
    z-index 10
    f(row, $justify: flex-end)
    gap 13px
  .swiper-button-next,
  .swiper-button-prev
    r(width, 128px 64px)
    r(height, 120px 60px)
    border-radius $radius-md
    background white
    f(row)
  .swiper-button-next
    .swiper-button-next-icon
      size 50px
      margin auto
  .swiper-button-prev
    .swiper-button-prev-icon
      size 50px
      margin auto
      transform rotate(180deg)

  .swiper-slide
    flex-shrink 0
  
  .thumbs
    margin-top 10px
  
    .swiper-slide
      trans(opacity)
      opacity 1

  
    .swiper-slide-thumb-active
      opacity 0.1
</style>
