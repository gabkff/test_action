<template>
    <div ref="el" class="maps" />
</template>
    
<script setup lang="ts">
    /**
     * Maps - Carte avec polylines animées
     * 
     * Gère dynamiquement les changements de style de polylines avec animations
     */
    declare type EncodedPolyline = {line: string[], style: "previous" | "next"}
    import { importLibrary } from "@googlemaps/js-api-loader";
    import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
    import {initMap, mapStyle, useGeometry, useMarker, usePinElement} from './googleServices'
    
    const el = ref<HTMLElement | null>(null)
    let map = null
    
    // Stocker toutes les polylines avec leur identifiant unique
    const polylines = ref<Map<string, {
        polyline: google.maps.Polyline, 
        style: string,
        animationCancelled: boolean
    }>>(new Map())
    
    const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([])
    
    // Classes Google Maps (initialisées au mount)
    //let AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | null = null
    let PinElement: typeof google.maps.marker.PinElement | null = null
    let instanceCounter = 0
    const instanceId = ref(0)
    
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
            type: Array as () => Array<EncodedPolyline>,
            required: false,
            default: () => []
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
    
    onMounted(async () => {
        if (!el.value) return
        
        const { Map } = await initMap()
        //AdvancedMarkerElement = await useMarker()
        PinElement = await usePinElement()
        instanceId.value = ++instanceCounter
        map = new Map(el.value as HTMLElement, {
            center: { lat: props.center.latitude, lng: props.center.longitude },
            zoom: props.zoom,
            disableDefaultUI: true,
            gestureHandling: props.lock ? 'none' : 'auto',
            disableDoubleClickZoom: props.lock,
            zoomControl: !props.lock,
            mapId: import.meta.env.VITE_GOOGLE_MAP_ID
        })
        
        await drawPolylines(props.encodedPolyline)
        await drawMarkers(props.markers)
    })
    
    onBeforeUnmount(() => {
        // Nettoyer les polylines
        for (const [id, data] of polylines.value.entries()) {
            data.polyline.setMap(null)
        }
        polylines.value.clear()
        
        // Nettoyer les markers
        clearMarkers()
        
        map = null
    })
    
    watch(() => props.encodedPolyline, async (newPolylines) => {
        if (!map) return
        await updatePolylines(newPolylines)
    }, { 
        deep: true
    })
    
    watch(() => props.markers, async (newMarkers) => {
        if (!map) return
        await drawMarkers(newMarkers)
    }, {
        deep: true
    })
    
    // Génère un identifiant unique pour chaque ligne
    function getPolylineId(line: string): string {
        return `map-${instanceId.value}-${line.substring(0, 50)}`
    }
    
    // Anime le changement de style d'une polyline
    async function animateStyleChange(
        polylineData: {polyline: google.maps.Polyline, style: string, animationCancelled: boolean},
        fromStyle: string, 
        toStyle: string
    ) {
        const polyline = polylineData.polyline
        const steps = 20
        const duration = props.animationDuration
        const stepDuration = duration / steps
    
        polylineData.animationCancelled = false
    
        if (fromStyle === 'next' && toStyle === 'previous') {
            // Animation: pointillé → plein
            for (let i = 0; i <= steps; i++) {
                if (polylineData.animationCancelled) return
    
                const progress = i / steps
                const opacity = progress
                
                await new Promise(resolve => setTimeout(resolve, stepDuration))
                
                if (i === steps) {
                    polyline.setOptions({
                        strokeColor: props.polylineOptions.strokeColor,
                        strokeOpacity: props.polylineOptions.strokeOpacity,
                        strokeWeight: props.polylineOptions.strokeWeight,
                        icons: []
                    })
                } else {
                    const pattern = [10, 5]
                    polyline.setOptions({
                        icons: [{
                            icon: {
                                path: 'M 0,-1 0,1',
                                strokeOpacity: opacity,
                                strokeWeight: 4 + (props.polylineOptions.strokeWeight - 4) * progress,
                                scale: 2
                            },
                            offset: '0',
                            repeat: `${pattern[0] + pattern[1]}px`
                        }]
                    })
                }
            }
        } else if (fromStyle === 'previous' && toStyle === 'next') {
            // Animation: plein → pointillé
            for (let i = 0; i <= steps; i++) {
                if (polylineData.animationCancelled) return
    
                const progress = i / steps
                
                await new Promise(resolve => setTimeout(resolve, stepDuration))
                
                if (i === steps) {
                    const pattern = [10, 5]
                    polyline.setOptions({
                        strokeOpacity: 0,
                        icons: [{
                            icon: {
                                path: 'M 0,-1 0,1',
                                strokeOpacity: 1.0,
                                strokeWeight: 4,
                                scale: 2
                            },
                            offset: '0',
                            repeat: `${pattern[0] + pattern[1]}px`
                        }]
                    })
                } else {
                    const currentOpacity = props.polylineOptions.strokeOpacity * (1 - progress)
                    polyline.setOptions({
                        strokeOpacity: currentOpacity,
                        strokeWeight: props.polylineOptions.strokeWeight - (props.polylineOptions.strokeWeight - 4) * progress
                    })
                }
            }
        }
    }
    
    // Crée le style pour une polyline
    function getPolylineStyle(style: 'previous' | 'next') {
        if (style === 'previous') {
            return {
                strokeColor: props.polylineOptions.strokeColor,
                strokeOpacity: props.polylineOptions.strokeOpacity,
                strokeWeight: props.polylineOptions.strokeWeight,
                geodesic: true,
                icons: []
            }
        } else {
            const pattern = [10, 5]
            return {
                strokeOpacity: 0,
                geodesic: true,
                icons: [{
                    icon: {
                        path: 'M 0,-1 0,1',
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        scale: 2
                    },
                    offset: '0',
                    repeat: `${pattern[0] + pattern[1]}px`
                }]
            }
        }
    }
    
    // Dessine toutes les polylines (première fois)
    async function drawPolylines(paths: EncodedPolyline[]) {
        if (!map || !paths || paths.length === 0) return
        
        const geometry = await useGeometry()
        const bounds = new google.maps.LatLngBounds()
        
        for (const encodedPolyline of paths) {
            for (const line of encodedPolyline.line) {
                if (!line) continue
                
                const pathCoordinates = geometry.decodePath(line)
                pathCoordinates.forEach(coordinate => bounds.extend(coordinate))
                
                const polylineId = getPolylineId(line)
                const polylineStyle = getPolylineStyle(encodedPolyline.style)
                
                const newPolyline = new google.maps.Polyline({
                    path: pathCoordinates,
                    ...polylineStyle,
                    map: map
                })
                
                polylines.value.set(polylineId, {
                    polyline: newPolyline,
                    style: encodedPolyline.style,
                    animationCancelled: false
                })
            }
        }
        
        if (!props.lock && !bounds.isEmpty()) {
            map.fitBounds(bounds)
        }
    }
    
    // Met à jour les polylines existantes (avec animation)
    async function updatePolylines(newPaths: EncodedPolyline[]) {
        if (!map) return
        
        const geometry = await useGeometry()
        const bounds = new google.maps.LatLngBounds()
        const newPolylineIds = new Set<string>()
        const animationPromises: Promise<void>[] = []
        
        for (const encodedPolyline of newPaths) {
            for (const line of encodedPolyline.line) {
                if (!line) continue
                
                const polylineId = getPolylineId(line)
                newPolylineIds.add(polylineId)
                
                const pathCoordinates = geometry.decodePath(line)
                pathCoordinates.forEach(coordinate => bounds.extend(coordinate))
                
                const existingPolyline = polylines.value.get(polylineId)
                
                if (existingPolyline) {
                    if (existingPolyline.style !== encodedPolyline.style) {
                        existingPolyline.animationCancelled = true
                        
                        const currentStyle = getPolylineStyle(existingPolyline.style)
                        existingPolyline.polyline.setOptions(currentStyle)
                        
                        const animationPromise = animateStyleChange(
                            existingPolyline,
                            existingPolyline.style,
                            encodedPolyline.style
                        ).then(() => {
                            if (!existingPolyline.animationCancelled) {
                                existingPolyline.style = encodedPolyline.style
                            }
                        })
                        
                        existingPolyline.style = encodedPolyline.style
                        animationPromises.push(animationPromise)
                    }
                } else {
                    const polylineStyle = getPolylineStyle(encodedPolyline.style)
                    const newPolyline = new google.maps.Polyline({
                        path: pathCoordinates,
                        ...polylineStyle,
                        map: map
                    })
                    
                    polylines.value.set(polylineId, {
                        polyline: newPolyline,
                        style: encodedPolyline.style,
                        animationCancelled: false
                    })
                }
            }
        }
        
        await Promise.all(animationPromises)
        
        // Supprimer les polylines qui n'existent plus
        for (const [id, data] of polylines.value.entries()) {
            if (!newPolylineIds.has(id)) {
                data.polyline.setMap(null)
                polylines.value.delete(id)
            }
        }
        
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds)
        }
    }
    
    // Nettoie tous les markers
    function clearMarkers() {
        markers.value.forEach(marker => {
            marker.map = null
        })
        markers.value = []
    }
    
    // Dessine tous les markers
    async function drawMarkers(markersList: any[]) {
        if (!map) return
        
        // Supprimer tous les markers existants
        clearMarkers()
        console.log('markersList', markersList)
        await new Promise(resolve => {
            if (map) {
                google.maps.event.addListenerOnce(map, 'idle', resolve)
            }
        })
        console.log('resolve')
        if (!markersList || markersList.length === 0) return
        
        // Créer les nouveaux markers
        for (const markerData of markersList) {
            const markerElement = createMarkerElement(markerData)
            console.log('markerElement', markerElement)
            console.log('markerData', markerData)
            const pin = new PinElement({
                background: '#FF0000',
                borderColor: '#FFFFFF',
                glyphColor: '#FFFFFF',
                scale: 1.2
            })
            const { AdvancedMarkerElement } = (await importLibrary('marker')) as google.maps.MarkerLibrary;
            const marker = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: markerData.position,
                content: markerElement,
                //content: pin,
                title: 'arrêt'
            })
            markers.value.push(marker)
        }
        console.log('markers', markers.value)
        console.log('map', map)
    }
    
    // Crée l'élément HTML du marker
    function createMarkerElement(markerData: any) {
        const container = document.createElement('div')
        container.className = 'custom-marker-container'
        container.style.display = 'flex'
        container.style.flexDirection = 'column'
        container.style.alignItems = 'center'
        container.style.gap = '30px'
        
        // Label au-dessus
        const label = document.createElement('div')
        label.textContent = 'Arrêt'
        label.className = 'custom-marker-label'
        container.appendChild(label)
        
        // Rond avec icône
        const markerDiv = document.createElement('div')
        markerDiv.className = 'custom-marker-pin'
        
        // Ajouter l'icône si fournie
        if (markerData.icon) {
            const iconWrapper = document.createElement('div')
            iconWrapper.className = 'custom-marker-icon'
            iconWrapper.innerHTML = markerData.icon
            
            const svg = iconWrapper.querySelector('svg')
            if (svg) {
                svg.style.width = '24px'
                svg.style.height = '24px'
                svg.style.fill = markerData.iconColor || '#FFFFFF'
            }
            markerDiv.appendChild(iconWrapper)
        }
        
        container.appendChild(markerDiv)
        return container
    }
</script>

<style lang="stylus" scoped>
.maps
    width 100%
    height 100%
:deep(.gmp-map)
    height 100%
:deep(.custom-marker-container)
    display flex
    flex-direction column
    align-items center
    gap 8px
    // Important pour que le marker ait une hauteur
    min-height 40px
:deep(.custom-marker-label)
    f-style('h4')
    color $fjord
:deep(.custom-marker-pin)
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    min-height 40px
    min-width 40px
    border-radius 50%
    background-color #FF0000
    border 3px solid #FFFFFF
    box-shadow 0 2px 6px rgba(0, 0, 0, 0.3)
:deep(.custom-marker-icon)
    display flex
    align-items center
    justify-content center
    width 24px
    height 24px
    svg
        width 100%
        height 100%
</style>