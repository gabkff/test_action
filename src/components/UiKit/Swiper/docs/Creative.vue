<docs>
  # UiSWiperDocsCreative
  > Creative effect from ui-swiper
  
  @author Melissa <melissa@kffein.com>
</docs>

<script lang="ts">
import { defineComponent } from 'vue';
import { image } from 'assets/moc'
import Cursor from 'components/UiKit/Cursor/index.vue';

export default defineComponent({
  name: "UiSWiperDocsCreative",
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
    return {
      image,
    };
  },
});
</script>

<template>
  <div class="_container">
    <ui-swiper class="swiper"
               v-bind="{
                 overflow: false,
                 options: {
                   slidesPerView: 1,
                   grabCursor: true,
                   effect: 'creative',
                   creativeEffect: {
                     prev: {
                       shadow: true,
                       translate: [0, 0, -800],
                       rotate: [180, 0, 0],
                     },
                     next: {
                       shadow: true,
                       translate: [0, 0, -800],
                       rotate: [-180, 0, 0],
                     }
                   },
                 },
                 slidesPerView: 1,
               }"
    >
      <div class="slide" style="background: red">
        Slide 1
      </div>
      <div class="slide" style="background: blue">
        Slide 2
      </div>
      <ui-picture class="slide image"
                  v-bind="image"
                  sizes="(max-width:800px) 90vw; 500px"
                  style="background: orange"
      />
      <div class="slide" style="background: green">
        Slide 4
      </div>
      <div class="slide" style="background: red">
        Slide 5
      </div>
      <div class="slide" style="background: pink">
        Slide 6
      </div>
      <div class="slide" style="background: purple">
        Slide 7
      </div>
      <div class="slide" style="background: red">
        Slide 8
      </div>
      <div class="slide" style="background: blue">
        Slide 9
      </div>
    </ui-swiper>


    <ui-swiper class="swiper"
               v-bind="{
                 overflow: false,
                 options: {
                   slidesPerView: 1,
                   grabCursor: true,
                   effect: 'creative',
                   creativeEffect: {
                     prev: {
                       shadow: true,
                       origin: 'left center',
                       translate: ['-5%', 0, -200],
                       rotate: [0, 100, 0],
                     },
                     next: {
                       origin: 'right center',
                       translate: ['5%', 0, -200],
                       rotate: [0, -100, 0],
                     }
                   },
                 },
                 slidesPerView: 1,
               }"
    >
      <div class="slide" style="background: red">
        Slide 1
      </div>
      <div class="slide" style="background: blue">
        Slide 2
      </div>
      <ui-picture class="slide image"
                  v-bind="image"
                  sizes="(max-width:800px) 90vw; 500px"
                  style="background: orange"
      />
      <div class="slide" style="background: green">
        Slide 4
      </div>
      <div class="slide" style="background: red">
        Slide 5
      </div>
      <div class="slide" style="background: pink">
        Slide 6
      </div>
      <div class="slide" style="background: purple">
        Slide 7
      </div>
      <div class="slide" style="background: red">
        Slide 8
      </div>
      <div class="slide" style="background: blue">
        Slide 9
      </div>
    </ui-swiper>


    <ui-swiper class="swiper"
               v-bind="{
                 overflow: false,
                 options: {
                   slidesPerView: 1,
                   grabCursor: true,
                   effect: 'creative',
                   creativeEffect: {
                     prev: {
                       shadow: true,
                       translate: [0, 0, -400],
                     },
                     next: {
                       translate: ['100%', 0, 0],
                     }
                   },
                 },
                 slidesPerView: 1,
               }"
    >
      <div class="slide" style="background: red">
        Slide 1
      </div>
      <div class="slide" style="background: blue">
        Slide 2
      </div>
      <ui-picture class="slide image"
                  v-bind="image"
                  sizes="(max-width:800px) 90vw; 500px"
                  style="background: orange"
      />
      <div class="slide" style="background: green">
        Slide 4
      </div>
      <div class="slide" style="background: red">
        Slide 5
      </div>
      <div class="slide" style="background: pink">
        Slide 6
      </div>
      <div class="slide" style="background: purple">
        Slide 7
      </div>
      <div class="slide" style="background: red">
        Slide 8
      </div>
      <div class="slide" style="background: blue">
        Slide 9
      </div>
    </ui-swiper>
    <layoutSwiper v-bind="{
      tag: 'div',
      options: {
        loop: true,
        slidesPerView: 2,
      },
      pagination: false,
      autoplay: false,
      progressBar: false,
      scrollbar: false,
      slidesPerView: 2,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      onChange: false,
      watchEnd: false,
      cursor: true,
      overflow: true,
      animated: true,
      animation: undefined,
      title: 'With left title',
      description: 'Title + nav should be on left on desktop<br>on mobile - swiper is stacked - align with content and overflow visible',
      items: [
        {
          title: 'some random title',
          image,
          href: '#',
          description: '<p>with a small description</p>'
        },
        {
          title: 'some random title',
          image,
          href: '#',
          description: '<p>with a small description</p>'
        },
        {
          title: 'some random title',
          image,
          href: '#',
          description: '<p>with a small description</p>'
        },
        {
          title: 'some random title',
          image,
          href: '#',
          description: '<p>with a small description</p>'
        },
      ]
    }"
    />
  </div>
  <!-- only for storybook, this will be injected on our main app cpn -->
  <Cursor />
</template>

<style lang="stylus" scoped>

  // Define colors
  colors = #FF5733, #33FF57, #3357FF, #F3FF33

  // Loop through the first four colors
  for color, index in colors
    .slide:nth-child({index + 1})
      background-color color


  .swiper
    margin-top 100px

  ._container
    padding 100px 0
  
  .slide
    color $c-white
    align-self stretch
    height auto
  
  .image
  .video
    max-height 70vh
</style>