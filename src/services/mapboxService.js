/**
 * Mapbox GL & Geospatial Helper Service
 */

// Default Mapbox Public Token (or configure via import.meta.env.VITE_MAPBOX_ACCESS_TOKEN)
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

export const CHENNAI_CENTER = [80.2707, 13.0827]; // [lng, lat]

export const mapboxService = {
  getToken() {
    return MAPBOX_TOKEN;
  },

  getMapStyle(theme = 'dark') {
    return theme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11' 
      : 'mapbox://styles/mapbox/outdoors-v12';
  },

  formatCoords(lat, lng) {
    return `${Number(lat).toFixed(4)}° N, ${Number(lng).toFixed(4)}° E`;
  },

  getGoogleMapsUrl(originLat, originLng, destLat, destLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
};

export default mapboxService;
