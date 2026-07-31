import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapboxService, CHENNAI_CENTER } from '../services/mapboxService';

export default function MapboxView({
  mode = 'view', // 'view', 'picker', 'heatmap', 'navigation'
  origin = [13.0827, 80.2707], // [lat, lng]
  destination = null, // [lat, lng]
  complaints = [],
  onLocationSelect = null,
  theme = 'dark',
  height = '350px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const centerLat = origin ? origin[0] : CHENNAI_CENTER[1];
    const centerLng = origin ? origin[1] : CHENNAI_CENTER[0];

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: mode === 'navigation' ? 14 : 12,
      zoomControl: true
    });

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© Mapbox © OpenStreetMap'
    }).addTo(map);

    // MODE 1: LOCATION PICKER (FOR CITIZEN)
    if (mode === 'picker') {
      let marker = L.marker([centerLat, centerLng], { draggable: true }).addTo(map);
      marker.bindPopup('Drag pin or click map to pick exact complaint location').openPopup();

      const handlePick = (lat, lng) => {
        marker.setLatLng([lat, lng]);
        if (onLocationSelect) {
          onLocationSelect({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
        }
      };

      map.on('click', (e) => {
        handlePick(e.latlng.lat, e.latlng.lng);
      });

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        handlePick(pos.lat, pos.lng);
      });
    }

    // MODE 2: OFFICER TURN-BY-TURN NAVIGATION
    if (mode === 'navigation' && destination) {
      const officerIcon = L.divIcon({
        className: 'officer-pin',
        html: `<div style="background:#3b82f6; width:26px; height:26px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 15px #3b82f6; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:11px;">K</div>`,
        iconSize: [28, 28]
      });

      const destIcon = L.divIcon({
        className: 'dest-pin',
        html: `<div style="background:#ef4444; width:24px; height:24px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 15px #ef4444; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:11px;">📍</div>`,
        iconSize: [26, 26]
      });

      L.marker(origin, { icon: officerIcon }).addTo(map).bindPopup('<strong>Officer Position</strong>');
      L.marker(destination, { icon: destIcon }).addTo(map).bindPopup('<strong>Complaint Hazard Target</strong>');

      // Polyline route
      const poly = L.polyline([origin, [ (origin[0] + destination[0])/2 + 0.002, (origin[1] + destination[1])/2 - 0.002 ], destination], {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);

      map.fitBounds(poly.getBounds(), { padding: [40, 40] });
    }

    // MODE 3: ADMIN HEAT MAP & ALL COMPLAINTS CLUSTER VIEW
    if (mode === 'heatmap' || mode === 'view') {
      complaints.forEach((c) => {
        const lat = parseFloat(c.latitude || c.gps?.[0] || 13.0850);
        const lng = parseFloat(c.longitude || c.gps?.[1] || 80.2101);
        const isCritical = c.priority === 'critical';

        const icon = L.divIcon({
          className: 'complaint-heat-marker',
          html: `<div style="background:${isCritical ? '#ef4444' : '#f59e0b'}; width:${isCritical ? '22px' : '16px'}; height:${isCritical ? '22px' : '16px'}; border-radius:50%; border:2px solid #fff; box-shadow:0 0 12px ${isCritical ? '#ef4444' : '#f59e0b'};"></div>`,
          iconSize: [22, 22]
        });

        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif; font-size:12px;">
              <strong style="color:#0f172a;">${c.complaint_id || c.id}</strong><br/>
              <strong>${c.category}</strong><br/>
              <span style="color:#64748b;">${c.location}</span><br/>
              <span style="color:${isCritical ? '#dc2626' : '#d97706'}; font-weight:bold; text-transform:uppercase;">Priority: ${c.priority}</span>
            </div>
          `);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mode, origin, destination, complaints, theme]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0"
    />
  );
}
