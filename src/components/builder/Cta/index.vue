<template>
  <ui-animation
    v-if="data?.link"
    class="BuilderCta"
    :class="$attrs.class"
  >
    <ui-button
      v-bind="data.link"
      theme="primary"
    />
  </ui-animation>
</template>

<script lang="ts">
/**
 * BuilderCta
 * 
 * Composant bouton/CTA pour le page builder.
 * 
 * @author Melissa Martin <melissa@kffein.com>
 */

import { defineComponent } from 'vue'
import { cloneDeep } from 'lodash'

const BuilderCta = defineComponent({
  name: 'BuilderCta',
  inheritAttrs: false,
  setup(props, { attrs }) {
    const data = cloneDeep(attrs) as Record<string, unknown>
    delete data.class
    return {
      data,
    }
  },
})

export default BuilderCta
</script>

<style lang="stylus" scoped>
.BuilderCta
  container('pagebuilder')
</style>

