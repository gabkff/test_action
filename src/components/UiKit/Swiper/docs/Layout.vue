<docs>
  # UiSWiperDocsLayout
  > Layout ui-swiper
  
  This is a sample used for a common layout

  - on desktop : title + nav on the left and swiper on the right
    + slides overflow on right until kff-max-width (1920)
  - on mobile - both are stacked
    + slides must overflow
    + 1st / last slide must be aligned with gutters

  it contains minimal setup, style etc

  @author Nicolas <nicolas@kffein.com>
  
  </docs>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { templateRef } from '@vueuse/core';
  // import { map } from 'lodash';
  import Cursor from 'components/UiKit/Cursor/index.vue';
  // import { image } from 'assets/moc';
  
  export type Item = {
    title: string
    image: Image
    href: string
    description?: Multiline
  }
  
  export default defineComponent({
    name: 'UiSWiperDocsLayout',
    components: {
      Cursor
    },
    props: {
      options: {
        type: Object,
        default: null,
      },
      title: {
        type: String,
        default: 'With left title',
      },
      description:{
        type: String,
        default: 'Title + nav should be on left on desktop<br>on mobile - swiper is stacked - align with content and overflow visible',
      },
      // items: {
      //   type: Array as PropType<Item[]>,
      //   default: ()=>{
      //     return map([0,1,2,3], ()=>({
      //       title:'some random title',
      //       image,
      //       href:'#',
      //       description: '<p>with a small description</p>'
      //     }))
      //   },
      // }
      items: {
        type: Array as PropType<Item[]>,
        default: null,
      }
    },
    setup(){
      const elNext:Obj = templateRef('elNext')
      const elPrev:Obj = templateRef('elPrev')
      const elSwiper:Obj = templateRef('elSwiper')

      // const items = map([0,1,2,3], ()=>({
      //   title:'some random title',
      //   image,
      //   href:'#',
      //   description: '<p>with a small description</p>'
      // }))
      
      return {
        elSwiper, 
        elNext, 
        elPrev,
        // items,
      }
    }
  });
  </script>
  
<template>
  <section v-if="items.length > 0" class="swiperLayout">
    <div class="_container row">
      <header v-if="title" class="header">
        <h2 class="title h4" v-text="title" />
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
      <ui-swiper v-if="items && elNext && elPrev"
                 ref="elSwiper"
                 tag="ul"
                 class="list"
                 v-bind="options"
                 :navigation="{
                   nextEl: elNext && elNext.$el, 
                   prevEl: elPrev && elPrev.$el,
                 }"
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
                          class="image"
                          sizes="400px"
                          cover="cover"
                          lazy
              />
            </a>
            <figcaption class="caption">
              <a class="link image-link"
                 :href="item.href"
                 :title="item.title"
                 target="_blank"
              >
                <h3 v-if="item.title"
                    class="title"
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
    </div>
  </section>
  <!-- only for storybook, this will be injected on our main app cpn -->
  <Cursor />
</template>
  
<style lang="stylus" scoped>
  .swiperLayout
    padding 100px 0
    overflow hidden

  .row
    f(r, $align:stretch)
    +mobile()
      flex-wrap wrap
  
  .header
    position relative
    z-index 2
    width 25%
    flex-shrink 0
    background $c-white
    padding-right 20px
    &::before
      content ''
      absolute top 0 right 100% bottom 0
      background $c-white
      width 50vw
    
    +mobile()
      width 100%
        
  .list
    z-index 1
    list-style-type none
    flex-grow 1
    flex-shrink 1
    width 75%
    +mobile()
      width 100%
  
  .title
    font-weight $fw-semibold
    rp(margin-bottom, 50px 28px)

  .pagination
    f(column, $align: flex-start)
    +mobile()
      display none

    .btn
      rp(size, 51px 51px)
      padding 0
      f(center)
      :deep(.icon)
        margin-left 0
        margin-right 0
      & + .btn
        margin-top 10px

  
  .card
    rp(width, 450px 240px)
    rp(margin-right, 28px 5px)
    &:last-child
      margin-right 0
    .image
      width 100%
      ratio-box(16/9)
      rp(margin-bottom, 30px 15px)
    
    .title
      rp(font-size, 18px 14px)
      font-family $ff-title
      font-weight $fw-medium
      margin-bottom 0
    
    .description
      rp(font-size, 15px 14px)
      +mobile()
        display none



</style>
  