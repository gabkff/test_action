<template>
  <ui-animation
    animation="hero"
    class="BuilderPushContent"
    :data-alignment="alignment"
  >
    <div class="container">
      <ui-picture
        v-if="image"
        v-bind="image"
        class="image"
        cover="cover"
      />
      <div class="content">
        <h5 v-if="title" class="title" v-text="title" />
        <div v-if="text" class="description wysiwyg" v-html="text" />
        <div v-if="cta" class="cta">
          <ui-button v-bind="cta" theme="secondary" />
        </div>
      </div>
    </div>
  </ui-animation>
</template>

<script lang="ts">
/**
 * BuilderPushContent
 * 
 * Composant spotlight pour mettre en avant du contenu (image + texte + CTA).
 * 
 * @author Melissa Martin <melissa@kffein.com>
 */

import { defineComponent, PropType } from 'vue'

const BuilderPushContent = defineComponent({
  name: 'BuilderPushContent',
  props: {
    /** Alignement: left ou right */
    alignment: {
      type: String as PropType<'left' | 'right'>,
      default: 'left',
    },
    /** Titre */
    title: {
      type: String,
      default: null,
    },
    /** Texte HTML */
    text: {
      type: String,
      default: null,
    },
    /** Image */
    image: {
      type: Object,
      default: null,
    },
    /** Call to action */
    cta: {
      type: Object,
      default: null,
    },
  },
})

export default BuilderPushContent
</script>

<style lang="stylus" scoped>
.BuilderPushContent
  position relative
  
  &[data-alignment="left"]
    +layout(desktop)
      .content
        padding-left 40px
  
  &[data-alignment="right"]
    +layout(desktop)
      .content
        padding-right 40px
      .container
        flex-direction row-reverse

.container
  container('pagebuilder')
  display flex
  align-items center
  justify-content space-between
  +layout(mobile)
    flex-wrap wrap

.title
  rp(font-size, 2.4rem 1.8rem)
  font-weight $fw-bold
  margin-bottom 20px

.description
  margin-bottom 40px

.content
.image
  width 50%
  +layout(mobile)
    width 100%

.image
  position relative
  padding-bottom 100% // 1:1 ratio
  height 0
  overflow hidden
  
  +layout(mobile)
    width 100%
    margin-bottom 40px
  
  :deep(> *)
    position absolute
    top 0
    left 0
    width 100%
    height 100%
</style>

