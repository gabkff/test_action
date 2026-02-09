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

export async function initMap() {
  if (clients.MapLibrary) {
    return clients.MapLibrary
  } else {
    setOptions({
      key: getGoogleMapKey(),
      v: "weekly",
    })
    const googleMaps = (await importLibrary('maps')) as google.maps.MapsLibrary;
    clients.MapLibrary = googleMaps
    return clients.MapLibrary
  }
}

export async function useMarker() {
  if (clients.Marker) {
    return clients.Marker
  } else {
    const { AdvancedMarkerElement } = (await importLibrary('marker')) as google.maps.MarkerLibrary;
    clients.Marker = AdvancedMarkerElement
    return clients.Marker
  }
}

export async function usePinElement() {
  if (clients.PinElement) {
    return clients.PinElement
  } else {
    const { PinElement } = (await importLibrary('marker')) as google.maps.MarkerLibrary;
    clients.PinElement = PinElement
    return clients.PinElement
  }
}

export async function useGeometry() {
  if (clients.GeometryLibrary) {
    return clients.GeometryLibrary
  } else {
    const { encoding } = (await importLibrary('geometry')) as { encoding: typeof google.maps.geometry.encoding };
    clients.GeometryLibrary = encoding
    return clients.GeometryLibrary
  }
}

export const mapStyle = customStyles

export default {
  initMap,
  useMarker,
  usePinElement,
  useGeometry,
  mapStyle
}

