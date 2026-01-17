<docs>
  # UiSWiperDocsIntro
  > Intro ui-swiper
  
  @author Kevin Bastien <kevin@kffein.com>
</docs>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { gsap } from 'vendors/gsap';
import useFlow from 'utils/flow';
import { image } from 'assets/moc'
import Cursor from 'components/UiKit/Cursor/index.vue';

export default defineComponent({
  name: "UiSWiperDocsIntro",
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
    const tl = gsap.timeline();
    let slides = null;
    const { onInitUi } = useFlow()


    onInitUi(() => {
      slides = document.querySelectorAll('.slide');
      gsap.set(slides, {opacity: 0, y: 50})
      tl.to(slides, { opacity: 1, y: 0, stagger: 1, duration: 2, delay: 0.2 });
    });

    return {
      tl, 
      slides,
      image,
    };
  },  
});
</script>
    
<template>
  <div class="_container">
    <ui-swiper class="swiper"
               v-bind="options"
               :animation="tl"
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
      <p class="slide">
        Slide 4
      </p>
      <p class="slide">
        Slide 5
      </p>
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
    max-width 70%
  
  .image
  .video
    max-height 70vh
</style>
  