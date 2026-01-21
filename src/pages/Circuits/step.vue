<template>
    <div class="circuits-etape" v-if="ready && current">
      <div class="circuits-etape__container">
        <h2 class="circuits-etape__name">{{ $t('circuits.name') }} 1</h2>
        <h1 class="circuits-etape__title">{{ current.title }}</h1>
      </div>
      <ui-button theme="primary" :label="'VOIR DETAIL'" @click="sidePanelStore.openCircuitStep({ title: current.title, step: currentStep, index: currentStepIndex + 1})" />
      <div>{{ currentStep }}</div>
    </div>
  </template>
  
<script setup lang="ts">
import { onMounted, watchEffect, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidePanelStore } from 'store/sidePanel'
import { store as appStore } from 'plugins/store/app'

const route = useRoute()
const router = useRouter()
const ready = ref(false)
const current = ref<CircuitEntry | null>(null)
const currentStepIndex = ref<number>(0)
const sidePanelStore = useSidePanelStore()
const currentStep = ref<CircuitStep | null>(null)

// Validation du slug et redirection si invalide
watchEffect(() => {
  // On attend que l'app soit prête (données chargées)
  if (!appStore.isAppReady || !appStore.circuits) return
  const slug = route.params.slug as string
  const circuit = appStore.getCircuitBySlug(slug)
  
  if (!circuit) {
    console.warn(`⚠️ Circuit introuvable pour le slug: ${slug} -> Redirection Home`)
    router.replace({ name: 'home' })
  } else {
    console.log(`✅ Circuit trouvé:`, circuit.title)
    current.value = circuit
    currentStepIndex.value = 0
    currentStep.value = circuit.steps[currentStepIndex.value]
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