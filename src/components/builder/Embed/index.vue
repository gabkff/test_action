<template>
  <ui-animation v-if="code" class="BuilderEmbed component">
    <div class="embed" v-html="code" />
  </ui-animation>
</template>

<script lang="ts">
/**
 * BuilderEmbed
 * 
 * Composant pour intégrer du code HTML (iframes, widgets, etc.)
 * 
 * @author Kevin Bastien <kevin@kffein.com>
 */

import { defineComponent } from 'vue'

const BuilderEmbed = defineComponent({
  name: 'BuilderEmbed',
  props: {
    /** Code HTML à intégrer */
    code: {
      type: String,
      default: null,
    },
  },
})

export default BuilderEmbed
</script>

<style lang="stylus" scoped>
.BuilderEmbed
  container('pagebuilder')

.embed
  :deep(iframe)
    max-width 100%
</style>

