import { ref, type ShallowRef } from 'vue'
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer"
import { useMarker } from './googleServices'

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
    const currentStepIndexRef = ref(0) // Référence interne pour le renderer du clusterer

    /**
     * Supprime tous les marqueurs et le clusterer de la carte
     */
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

    /**
     * Met à jour les classes CSS des marqueurs et rafraîchit le clusterer
     */
    function updateMarkersStyle(currentIndex: number) {
        currentStepIndexRef.value = currentIndex
        
        markers.value.forEach((marker, index) => {
            const element = marker.content as HTMLElement
            if (!element) return

            // Gestion des classes d'état
            element.classList.remove('is-previous', 'is-current', 'is-next')
            if (index < currentIndex) {
                element.classList.add('is-previous')
            } else if (index === currentIndex) {
                element.classList.add('is-current')
            } else {
                element.classList.add('is-next')
            }
        })

        // On demande au clusterer de se redessiner pour mettre à jour le style des groupes
        if (markerClusterer) {
            markerClusterer.render()
        }
    }

    /**
     * Crée l'élément DOM pour un marqueur individuel
     */
    function createMarkerElement(markerData: MarkerData, index: number) {
        const container = document.createElement('div')
        container.className = 'custom-marker-container'

        // Label au-dessus (Arrêt #)
        const label = document.createElement('div')
        label.textContent = 'Arrêt #' + (index + 1)
        label.className = 'custom-marker-label'
        container.appendChild(label)

        // Le rond (Pin)
        const markerDiv = document.createElement('div')
        markerDiv.className = 'custom-marker-pin'

        // L'icône à l'intérieur
        if (markerData.icon) {
            const iconWrapper = document.createElement('div')
            iconWrapper.className = 'custom-marker-icon'
            iconWrapper.innerHTML = markerData.icon
            markerDiv.appendChild(iconWrapper)
        }

        container.appendChild(markerDiv)
        return container
    }

    /**
     * Dessine les marqueurs sur la carte et initialise le clusterer
     */
    async function drawMarkers(markersList: MarkerData[], currentIndex: number) {
        if (!map.value) return
        
        currentStepIndexRef.value = currentIndex
        clearMarkers()

        // Attente que la carte soit prête
        await new Promise(resolve => {
            if (map.value && google.maps.event) {
                google.maps.event.addListenerOnce(map.value, 'idle', resolve)
            } else {
                resolve(null)
            }
        })

        const Marker = await useMarker()
        if (!markersList || markersList.length === 0 || !Marker) return

        // 1. Création des marqueurs
        for (let i = 0; i < markersList.length; i++) {
            const markerData = markersList[i]
            const markerElement = createMarkerElement(markerData, i)

            const marker = new Marker({
                map: null,
                position: markerData.position,
                content: markerElement,
                title: 'arrêt #' + i,
                zIndex: i === currentIndex ? 1000 : i
            })
            markers.value.push(marker)
        }

        // 2. Configuration du Renderer pour les Clusters
        const customRenderer = {
            render: ({ count, position, markers: clusterMarkers }: any) => {
                // On vérifie si l'étape actuelle est présente dans ce cluster
                const indices = clusterMarkers.map((m: any) => markers.value.indexOf(m))
                const hasCurrent = indices.includes(currentStepIndexRef.value)

                const clusterDiv = document.createElement('div')
                clusterDiv.className = `custom-cluster ${hasCurrent ? 'is-current' : 'is-next'}`

                // Structure avec le chiffre au centre du cercle
                clusterDiv.innerHTML = `
                    <div class="custom-marker-pin">
                        <span class="custom-cluster-count" style="color: #C4F0EB;">${count}</span>
                    </div>
                `

                return new google.maps.marker.AdvancedMarkerElement({
                    position,
                    content: clusterDiv,
                    zIndex: hasCurrent ? 2000 : 1000 + count
                })
            }
        }

        // 3. Initialisation du MarkerClusterer
        markerClusterer = new MarkerClusterer({
            map: map.value,
            markers: markers.value,
            renderer: customRenderer,
            algorithm: new SuperClusterAlgorithm({
                radius: 500,
                minZoom: 1
            })
        })

        // Appliquer les styles initiaux
        updateMarkersStyle(currentIndex)
    }

    return {
        markers,
        drawMarkers,
        clearMarkers,
        updateMarkersStyle
    }
}