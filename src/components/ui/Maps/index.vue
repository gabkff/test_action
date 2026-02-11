<template>
    <div ref="el" class="maps" />
</template>
    
<script setup lang="ts">
    /**
     * Maps - Carte avec gestion automatique des étapes
     * * Refactorisé pour recevoir tout le tracé et gérer l'état via l'index d'étape.
     */
    import { ref, onMounted, watch, onBeforeUnmount, shallowRef } from 'vue'
    import { getGoogleMapId } from 'config'
    import { initMap } from './googleServices'
    // Assurez-vous d'avoir mis à jour usePolylines.ts avec la version "Architecture Map-Centric" proposée précédemment
    import { usePolylines } from './usePolylines'
    import { useMarkers } from './useMarkers'
    
    const el = ref<HTMLElement | null>(null)
    const map = shallowRef<google.maps.Map | null>(null)
    const baseZoom = ref<number | undefined>(undefined)
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
        // NOUVEAU : La liste complète des chaînes de caractères polyline du circuit
        allPolylines: {
            type: Array as () => string[], 
            required: false,
            default: () => []
        },
        // NOUVEAU : L'index de l'étape actuelle (0, 1, 2...)
        currentStepIndex: {
            type: Number,
            required: false,
            default: 0
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

    // Initialisation du composable Polylines avec la nouvelle architecture
    // on devrait declarer le style polylineOptions en global
    const { initPolylines, setStepIndex, cleanupPolylines } = usePolylines(map, {
        polylineOptions: props.polylineOptions as any,
        animationDuration: props.animationDuration
    })

    // Initialisation du composable Markers (inchangé)
    const { drawMarkers, clearMarkers, updateMarkersStyle } = useMarkers(map)
    
    onMounted(async () => {
        if (!el.value) return
        
        const { Map } = await initMap()
        
        map.value = new Map(el.value as HTMLElement, {
            center: { lat: props.center.latitude, lng: props.center.longitude },
            zoom: props.zoom,
            disableDefaultUI: true,
            gestureHandling: props.lock ? 'none' : 'auto',
            disableDoubleClickZoom: props.lock,
            zoomControl: false,
            mapId: getGoogleMapId()
        })
        
        // 1. On dessine TOUT le circuit d'un coup
        // initPolylines renvoie les bounds de tout le trajet
        const bounds = await initPolylines(props.allPolylines, props.currentStepIndex)
        
        // 2. On dessine les marqueurs
        await drawMarkers(props.markers,props.currentStepIndex)

        // 3. Gestion du centrage (Fit Bounds)
        if (!props.lock && bounds && !bounds.isEmpty()) {
            map.value.fitBounds(bounds, 50)
            
            // Logique de restriction de la vue (marge de 5%)
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
            baseZoom.value = map.value.getZoom()
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
    
    // WATCHER PRINCIPAL : Quand l'étape change, on met à jour les styles
    watch(() => props.currentStepIndex, async (newIndex) => {
        if (!map.value) return
        await setStepIndex(newIndex)
        updateMarkersStyle(newIndex)
        
    })

    // Si le circuit change complètement (changement de page/circuit)
    watch(() => props.allPolylines, async (newPolylines) => {
        if (!map.value) return
        const bounds = await initPolylines(newPolylines, props.currentStepIndex)
        if (bounds && !bounds.isEmpty() && !props.lock) {
             map.value.fitBounds(bounds)
        }
    }, { deep: true })
    
    // Gestion des marqueurs (inchangé)
    watch(() => props.markers, async (newMarkers, oldMarkers) => {
        if (!map.value) return
        if (JSON.stringify(newMarkers) === JSON.stringify(oldMarkers)) return
        await drawMarkers(newMarkers, props.currentStepIndex)
    }, { deep: true })

    function handleZoom(delta: number) {
        if (!map.value) return
        const currentZoom = map.value.getZoom() || props.zoom
        map.value.setZoom(currentZoom + delta)

        if (props.markers && props.markers[props.currentStepIndex]) {
            const pos = props.markers[props.currentStepIndex].position
            map.value.panTo({ lat: pos.lat, lng: pos.lng })
        }
    }

    function handleCenter() {
        console.log('handleCenter')
        if (!map.value) return
        map.value.panTo({ lat: props.center.latitude, lng: props.center.longitude })
        map.value.setZoom(baseZoom.value || props.zoom)
    }
    defineExpose({
        handleZoom,
        handleCenter
    })
</script>

<style lang="stylus" scoped>
.maps-zoom-control
    position absolute
    bottom 20px
    right 20px
    z-index 1000
    display flex
    flex-direction column
    gap 10px
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
    +layout(mobile)
      font-size 17px
      font-weight $fw-bold
      line-height 1.2
:deep(.custom-marker-pin)
    display flex
    align-items center
    justify-content center
    r(width, 110px 55px)
    r(height, 110px 55px)
    border-radius 50%
    background-color $fjord
:deep(.custom-marker-icon)
    display flex
    align-items center
    justify-content center
    color white
    r(width, 50px 25px)
    r(height, 50px 25px)
    svg
        width 100%
        height 100%
:deep(.custom-cluster-count)
    f-style('h4')
    color $remous
    +layout(mobile)
        font-size 17px
        font-weight $fw-bold
        line-height 1.2
:deep(.custom-marker-container)
    trans(all, 0.3s ease)
    &.is-previous
        opacity 1
    &.is-current
        opacity 1
    &.is-next
        opacity 1
        .custom-marker-pin
            background-color white !important
        .custom-marker-icon
            color $fjord
</style>