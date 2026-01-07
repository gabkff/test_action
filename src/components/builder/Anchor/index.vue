<template>
  <div :id="id" class="BuilderAnchor" />
</template>

<script lang="ts">
/**
 * BuilderAnchor
 * 
 * Point d'ancrage pour la navigation au sein d'une page.
 * Permet de scroller vers une section spécifique via ?anchor=id
 * 
 * @author Kevin Bastien <kevin@kffein.com>
 */

import { defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const BuilderAnchor = defineComponent({
  name: 'BuilderAnchor',
  props: {
    /** ID de l'ancre */
    id: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const route = useRoute()

    const scrollToAnchor = async () => {
      if (!props.id || route.query.anchor !== props.id) return

      const anchor = document.getElementById(props.id)
      if (!anchor) return

      // Try GSAP first
      try {
        const { gsap, ScrollToPlugin } = await import('vendors/gsap')
        gsap.registerPlugin(ScrollToPlugin)
        
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: anchor, offsetY: 100 },
          ease: 'power2.inOut',
        })
      } catch {
        // Fallback to native smooth scroll
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    onMounted(() => {
      setTimeout(scrollToAnchor, 500)
    })
  },
})

export default BuilderAnchor
</script>

<style lang="stylus" scoped>
.BuilderAnchor
  position relative
  height 0
  margin 0
  padding 0
</style>
