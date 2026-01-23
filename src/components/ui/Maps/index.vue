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
  
  import { ref, onMounted, watch } from 'vue'
  import {initMap, mapStyle, useGeometry, useMarker, usePinElement} from './googleServices'
  
  const el = ref(null)
  const map = ref<google.maps.Map | null>(null)
  // Stocker toutes les polylines avec leur identifiant unique
  const polylines = ref<Map<string, {
      polyline: google.maps.Polyline, 
      style: string,
      animationCancelled: boolean
  }>>(new Map())
  
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
              color?: string,
              size?: number,
              borderColor?: string,
              borderWidth?: number
          }>,
          required: false,
          default: () => []
      },
      animationDuration: {
          type: Number,
          default: 300 // durée de l'animation en ms
      }
  })
  
  onMounted(async () => {
      if (!el.value) return
      const { Map } = await initMap()
      
      map.value = new Map(el.value as HTMLElement, {
          center: { lat: props.center.latitude, lng: props.center.longitude },
          zoom: props.zoom,
          disableDefaultUI: true,
          gestureHandling: props.lock ? 'none' : 'auto',
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID
      })
      
      await drawPolylines(props.encodedPolyline)
  })
  
  watch(() => props.encodedPolyline, async (newPolylines) => {
      if (!map.value) return
      await updatePolylines(newPolylines)
  }, { 
      deep: true
  })
  
  // Génère un identifiant unique pour chaque ligne
  function getPolylineId(line: string): string {
      return line.substring(0, 50) // Utilise le début de la ligne encodée comme ID
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
  
      // Réinitialiser le flag d'annulation
      polylineData.animationCancelled = false
  
      if (fromStyle === 'next' && toStyle === 'previous') {
          // Animation: pointillé → plein
          for (let i = 0; i <= steps; i++) {
              // Vérifier si l'animation a été annulée
              if (polylineData.animationCancelled) {
                  return
              }
  
              const progress = i / steps
              const opacity = progress
              
              await new Promise(resolve => setTimeout(resolve, stepDuration))
              
              if (i === steps) {
                  // À la fin, applique le style final "previous"
                  polyline.setOptions({
                      strokeColor: props.polylineOptions.strokeColor,
                      strokeOpacity: props.polylineOptions.strokeOpacity,
                      strokeWeight: props.polylineOptions.strokeWeight,
                      icons: []
                  })
              } else {
                  // Pendant l'animation, garde le pointillé mais augmente l'opacité
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
              // Vérifier si l'animation a été annulée
              if (polylineData.animationCancelled) {
                  return
              }
  
              const progress = i / steps
              
              await new Promise(resolve => setTimeout(resolve, stepDuration))
              
              if (i === steps) {
                  // À la fin, applique le style final "next"
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
                  // Pendant l'animation, transition progressive
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
      if (!map.value || !paths || paths.length === 0) return
      
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
                  map: map.value
              })
              
              polylines.value.set(polylineId, {
                  polyline: newPolyline,
                  style: encodedPolyline.style,
                  animationCancelled: false
              })
          }
      }
      
      map.value.fitBounds(bounds)
  }
  
  // Met à jour les polylines existantes (avec animation)
  async function updatePolylines(newPaths: EncodedPolyline[]) {
      if (!map.value) return
      
      const geometry = await useGeometry()
      const bounds = new google.maps.LatLngBounds()
      const newPolylineIds = new Set<string>()
      const animationPromises: Promise<void>[] = []
      
      // Parcourir les nouvelles polylines
      for (const encodedPolyline of newPaths) {
          for (const line of encodedPolyline.line) {
              if (!line) continue
              
              const polylineId = getPolylineId(line)
              newPolylineIds.add(polylineId)
              
              const pathCoordinates = geometry.decodePath(line)
              pathCoordinates.forEach(coordinate => bounds.extend(coordinate))
              
              const existingPolyline = polylines.value.get(polylineId)
              
              if (existingPolyline) {
                  // La polyline existe déjà
                  if (existingPolyline.style !== encodedPolyline.style) {
                      // Annuler l'animation en cours
                      existingPolyline.animationCancelled = true
                      
                      // Appliquer immédiatement le style de départ correct
                      const currentStyle = getPolylineStyle(existingPolyline.style)
                      existingPolyline.polyline.setOptions(currentStyle)
                      
                      // Le style a changé → animer la transition
                      const animationPromise = animateStyleChange(
                          existingPolyline,
                          existingPolyline.style,
                          encodedPolyline.style
                      ).then(() => {
                          // IMPORTANT: Mettre à jour le style APRÈS l'animation
                          if (!existingPolyline.animationCancelled) {
                              existingPolyline.style = encodedPolyline.style
                          }
                      })
                      
                      // Mettre à jour le style immédiatement pour les prochaines vérifications
                      existingPolyline.style = encodedPolyline.style
                      
                      animationPromises.push(animationPromise)
                  }
                  // Sinon, on ne fait rien (même style)
              } else {
                  // Nouvelle polyline → créer
                  const polylineStyle = getPolylineStyle(encodedPolyline.style)
                  const newPolyline = new google.maps.Polyline({
                      path: pathCoordinates,
                      ...polylineStyle,
                      map: map.value
                  })
                  
                  polylines.value.set(polylineId, {
                      polyline: newPolyline,
                      style: encodedPolyline.style,
                      animationCancelled: false
                  })
              }
          }
      }
      
      // Attendre que toutes les animations soient terminées
      await Promise.all(animationPromises)
      
      // Supprimer les polylines qui n'existent plus
      for (const [id, data] of polylines.value.entries()) {
          if (!newPolylineIds.has(id)) {
              data.polyline.setMap(null)
              polylines.value.delete(id)
          }
      }
      
      map.value.fitBounds(bounds)
  }
  </script>
  
  <style lang="stylus" scoped>
  .maps
      width 100%
      height 100%
  </style>