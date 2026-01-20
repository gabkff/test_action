<template>
    <div class="circuits-etape" v-if="ready">
      <div class="circuits-etape__container">
        <h2 class="circuits-etape__name">{{ $t('circuits.name') }} 1</h2>
        <h1 class="circuits-etape__title">{{ current.title }}</h1>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { onMounted, watchEffect, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store as appStore } from 'plugins/store/app'

const route = useRoute()
const router = useRouter()
const ready = ref(false)
const current = ref(null)
const currentCircuit = computed(() => {
    return appStore.circuits
})
// Validation du slug et redirection si invalide
watchEffect(() => {
  // On attend que l'app soit prête (données chargées)
  if (!appStore.isAppReady) return
  const slug = route.params.slug as string
  const circuit = appStore.getCircuitBySlug(slug)
  current.value = circuit
  if (!circuit) {
    console.warn(`⚠️ Circuit introuvable pour le slug: ${slug} -> Redirection Home`)
    router.replace({ name: 'home' })
  } else {
    console.log(`✅ Circuit trouvé:`, circuit.title)
    ready.value = true
  }
  
})

</script>
  
<style lang="stylus" scoped>
  .circuits-etape
    background-color $fjord
    min-height 100vh
    height 100%
    &__container
      container()
      margin-top 100px
      margin-bottom 100px
    &__name
      f-style('h5')
      color $aube
    &__title
      f-style('h1')
      color $aube
      margin-bottom 90px
</style>