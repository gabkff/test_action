import { ref, type ShallowRef } from 'vue'
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer"
import { useMarker, usePinElement } from './googleServices'
import IconLocalisation from 'assets/svg/localisation.svg?raw'

export interface MarkerData {
    position: { lat: number, lng: number }
    icon?: string
    iconType?: 'svg' | 'image'
    iconColor?: string
    label?: string
}

export function useMarkers(map: ShallowRef<google.maps.Map | null>) {
    const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([])
    let markerClusterer: MarkerClusterer | null = null

    function clearMarkers() {
        if (markerClusterer) {
            markerClusterer.clearMarkers()
            markerClusterer = null
        }
        markers.value.forEach(marker => {
            marker.map = null
        })
        markers.value = []
    }

    function createMarkerElement(markerData: MarkerData, index: number) {
        const container = document.createElement('div')
        container.className = 'custom-marker-container'
        container.style.display = 'flex'
        container.style.flexDirection = 'column'
        container.style.alignItems = 'center'
        container.style.gap = '30px'

        const label = document.createElement('div')
        label.textContent = 'Arrêt #' + (index + 1)
        label.className = 'custom-marker-label'
        container.appendChild(label)

        const markerDiv = document.createElement('div')
        markerDiv.className = 'custom-marker-pin'

        if (markerData.icon) {
            const iconWrapper = document.createElement('div')
            iconWrapper.className = 'custom-marker-icon'
            iconWrapper.innerHTML = markerData.icon

            const svg = iconWrapper.querySelector('svg')
            if (svg) {
                svg.style.fill = '#FFFFFF'
            }
            markerDiv.appendChild(iconWrapper)
        }

        container.appendChild(markerDiv)
        return container
    }

    async function drawMarkers(markersList: MarkerData[]) {
        if (!map.value) return

        clearMarkers()
        await new Promise(resolve => {
            if (map.value) {
                google.maps.event.addListenerOnce(map.value, 'idle', resolve)
            } else {
                resolve(null)
            }
        })

        const Marker = await useMarker()
        const PinElement = await usePinElement()

        if (!markersList || markersList.length === 0 || !Marker || !PinElement) return

        for (const markerData of markersList) {
            const index = markersList.indexOf(markerData)
            const markerElement = createMarkerElement(markerData, index)

            const marker = new Marker({
                map: null,
                position: markerData.position,
                content: markerElement,
                title: 'arrêt #' + index
            })
            markers.value.push(marker)
        }

        const customRenderer = {
            render: ({ count, position, markers: clusterMarkers }: any) => {
                const indices = clusterMarkers
                    .map((marker: any) => markers.value.indexOf(marker))
                    .filter((index: number) => index !== -1)
                    .sort((a: number, b: number) => a - b)

                let label = ''
                if (indices.length > 0) {
                    const firstIndex = indices[0] + 1
                    const lastIndex = indices[indices.length - 1] + 1
                    label = `Arrêt ${firstIndex} à ${lastIndex}`
                }

                const clusterDiv = document.createElement('div')
                clusterDiv.className = 'custom-cluster'
                clusterDiv.style.display = 'flex'
                clusterDiv.style.flexDirection = 'column'
                clusterDiv.style.alignItems = 'center'
                clusterDiv.style.gap = '30px'

                const clusterLabel = document.createElement('div')
                clusterLabel.className = 'custom-cluster-label'
                clusterLabel.textContent = label
                clusterDiv.appendChild(clusterLabel)

                const markerDiv = document.createElement('div')
                markerDiv.className = 'custom-marker-pin'

                const iconWrapper = document.createElement('div')
                iconWrapper.className = 'custom-marker-icon'
                iconWrapper.innerHTML = IconLocalisation

                const svg = iconWrapper.querySelector('svg')
                if (svg) {
                    svg.style.width = '50px'
                    svg.style.height = '50px'
                    svg.style.fill = '#FFFFFF'
                }
                markerDiv.appendChild(iconWrapper)
                clusterDiv.appendChild(markerDiv)

                return new google.maps.marker.AdvancedMarkerElement({
                    position,
                    content: clusterDiv,
                    zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
                })
            }
        }

        markerClusterer = new MarkerClusterer({
            map: map.value,
            markers: markers.value,
            renderer: customRenderer,
            algorithm: new SuperClusterAlgorithm({
                radius: 500,
                minZoom: 1
            })
        })
    }

    return {
        markers: markers,
        drawMarkers,
        clearMarkers
    }
}
