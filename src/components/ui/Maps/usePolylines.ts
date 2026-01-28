import { ref, type ShallowRef } from 'vue'
import { useGeometry } from './googleServices'

export type EncodedPolyline = {
    line: string[],
    style: "previous" | "next" | "current"
}

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
    // State
    const polylines = ref<Map<string, {
        polyline: google.maps.Polyline,
        style: string,
        circleStyle: string | null,
        animationCancelled: boolean,
        hasStartCircle: boolean,
        hasEndCircle: boolean
    }>>(new Map())

    let instanceCounter = 0
    const instanceId = ref(0)

    instanceId.value = ++instanceCounter

    // Methods
    function getPolylineId(line: string): string {
        return `map-${instanceId.value}-${line.substring(0, 50)}`
    }

    function getCircleIcon(style: string) {
        const baseIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            strokeWeight: 4,
            scale: 14
        }

        if (style === 'previous') {
            return {
                ...baseIcon,
                fillColor: 'white',
                strokeColor: '#102838'
            }
        } else if (style === 'current') {
            return {
                ...baseIcon,
                fillColor: '#102838', // Fjord
                strokeColor: '#C4F0EB' // Turquoise
            }
        } else { // style === 'next'
            return {
                ...baseIcon,
                fillColor: '#102838',
                strokeColor: '#102838' // Fjord border
            }
        }
    }

    function resolveCircleStyle(groupStyle: string, isFirstInGroup: boolean): string {
        if (groupStyle === 'next' && isFirstInGroup) {
            return 'current'
        }
        return groupStyle
    }

    function getPolylineOptions(
        style: string,
        circleStyle: string | null,
        hasStartCircle: boolean,
        hasEndCircle: boolean
    ) {
        const icons: any[] = []

        if (hasStartCircle && circleStyle) {
            console.log('hasStartCircle', hasStartCircle)

            icons.push({
                icon: getCircleIcon(circleStyle),
                offset: '0%'
            })
        }

        if (hasEndCircle && circleStyle) {
            icons.push({
                icon: getCircleIcon(circleStyle),
                offset: '100%'
            })
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

    async function animateStyleChange(
        polylineData: {
            polyline: google.maps.Polyline,
            style: string,
            circleStyle: string | null,
            hasStartCircle: boolean,
            hasEndCircle: boolean,
            animationCancelled: boolean
        },
        fromStyle: string,
        toStyle: string,
        targetCircleStyle: string | null,
        targetHasStartCircle: boolean,
        targetHasEndCircle: boolean
    ) {
        const polyline = polylineData.polyline
        const steps = 20
        const duration = props.animationDuration
        const stepDuration = duration / steps

        polylineData.animationCancelled = false

        const startIcon = (targetHasStartCircle && targetCircleStyle)
            ? { icon: getCircleIcon(targetCircleStyle), offset: '0%' }
            : null

        const endIcon = (targetHasEndCircle && targetCircleStyle)
            ? { icon: getCircleIcon(targetCircleStyle), offset: '100%' }
            : null

        const permanentIcons = [startIcon, endIcon].filter(Boolean) as google.maps.IconSequence[]

        const getIconsWithDashes = (progress: number, appearing: boolean) => {
            const pattern = [10, 5]
            const icons = [...permanentIcons]
            const dashOpacity = appearing ? progress : 1 - progress

            icons.push({
                icon: {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: dashOpacity,
                    strokeWeight: 4,
                    scale: 2
                },
                offset: '0',
                repeat: `${pattern[0] + pattern[1]}px`
            })
            return icons
        }

        // On vérifie si on passe de pointillés (next/current) à plein (previous) ou inversement
        const isFromDashed = fromStyle === 'next' || fromStyle === 'current';
        const isToDashed = toStyle === 'next' || toStyle === 'current';

        if (isFromDashed && toStyle === 'previous') {
            // Dashed -> Solid
            for (let i = 0; i <= steps; i++) {
                if (polylineData.animationCancelled) return
                const progress = i / steps
                await new Promise(resolve => setTimeout(resolve, stepDuration))

                polyline.setOptions({
                    strokeOpacity: progress * props.polylineOptions.strokeOpacity,
                    strokeWeight: 4 + (props.polylineOptions.strokeWeight - 4) * progress,
                    icons: getIconsWithDashes(progress, false)
                })
            }
        } else if (fromStyle === 'previous' && isToDashed) {
            // Solid -> Dashed
            for (let i = 0; i <= steps; i++) {
                if (polylineData.animationCancelled) return
                const progress = i / steps
                await new Promise(resolve => setTimeout(resolve, stepDuration))

                polyline.setOptions({
                    strokeOpacity: props.polylineOptions.strokeOpacity * (1 - progress),
                    strokeWeight: props.polylineOptions.strokeWeight - (props.polylineOptions.strokeWeight - 4) * progress,
                    icons: getIconsWithDashes(progress, true)
                })
            }
        }

        // Force l'état final correct pour éviter les bugs visuels résiduels
        if (!polylineData.animationCancelled) {
            const finalOptions = getPolylineOptions(
                toStyle,
                targetCircleStyle,
                targetHasStartCircle,
                targetHasEndCircle
            )
            polyline.setOptions(finalOptions)
        }
    }

    async function drawPolylines(paths: EncodedPolyline[]) {
        if (!map.value || !paths || paths.length === 0) return

        const geometry = await useGeometry()
        const bounds = new google.maps.LatLngBounds()

        for (const encodedPolyline of paths) {
            // Sécurité pour les tableaux vides ou null
            const lines = Array.isArray(encodedPolyline.line) ? encodedPolyline.line : []

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                if (!line) continue

                const pathCoordinates = geometry.decodePath(line)
                pathCoordinates.forEach(coordinate => bounds.extend(coordinate))

                const polylineId = getPolylineId(line)

                const isFirstSegment = i === 0
                const isLastSegment = i === lines.length - 1
                const circleStyle = resolveCircleStyle(encodedPolyline.style, isFirstSegment)

                const hasStartCircle = true
                const hasEndCircle = (encodedPolyline.style === 'next' && isLastSegment)

                const options = getPolylineOptions(encodedPolyline.style, circleStyle, hasStartCircle, hasEndCircle)

                const newPolyline = new google.maps.Polyline({
                    path: pathCoordinates,
                    ...options,
                    map: map.value
                })

                polylines.value.set(polylineId, {
                    polyline: newPolyline,
                    style: encodedPolyline.style,
                    circleStyle: circleStyle,
                    animationCancelled: false,
                    hasStartCircle,
                    hasEndCircle
                })
            }
        }

        return bounds
    }

    async function updatePolylines(newPaths: EncodedPolyline[]) {
        if (!map.value) return

        const geometry = await useGeometry()
        const bounds = new google.maps.LatLngBounds()
        const newPolylineIds = new Set<string>()
        const animationPromises: Promise<void>[] = []

        for (const encodedPolyline of newPaths) {
            // Sécurité anti-crash pour l'étape finale où line peut être null
            const lines = Array.isArray(encodedPolyline.line) ? encodedPolyline.line : []

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                if (!line) continue

                const polylineId = getPolylineId(line)
                newPolylineIds.add(polylineId)

                const pathCoordinates = geometry.decodePath(line)
                pathCoordinates.forEach(coordinate => bounds.extend(coordinate))

                const existingPolyline = polylines.value.get(polylineId)

                const isFirstSegment = i === 0
                const isLastSegment = i === lines.length - 1
                const targetCircleStyle = resolveCircleStyle(encodedPolyline.style, isFirstSegment)
                const targetHasStartCircle = true
                const targetHasEndCircle = (encodedPolyline.style === 'next' && isLastSegment)

                if (existingPolyline) {
                    const styleChanged = existingPolyline.style !== encodedPolyline.style
                    const circleStyleChanged = existingPolyline.circleStyle !== targetCircleStyle
                    const circleConfigChanged = existingPolyline.hasStartCircle !== targetHasStartCircle || existingPolyline.hasEndCircle !== targetHasEndCircle

                    if (styleChanged) {
                        existingPolyline.animationCancelled = true

                        const oldStyle = existingPolyline.style

                        existingPolyline.style = encodedPolyline.style
                        existingPolyline.circleStyle = targetCircleStyle
                        existingPolyline.hasStartCircle = targetHasStartCircle
                        existingPolyline.hasEndCircle = targetHasEndCircle

                        const animationPromise = animateStyleChange(
                            existingPolyline,
                            oldStyle,
                            encodedPolyline.style,
                            targetCircleStyle,
                            targetHasStartCircle,
                            targetHasEndCircle
                        )
                        animationPromises.push(animationPromise)

                    } else if (circleStyleChanged || circleConfigChanged) {
                        existingPolyline.circleStyle = targetCircleStyle
                        existingPolyline.hasStartCircle = targetHasStartCircle
                        existingPolyline.hasEndCircle = targetHasEndCircle

                        const options = getPolylineOptions(
                            encodedPolyline.style,
                            targetCircleStyle,
                            targetHasStartCircle,
                            targetHasEndCircle
                        )
                        existingPolyline.polyline.setOptions(options)
                    }
                } else {
                    const options = getPolylineOptions(
                        encodedPolyline.style,
                        targetCircleStyle,
                        targetHasStartCircle,
                        targetHasEndCircle
                    )
                    const newPolyline = new google.maps.Polyline({
                        path: pathCoordinates,
                        ...options,
                        map: map.value
                    })

                    polylines.value.set(polylineId, {
                        polyline: newPolyline,
                        style: encodedPolyline.style,
                        circleStyle: targetCircleStyle,
                        animationCancelled: false,
                        hasStartCircle: targetHasStartCircle,
                        hasEndCircle: targetHasEndCircle
                    })
                }
            }
        }

        for (const [id, data] of polylines.value.entries()) {
            if (!newPolylineIds.has(id)) {
                data.polyline.setMap(null)
                polylines.value.delete(id)
            }
        }

        await Promise.all(animationPromises)

        return bounds
    }

    function cleanupPolylines() {
        for (const [id, data] of polylines.value.entries()) {
            data.polyline.setMap(null)
        }
        polylines.value.clear()
    }

    return {
        polylines,
        drawPolylines,
        updatePolylines,
        cleanupPolylines
    }
}