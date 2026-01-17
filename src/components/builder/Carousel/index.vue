<script lang="ts">
import { image } from 'assets/moc';
import { computed, defineComponent, PropType, reactive, toRefs } from 'vue';

export interface Data {
  currentIndex: number,
  optionsSlider: Record<string, unknown>,
}

export interface ItemsData {
  data: any;
}

export default defineComponent({
  name: 'BuilderCarousel',
  props: {
    /** List of imagfes */
    items: {
      type: Array as PropType<Image[]>,
      default: () => [],
    }
  },

  setup(props) {
    const options = { ...props }
    const isLayoutDesktop = computed(() => window.innerWidth > 1000);


    const isSwiper = computed(() => {
      return options.items?.length >= 3;
    });

    const data: Data = reactive({
      currentIndex: 0,
      overflow: isLayoutDesktop.value ? false : true,
      optionsSlider: {
        loop: false,
        navigation: false,
        pagination: false,
        centeredSlides: isLayoutDesktop.value,
        // mobile
        spaceBetween: 15,
        slidesPerView: 2.2,
        breakpoints: {
          // desktop
          1001: {
            centeredSlides: false,
            spaceBetween: 90,
            slidesPerView: 4,
          },
        }
      },
    })

    return {
      ...toRefs(data), //data
      isSwiper,
      image
    };
  },
});
</script>


<template>
  <div v-if="items && items.length > 0"
       ref="el"
       class="BuilderCarousel"
       :data-count="items.length"
       :data-swiper="isSwiper"
  >
    <component :is="isSwiper ? 'ui-swiper' : 'div'"
               v-if="items.length"
               ref="Swiper"
               :options="optionsSlider"
               :data-swiper="isSwiper"
               tag="ol"
               class="wrapper"
               :data-count="items.length"
               :cursor="true"
               :overflow="true"
    >
      <component :is="isSwiper ? 'li' : 'div'"
                 v-for="(data, index) in items"
                 :key="`BuilderImageVideo-item-${index}`"
                 class="item slide"
                 :data-single="!isSwiper"
      >
        <ui-picture v-bind="data"
                    class="media -picture"
                    sizes="(min-width: 1024px) 50vw, 80vw"
                    :cover="isSwiper ? 'contain' : 'cover'"
        />
      </component>
    </component>
  </div>
</template>



<style lang="stylus" scoped>
  .BuilderCarousel
    color var(--pb-dark)
    &[data-swiper="false"]
      r-desktop(padding-left, $gutter)
      r-desktop(padding-right, $gutter)
      +layout(mobile)
        r-mobile(padding-left, $gutter-mobile)
        r-mobile(padding-right, $gutter-mobile)
      r margin-top, 20px 10px
      r margin-bottom, 20px 10px

  .BuilderCarousel
    &[data-swiper="true"]
      +layout(mobile)
        r-mobile(padding-left, $gutter-mobile)
        r-mobile(padding-right, $gutter-mobile)
      position relative
      &:before
        content '{('
        display block
        position absolute 
        left $gutter
        top 50%
        f-style('subtitle' )
        transform translateY(-50%)
        +layout(mobile)
          display none
      &:after
        content ')} '
        display block
        position absolute 
        right $gutter
        top 50%
        transform translateY(-50%)
        f-style('subtitle')
        +layout(mobile)
          display none
      background var(--pb-accent)
      r padding-top, 150px 60px
      r padding-bottom, 150px 60px
      +layout(desktop)
        r-desktop padding-left, 55px
        r-desktop padding-right, 55px
      
      :deep() .swiper-wrapper
        f($align: center)
        .item
          .picture
            user-select none
  .wrapper
    &[data-count="2"]
      f(row, $align: flex-start)
      +layout(mobile)
        flex-wrap wrap

      .item
        grid-col-size(width, 6/12)
        &:first-child
          rp(padding-right, $gutter 0px)
        +layout(mobile)
          &:first-child
          &:last-child
            margin-left 0px
            margin-right 0px
        .media
          ratio-box(1/1)
        &:last-child
          margin-right 0
          margin-bottom 0
          background var(--pb-accent)
          r padding-top, 115px 40px
          r padding-bottom, 115px 40px
          grid-col-size(padding-left, 1/12)
          grid-col-size(padding-right, 1/12)
          .media
            ratio-box(470/322)
        +layout(mobile)
          width 100%
          margin-bottom 10px
          margin-right 0
          &:last-child
            grid-col-size(margin-right, 2/12)
    &[data-swiper="false"]
      .media
        ratio-box(16/9)

</style>
