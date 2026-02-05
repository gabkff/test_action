<template>
  <span class="UiTag">
    <i 
      v-if="icon" 
      class="UiTag__icon" 
      v-html="icon" 
    />
    <span v-if="label" class="UiTag__label">
      {{ label }}
    </span>
  </span>
</template>

<script setup lang="ts">
/**
 * UiKit - Tag
 * 
 * Composant d'affichage non interactif.
 * Peut contenir une icône et/ou du texte.
 */

interface TagProps {
  /** Texte du tag */
  label?: string
  /** Icône SVG raw (optionnel) */
  icon?: string
}

withDefaults(defineProps<TagProps>(), {
  label: '',
  icon: undefined,
})
</script>

<style lang="stylus" scoped>
.UiTag
  display inline-flex
  align-items center
  gap 15px
  padding 15px 20px
  border-radius $radius-md
  background rgba(255, 255, 255, .1)
  border 1px solid #F8F3FF
  color $embruns
  backdrop-filter blur(10px)
  -webkit-backdrop-filter blur(10px)
  +layout(mobile)
    padding 7px 9px
    border-radius 4px

  &__icon
    display flex
    align-items center
    justify-content center
    r(size, 32px 23px)
    flex-shrink 0

    :deep(svg)
      width 100%
      height 100%
      
      path
        fill currentColor

  &__label
    f-style('small-text')
    white-space nowrap
    +layout(mobile)
      font-size 12px
      line-height 1.3
</style>

