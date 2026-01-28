<template>
    <div ref="el" class="maps" />
</template>
    
<script setup lang="ts">
    /**
     * Maps - Carte avec polylines animées
     * 
     * Gère dynamiquement les changements de style de polylines avec animations
     */
    import { ref, onMounted, watch, onBeforeUnmount, shallowRef } from 'vue'
    import { initMap } from './googleServices'
    import { usePolylines, type EncodedPolyline } from './usePolylines'
    import { useMarkers } from './useMarkers'
    
    const el = ref<HTMLElement | null>(null)
    const map = shallowRef<google.maps.Map | null>(null)
    
    const props = defineProps({
        center: {
            type: Object,
            required: false,
            default: () => ({
                latitude: 0,
                longitude: 0
            })
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
            type: Array as () => Array<EncodedPolyline>,
            required: false,
            default: () => []
        },
        currentStep: {
            type: Object,
            required: false
        },
        polylineOptions: {
            type: Object,
            required: false,
            default: () => ({
                strokeColor: '#102838',
                strokeOpacity: 1.0,
                strokeWeight: 8
            })
        },
        markers: {
            type: Array as () => Array<{
                position: { lat: number, lng: number },
                icon?: string,
                iconType?: 'svg' | 'image',
                iconColor?: string,
                label?: string
            }>,
            required: false,
            default: () => []
        },
        animationDuration: {
            type: Number,
            default: 300
        }
    })

    const { drawPolylines, updatePolylines, cleanupPolylines } = usePolylines(map, {
        polylineOptions: props.polylineOptions,
        animationDuration: props.animationDuration
    })

    const { drawMarkers, clearMarkers } = useMarkers(map)
    
    onMounted(async () => {
        if (!el.value) return
        
        const { Map } = await initMap()
        
        map.value = new Map(el.value as HTMLElement, {
            center: { lat: props.center.latitude, lng: props.center.longitude },
            zoom: props.zoom,
            disableDefaultUI: true,
            gestureHandling: props.lock ? 'none' : 'auto',
            disableDoubleClickZoom: props.lock,
            zoomControl: !props.lock,
            mapId: import.meta.env.VITE_GOOGLE_MAP_ID
        })
        
        const bounds = await drawPolylines(props.encodedPolyline)
        await drawMarkers(props.markers)

        // Fit bounds logic reinstated from original
        if (!props.lock && bounds && !bounds.isEmpty()) {
            map.value.fitBounds(bounds, 50)
            const ne = bounds.getNorthEast()
            const sw = bounds.getSouthWest()
            const latMargin = (ne.lat() - sw.lat()) * 0.05
            const lngMargin = (ne.lng() - sw.lng()) * 0.05
            const restrictedBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(sw.lat() - latMargin, sw.lng() - lngMargin),
                new google.maps.LatLng(ne.lat() + latMargin, ne.lng() + lngMargin)
            )
            map.value.setOptions({
                restriction: {
                    latLngBounds: restrictedBounds,
                    strictBounds: false
                }
            })
        } else if (props.lock) {
            map.value.setCenter({ lat: props.center.latitude, lng: props.center.longitude })
            map.value.setZoom(19)
        }
    })
    
    onBeforeUnmount(() => {
        cleanupPolylines()
        clearMarkers()
        map.value = null
    })
    
    watch(() => props.encodedPolyline, async (newPolylines) => {
        if (!map.value) return
        const bounds = await updatePolylines(newPolylines)
        if (bounds && !bounds.isEmpty()) {
             map.value.fitBounds(bounds)
        }
    }, { 
        deep: true
    })
    
    watch(() => props.markers, async (newMarkers, oldMarkers) => {
        if (!map.value) return
        if (JSON.stringify(newMarkers) === JSON.stringify(oldMarkers)) return
        await drawMarkers(newMarkers)
    }, {
        deep: true
    })
</script>

<style lang="stylus" scoped>
.maps
    width 100%
    height 100%
:deep(.gmp-map)
    height 100%
:deep(.custom-marker-container),
:deep(.custom-cluster)
    display flex
    flex-direction column
    align-items center
    gap 8px
    min-height 40px
:deep(.custom-marker-label),
:deep(.custom-cluster-label)
    f-style('h4')
    color $fjord
:deep(.custom-marker-pin)
    display flex
    align-items center
    justify-content center
    width 110px
    height 110px
    border-radius 50%
    background-color $fjord
:deep(.custom-marker-icon)
    display flex
    align-items center
    justify-content center
    color white
    width 50px
    height 50px
    svg
        width 100%
        height 100%
</style>