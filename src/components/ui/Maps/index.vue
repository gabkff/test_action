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
import {initMap, mapStyle} from './googleServices'
const el = ref(null)
const props = defineProps({
    center: {
        type: Object,
        required: true,
    },
    zoom: {
        type: Number,
        required: false,
        default: 8,
    },
    lock: {
        type: Boolean,
        default: false,
    }
})

onMounted(async () => {
    if (!el.value) return
    const { Map } = await initMap()
    console.log(props.center)
    const map = new Map(el.value as HTMLElement, {
        center: { lat:props.center.latitude, lng:props.center.longitude },
        zoom: props.zoom,
        styles: mapStyle,
        disableDefaultUI: true,
        gestureHandling: props.lock ? 'none' : 'auto',
    })
})

</script>

<style lang="stylus" scoped>
.maps
    width 100%
    height 100%
</style>
