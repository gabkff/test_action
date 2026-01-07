<template>
  <ui-animation
    v-if="items && items.length"
    class="BuilderAccordion component"
  >
    <ui-accordions>
      <ui-accordions-item
        v-for="(accordion, index) in items"
        :key="`accordion-${index}`"
        v-bind="accordion"
      >
        <div class="wysiwyg" v-html="accordion.content" />
      </ui-accordions-item>
    </ui-accordions>
  </ui-animation>
</template>

<script lang="ts">
/**
 * BuilderAccordion
 * 
 * Système d'accordion pour le page builder.
 * 
 * @author Kevin Bastien <kevin@kffein.com>
 */

import { defineComponent, PropType } from 'vue'

const BuilderAccordion = defineComponent({
  name: 'BuilderAccordion',
  props: {
    /** Liste des items d'accordion */
    items: {
      type: Array as PropType<AccordionItem[]>,
      default: null,
    },
  },
})

export default BuilderAccordion
</script>

<style lang="stylus" scoped>
.BuilderAccordion
  container('pagebuilder')
</style>

