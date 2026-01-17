<docs>
  # UiSWiperDocsParallax
  > Simple parallax ui-swiper
  
  @author Kevin Bastien <kevin@kffein.com>
</docs>
  
<script lang="ts">
import { defineComponent, ref, reactive, toRefs } from 'vue';
import { image } from 'assets/moc'
import { each } from 'lodash';
import Cursor from 'components/UiKit/Cursor/index.vue';

interface Data {
  swiperOptions: any
}

export default defineComponent({
  name: "UiSWiperDocsParallax",
  components: {
    Cursor,
  },
  props: {
    options: {
      type: Object,
      default: null,
    }
  },

  setup() {
    const currentSlide = ref(0)
    const data: Data = reactive({
      swiperOptions: {
        loop: false,
        slidesPerView: '1.2',
        spaceBetween: 50,
        overflow: true,
        options: {
          watchSlidesProgress: true,
          speed: 1500,
          breakpoints: {
            1025: {
              slidesPerView: '2.5',
            }
          },
          on: {
            slideChange: (swiper: any) => {
              currentSlide.value = swiper?.realIndex;
            },
            /**
           * Animation on slide change
           */
            progress(swiper: any) {
              const interleaveOffset = 0.25;
              if (swiper) {
                for (let i = 0; i < swiper?.slides.length; i += 1) {
                  const slideProgress = swiper?.slides[i].progress / 10;
                  const innerOffset = swiper?.width * interleaveOffset;
                  const innerTranslate = slideProgress * innerOffset;
                  let slideImg = swiper.slides[i].querySelectorAll('.img');
                  each(slideImg, (single) => {
                    single.style.transform = `translate3d(${innerTranslate}px, 0, 0) scale(1.15)`;
                    single.style.transition = ''
                  })
                }
              }
            },
            setTransition(swiper: any, speed: any) {
              if (swiper) {
                for (let i = 0; i < swiper.slides.length; i += 1) {
                  swiper.slides[i].style.transition = `${speed}ms`;
                  let slideImg = swiper.slides[i].querySelectorAll('.img');
                  each(slideImg, (single) => {
                    single.style.transition = `${speed}ms`;
                  })
                }
              }
            },
          },
        }
      }
    })

    return {
      image,
      ...toRefs(data),
    };
  },
});
</script>
    
<template>
  <div class="_container">
    <ui-swiper v-bind="swiperOptions"
               ref="elSwiper"
               class="swiper"
               tag="ul"
    >
      <li class="slide">
        <ui-picture class="slide image"
                    v-bind="image"
                    sizes="(max-width:800px) 33vw; 500px"
                    cover="cover"
        />
      </li>
      <li class="slide">
        <ui-picture class="slide image"
                    v-bind="image"
                    sizes="(max-width:800px) 33vw; 500px"
                    cover="cover"
        />
      </li>
      <ui-picture class="slide image"
                  v-bind="image"
                  sizes="(max-width:800px) 33vw; 500px"
                  cover="cover"
      />
      <li class="slide">
        <ui-picture class="slide image"
                    v-bind="image"
                    sizes="(max-width:800px) 33vw; 500px"
                    cover="cover"
        />
      </li>
      <li class="slide">
        <ui-picture class="slide image"
                    v-bind="image"
                    sizes="(max-width:800px) 33vw; 500px"
                    cover="cover"
        />
      </li>
    </ui-swiper>
  </div>
  <!-- only for storybook, this will be injected on our main app cpn -->
  <Cursor />
</template>
    
<style lang="stylus" scoped>
  ._container
    padding 100px 0
  
  .UiSwiper

  .slide
    height 500px
    +layout(mobile)
      height 350px
</style>
  