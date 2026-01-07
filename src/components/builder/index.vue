<script lang="ts">
/**
 * PageBuilder
 * 
 * Composant principal du système de builder.
 * Rend dynamiquement les composants en fonction de leur type.
 */

import { defineComponent, PropType } from 'vue'
import { camelCase } from 'lodash'

// Import de tous les composants builder
import BuilderAccordion from './Accordion/index.vue'
import BuilderAnchor from './Anchor/index.vue'
import BuilderCta from './Cta/index.vue'
import BuilderEmbed from './Embed/index.vue'
import BuilderGallery from './Gallery/index.vue'
import BuilderIntroduction from './Introduction/index.vue'
import BuilderMarquee from './Marquee/index.vue'
import BuilderPushContent from './PushContent/index.vue'
import BuilderText from './Text/index.vue'

const PageBuilder = defineComponent({
  name: 'PageBuilder',
  components: {
    BuilderAccordion,
    BuilderAnchor,
    BuilderCta,
    BuilderEmbed,
    BuilderGallery,
    BuilderIntroduction,
    BuilderMarquee,
    BuilderPushContent,
    BuilderText,
  },
  props: {
    /** Tag HTML du wrapper */
    tag: {
      type: String,
      default: 'div',
    },
    /** Liste des composants à rendre */
    components: {
      type: Array as PropType<BuilderComponent[]>,
      default: () => [],
    },
    /** Mode debug */
    debug: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    /**
     * Retourne le nom du composant à utiliser
     */
    function getComponent(item: { component: string }) {
      const name = camelCase(`Builder_${item.component.replace('component_', '')}`)
      return name
    }

    return {
      getComponent,
    }
  },
})

export default PageBuilder
</script>

<template>
  <component
    :is="tag"
    v-if="components.length"
    class="PageBuilder"
  >
    <component
      :is="getComponent(item)"
      v-for="(item, index) in components"
      :key="`builder-${item.component}-${index}`"
      v-bind="item.data"
      class="PageBuilderItem item"
    />
  </component>
</template>

<style lang="stylus" scoped>
.PageBuilder
  overflow hidden
  rp(padding-top, 100px 50px)
  rp(padding-bottom, 100px 50px)

.PageBuilderItem
  &:not(:first-child)
    rp(margin-top, 100px 50px)

  // Spacing personnalisé entre certains composants
  &.BuilderText + .BuilderCta
  &.BuilderCta + .BuilderCta
    rp(margin-top, 50px 25px)
</style>
