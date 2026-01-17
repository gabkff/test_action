<docs>
  # UiSWiperDocsNavigation
  > Navigation ui-swiper
  
  @author Kevin Bastien <kevin@kffein.com>
</docs>
  
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { image } from 'assets/moc'
import Cursor from 'components/UiKit/Cursor/index.vue';

export default defineComponent({
  name: "UiSWiperDocsNavigation",
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
    const elNext = ref();
    const elPrev = ref();

    return {
      elNext, 
      elPrev,
      image,
    };
  },  
});
</script>
    
<template>
  <div class="_container">
    <header>
      <nav class="pagination">
        <ui-button ref="elNext"
                   class="btn -next"
                   theme="secondary"
                   :arrow="true"
                   :animated="false"
        />
        <ui-button ref="elPrev"
                   class="btn -prev"
                   theme="secondary"
                   :arrow="true"
                   :animated="false"
                   direction="left"
        />
      </nav>
    </header>
    <ui-swiper class="swiper"
               v-bind="options"
               :navigation="{
                 nextEl: elNext && elNext.$el, 
                 prevEl: elPrev && elPrev.$el,
               }"
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
  

  .pagination
    padding-bottom 25px
    f(column, $align: flex-end)

    .btn
      rp(size, 51px 51px)
      padding 0
      f(center)
      :deep(.icon)
        margin-left 0
        margin-right 0
      & + .btn
        margin-top 10px

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
  