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
import {initMap, mapStyle, useGeometry, useMarker, usePinElement} from './googleServices'
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
    },
    encodedPolyline: {
        type: String,
        required: false,
        default: ''
    },
    polylineOptions: {
        type: Object,
        required: false,
        default: () => ({
            strokeColor: '#102838',
            strokeOpacity: 1.0,
            strokeWeight: 2
        })
    },
    markers: {
        type: Array as () => Array<{
            position: { lat: number, lng: number },
            color?: string,
            size?: number,
            borderColor?: string,
            borderWidth?: number
        }>,
        required: false,
        default: () => []
    }
})

onMounted(async () => {
    if (!el.value) return
    const { Map } = await initMap()
    console.log("cocou",props.center)
    const map = new Map(el.value as HTMLElement, {
        center: { lat:props.center.latitude, lng:props.center.longitude },
        zoom: props.zoom,
        disableDefaultUI: true,
        gestureHandling: props.lock ? 'none' : 'auto',
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID
    })

    let pathCoordinates = null
    if (props.encodedPolyline) {
        // Décoder la polyligne encodée
        const geometry = await useGeometry()
        pathCoordinates = geometry.decodePath(props.encodedPolyline)
        console.log(pathCoordinates)
        const polyline = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: props.polylineOptions.strokeColor,
            strokeOpacity: props.polylineOptions.strokeOpacity,
            strokeWeight: props.polylineOptions.strokeWeight,
        })
        
        polyline.setMap(map)
    }

    if (props.markers.length > 0) {
        const AdvancedMarkerElement = await useMarker()
        const PinElement = await usePinElement()

        props.markers.forEach(markerConfig => {
            // Créer un élément PIN personnalisé
            const pinElement = new PinElement({
                background: markerConfig.color || '#FF0000',
                borderColor: markerConfig.borderColor || '#FFFFFF',
                glyphColor: markerConfig.color || '#FF0000',
                scale: markerConfig.size || 1,
            })

            // Créer le marker avec le PIN personnalisé
            const marker = new AdvancedMarkerElement({
                map,
                position: markerConfig.position,
                content: pinElement.element,
            })
        })
    }

})

</script>

<style lang="stylus" scoped>
.maps
    width 100%
    height 100%
</style>
