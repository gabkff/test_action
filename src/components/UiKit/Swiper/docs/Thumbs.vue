<docs>
  # UiSWiperDocsThumbs
  > Thumbs ui-swiper
  
  @author Kevin Bastien <kevin@kffein.com>
</docs>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { image } from 'assets/moc'
import Cursor from 'components/UiKit/Cursor/index.vue';

export default defineComponent({
  name: "UiSWiperDocsThumbs",
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
      <ui-picture class="slide image"
                  v-bind="image"
                  sizes="(max-width:800px) 90vw; 500px"
      />
      <ui-picture class="slide image"
                  v-bind="image"
                  sizes="(max-width:800px) 90vw; 500px"
      />
      <p class="slide">
        Slide 5
      </p>

      <template #thumbs>
        <p class="slide">
          slide 1
        </p>
        <p class="slide">
          slide 2
        </p>
        <p class="slide">
          slide 3
        </p>
        <p class="slide">
          slide 4
        </p>
        <p class="slide">
          slide 5
        </p>
      </template>
    </ui-swiper>
  </div>
  <!-- only for storybook, this will be injected on our main app cpn -->
  <Cursor />
</template>
    
<style lang="stylus" scoped>
  ._container
    padding 100px 0
  
  .slide
    background $c-black
    color $c-white
    align-self stretch
    height auto
  
  .image
  .video
    max-height 70vh
</style>
  