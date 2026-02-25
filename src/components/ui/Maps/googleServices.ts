import { setOptions, importLibrary } from "@googlemaps/js-api-loader"
import { getGoogleMapKey } from 'config'
import customStyles from './assets/map-styles.json'

interface GoogleClients {
  Geocoder?: google.maps.Geocoder,
  // Map?: typeof google.maps.Map,
  MapLibrary?: google.maps.MapsLibrary
  // const { AdvancedMarkerView } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
  Marker?: typeof google.maps.marker.AdvancedMarkerElement
  PinElement?: typeof google.maps.marker.PinElement
  GeometryLibrary?: typeof google.maps.geometry.encoding
}
const clients: GoogleClients = {
  MapLibrary: undefined,
  Marker: undefined,
  PinElement: undefined,
  GeometryLibrary: undefined,
}

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleMapKey()}&libraries=maps,marker,geometry&v=weekly`
    script.setAttribute('referrerpolicy', 'no-referrer')
    script.async = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}


export async function initMap() {
  if (clients.MapLibrary) {
    return clients.MapLibrary
  } else {
    await loadGoogleMapsScript()
    clients.MapLibrary = google.maps as unknown as google.maps.MapsLibrary
    return clients.MapLibrary
  }
}

export async function useMarker() {
  if (clients.Marker) return clients.Marker
  await loadGoogleMapsScript()
  clients.Marker = google.maps.marker.AdvancedMarkerElement
  return clients.Marker
}

export async function usePinElement() {
  if (clients.PinElement) return clients.PinElement
  await loadGoogleMapsScript()
  clients.PinElement = google.maps.marker.PinElement
  return clients.PinElement
}

export async function useGeometry() {
  if (clients.GeometryLibrary) return clients.GeometryLibrary
  await loadGoogleMapsScript()
  clients.GeometryLibrary = google.maps.geometry.encoding
  return clients.GeometryLibrary
}

export const mapStyle = customStyles

export default {
  initMap,
  useMarker,
  usePinElement,
  useGeometry,
  mapStyle
}

