<template>
  <ui-animation class="BuilderText component">
    <ui-wysiwyg v-html="text" />
  </ui-animation>
</template>

<script lang="ts">
/**
 * BuilderText
 * 
 * Composant de texte WYSIWYG pour le page builder.
 * 
 * @author Melissa Martin <melissa@kffein.com>
 */

import { defineComponent } from 'vue'

const BuilderText = defineComponent({
  name: 'BuilderText',
  props: {
    /** Contenu HTML à afficher - doit contenir des balises <p>, etc. */
    text: {
      type: String,
      default: null,
    },
  },
})

export default BuilderText
</script>

<style lang="stylus" scoped>
.BuilderText
  container('pagebuilder')
</style>

