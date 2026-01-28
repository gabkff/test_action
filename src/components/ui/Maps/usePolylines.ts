import { ref, type ShallowRef, markRaw } from 'vue'
import { useGeometry } from './googleServices'

// On ne passe plus des objets complexes avec style, juste les strings brutes
export type PolylineList = string[]

interface UsePolylinesProps {
    polylineOptions: {
        strokeColor: string
        strokeOpacity: number
        strokeWeight: number
    }
    animationDuration: number
}

export function usePolylines(
    map: ShallowRef<google.maps.Map | null>,
    props: UsePolylinesProps
) {
    // On stocke les polylines dans un tableau ordonné pour correspondre aux index des étapes
    // structure : index -> { polyline, currentStyle, ... }
    const polylines = ref<Array<{
        instance: google.maps.Polyline,
        style: "previous" | "next" | "current",
        animationCancelled: boolean
    }>>([])

    // --- Helpers de style (identiques à avant, ajustés pour current = next) ---

    function getCircleIcon(style: string) {
        const baseIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            strokeWeight: 4,
            scale: 14
        }
        // Current utilise le style visuel de next (pointillés) mais cercle spécifique
        if (style === 'previous') {
            return { ...baseIcon, fillColor: 'white', strokeColor: '#102838' }
        } else if (style === 'current') {
            return { ...baseIcon, fillColor: '#102838', strokeColor: '#C4F0EB' }
        } else {
            return { ...baseIcon, fillColor: '#102838', strokeColor: '#102838' }
        }
    }

    function getPolylineOptions(style: string, isFirstPolyline: boolean, isLastPolyline: boolean) {
        const icons: any[] = []

        // Logique des cercles
        // Toujours un cercle au début
        icons.push({ icon: getCircleIcon(style), offset: '0%' })

        // Cercle à la fin SEULEMENT si c'est la toute dernière étape du circuit complet
        // OU si c'est l'étape courante (selon votre design précédent)
        if (isLastPolyline) {
            icons.push({ icon: getCircleIcon(style), offset: '100%' })
        }

        if (style === 'previous') {
            return {
                strokeColor: props.polylineOptions.strokeColor,
                strokeOpacity: props.polylineOptions.strokeOpacity,
                strokeWeight: props.polylineOptions.strokeWeight,
                geodesic: true,
                icons: icons,
                zIndex: 10
            }
        } else {
            // 'next' OU 'current' (pointillés)
            const pattern = [10, 5]
            icons.push({
                icon: {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                    scale: 2
                },
                offset: '0',
                repeat: `${pattern[0] + pattern[1]}px`
            })

            return {
                strokeColor: '#102838',
                strokeOpacity: 0,
                strokeWeight: props.polylineOptions.strokeWeight,
                geodesic: true,
                icons: icons,
                zIndex: 1
            }
        }
    }

    // --- Animation ---

    async function animatePolyline(
        data: { instance: google.maps.Polyline, style: string, animationCancelled: boolean },
        targetStyle: "previous" | "next" | "current",
        isFirst: boolean,
        isLast: boolean
    ) {
        // Si le style visuel ne change pas (ex: next -> current, les deux sont pointillés), on update juste les icônes sans animer
        // Note: previous = plein, next/current = pointillés
        const isFromDashed = data.style === 'next' || data.style === 'current'
        const isToDashed = targetStyle === 'next' || targetStyle === 'current'

        data.style = targetStyle
        data.animationCancelled = false

        // Si on passe de plein à plein ou pointillé à pointillé, pas d'animation progressive nécessaire
        // On applique juste les options (notamment pour changer la couleur des cercles)
        if (isFromDashed === isToDashed) {
            data.instance.setOptions(getPolylineOptions(targetStyle, isFirst, isLast))
            return
        }

        // Sinon, animation de transition
        const steps = 20
        const duration = props.animationDuration
        const stepDuration = duration / steps

        // Helper pour l'anim
        const getIconsForAnim = (progress: number, appearing: boolean) => {
            const pattern = [10, 5]
            const icons = []
            // On remet les cercles fixes
            icons.push({ icon: getCircleIcon(targetStyle), offset: '0%' })
            if (isLast) icons.push({ icon: getCircleIcon(targetStyle), offset: '100%' })

            // Pointillés
            const opacity = appearing ? progress : 1 - progress
            icons.push({
                icon: { path: 'M 0,-1 0,1', strokeOpacity: opacity, strokeWeight: 4, scale: 2 },
                offset: '0',
                repeat: `${pattern[0] + pattern[1]}px`
            })
            return icons
        }

        if (isFromDashed && !isToDashed) {
            // Pointillés -> Plein
            for (let i = 0; i <= steps; i++) {
                if (data.animationCancelled) return
                const progress = i / steps
                await new Promise(r => setTimeout(r, stepDuration))
                data.instance.setOptions({
                    strokeOpacity: progress * props.polylineOptions.strokeOpacity,
                    strokeWeight: 4 + (props.polylineOptions.strokeWeight - 4) * progress,
                    icons: getIconsForAnim(progress, false)
                })
            }
        } else {
            // Plein -> Pointillés
            for (let i = 0; i <= steps; i++) {
                if (data.animationCancelled) return
                const progress = i / steps
                await new Promise(r => setTimeout(r, stepDuration))
                data.instance.setOptions({
                    strokeOpacity: props.polylineOptions.strokeOpacity * (1 - progress),
                    strokeWeight: props.polylineOptions.strokeWeight - (props.polylineOptions.strokeWeight - 4) * progress,
                    icons: getIconsForAnim(progress, true)
                })
            }
        }

        // Finalisation propre
        if (!data.animationCancelled) {
            data.instance.setOptions(getPolylineOptions(targetStyle, isFirst, isLast))
        }
    }

    // --- Core Functions ---

    // 1. Initialisation : On dessine tout le circuit d'un coup
    async function initPolylines(allPathStrings: string[], initialStepIndex: number) {
        if (!map.value) return
        cleanupPolylines() // Reset si déjà existant

        const geometry = await useGeometry()
        const bounds = new google.maps.LatLngBounds()

        for (let i = 0; i < allPathStrings.length; i++) {
            const lineStr = allPathStrings[i]
            if (!lineStr) {
                // On pousse un null ou placeholder pour garder la synchro des index
                // mais attention à ne pas faire planter la suite
                continue
            }

            const path = geometry.decodePath(lineStr)
            path.forEach(p => bounds.extend(p))

            // Déterminer le style initial
            let initialStyle: "previous" | "current" | "next" = 'next'
            if (i < initialStepIndex) initialStyle = 'previous'
            else if (i === initialStepIndex) initialStyle = 'current'
            else initialStyle = 'next'

            const isLast = i === allPathStrings.length - 1
            const options = getPolylineOptions(initialStyle, true, isLast)

            const poly = new google.maps.Polyline({
                path: path,
                map: map.value,
                ...options
            })

            polylines.value.push({
                instance: markRaw(poly),
                style: initialStyle,
                animationCancelled: false
            })
        }

        return bounds
    }

    // 2. Mise à jour : On change juste les styles en fonction de l'index
    async function setStepIndex(newIndex: number) {
        const promises = []

        for (let i = 0; i < polylines.value.length; i++) {
            const data = polylines.value[i]
            let targetStyle: "previous" | "current" | "next"

            if (i < newIndex) targetStyle = 'previous'
            else if (i === newIndex) targetStyle = 'current'
            else targetStyle = 'next'

            if (data.style !== targetStyle) {
                data.animationCancelled = true // Stop en cours
                const isLast = i === polylines.value.length - 1
                promises.push(animatePolyline(data, targetStyle, true, isLast))
            }
        }
        await Promise.all(promises)
    }

    function cleanupPolylines() {
        polylines.value.forEach(p => p.instance.setMap(null))
        polylines.value = []
    }

    return {
        initPolylines,
        setStepIndex,
        cleanupPolylines
    }
}