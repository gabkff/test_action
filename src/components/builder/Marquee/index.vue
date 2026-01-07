<template>
  <ui-animation class="BuilderMarquee component">
    <ui-marquee class="marquee" :text="items" />
  </ui-animation>
</template>

<script lang="ts">
/**
 * BuilderMarquee
 * 
 * Composant marquee (texte défilant) pour le page builder.
 * 
 * @author Kevin Bastien <kevin@kffein.com>
 */

import { defineComponent, PropType } from 'vue'

const BuilderMarquee = defineComponent({
  name: 'BuilderMarquee',
  props: {
    /** Liste de textes à afficher */
    items: {
      type: Array as PropType<string[]>,
      default: null,
    },
  },
})

export default BuilderMarquee
</script>

<style lang="stylus" scoped>
.BuilderMarquee
  .marquee
    padding-top 0
    padding-bottom 0
</style>

