<template>
  <div ref="el" class="maps" />
</template>

<script setup lang="ts">
/**
 * Maps - Carte
 * 
 * Carte
 */
import { ref, onMounted } from 'vue'
import {initMap, mapStyle} from './googleServices.ts'
const el = ref(null)

onMounted(async () => {
    const { Map } = await initMap()

    const map = new Map(el.value, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
        styles: mapStyle
    })
})

</script>

<style lang="stylus" scoped>
.maps
    width 100%
    height 100%
</style>
