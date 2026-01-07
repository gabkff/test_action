<template>
  <ui-animation
    v-if="text"
    tag="p"
    class="BuilderIntroduction"
    v-html="text"
  />
</template>

<script lang="ts">
/**
 * BuilderIntroduction
 * 
 * Bloc d'introduction - texte mis en avant.
 * 
 * @author Melissa Martin <melissa@kffein.com>
 */

import { defineComponent } from 'vue'

const BuilderIntro = defineComponent({
  name: 'BuilderIntroduction',
  props: {
    /** Texte d'introduction */
    text: {
      type: String,
      default: null,
    },
  },
})

export default BuilderIntro
</script>

<style lang="stylus" scoped>
.BuilderIntroduction
  container('pagebuilder')
  f-style('intro')
</style>

