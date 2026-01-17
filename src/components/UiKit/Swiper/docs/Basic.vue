<docs>
  # UiSWiperDocsBasic
  > Basic ui-swiper
  
  @author Kevin Bastien <kevin@kffein.com>
</docs>

<script lang="ts">
import { defineComponent } from 'vue';
import { image } from 'assets/moc'
import Cursor from 'components/UiKit/Cursor/index.vue';

export default defineComponent({
  name: "UiSWiperDocsBasic",
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
    <ui-swiper v-if="options"
               class="swiper"
               v-bind="options"
    >
      <p class="slide">
        Slide 1
      </p>
      <p class="slide">
        Slide 2
      </p>
      <ui-picture v-if="image"
                  class="slide image"
                  v-bind="image"
                  sizes="(max-width:800px) 90vw; 500px"
      />
      <p class="slide">
        Slide 4
      </p>
    </ui-swiper>
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