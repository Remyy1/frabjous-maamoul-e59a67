'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { TrackingData } from '@/lib/easypost';
import { CITY_COORDS, simulateRoute } from '@/lib/utils';

interface Props {
  data: TrackingData | null;
}

// Default map centers for demo
const DEFAULT_ORIGIN: [number, number] = [-87.6298, 41.8781]; // Chicago
const DEFAULT_DEST: [number, number] = [-74.006, 40.7128]; // New York

export default function LiveMap({ data }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (!mapboxToken || mapboxToken === 'your_mapbox_token_here') {
      setMapError('Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local for live maps');
      return;
    }

    let mapboxgl: any;

    async function initMap() {
      try {
        const mod = await import('mapbox-gl');
        mapboxgl = mod.default;
        mapboxgl.accessToken = mapboxToken;

        // Determine coordinates
        const originCoords: [number, number] =
          (data?.events[data.events.length - 1]?.coordinates as any) || DEFAULT_ORIGIN;
        const destCoords: [number, number] = data?.destinationCoordinates || DEFAULT_DEST;
        const currentCoords: [number, number] = data?.currentCoordinates || originCoords;

        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: currentCoords,
          zoom: 4,
          projection: 'mercator',
        });

        mapRef.current = map;

        map.on('load', () => {
          setMapLoaded(true);

          // Custom map styling
          map.setPaintProperty('background', 'background-color', '#0a0a0f');

          // Route line
          const routePoints = simulateRoute(originCoords, destCoords);
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routePoints,
              },
            },
          });

          map.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#00E5A0',
              'line-width': 8,
              'line-opacity': 0.15,
              'line-blur': 4,
            },
          });

          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#00E5A0',
              'line-width': 2,
              'line-opacity': 0.8,
              'line-dasharray': [4, 4],
            },
          });

          // Origin marker
          const originEl = document.createElement('div');
          originEl.className = 'map-marker-origin';
          originEl.innerHTML = `
            <div style="width:12px;height:12px;background:#666680;border-radius:50%;border:2px solid #9999aa;"></div>
          `;
          new mapboxgl.Marker({ element: originEl })
            .setLngLat(originCoords)
            .setPopup(new mapboxgl.Popup({ offset: 20 }).setText('Origin'))
            .addTo(map);

          // Destination marker
          const destEl = document.createElement('div');
          destEl.innerHTML = `
            <div style="width:16px;height:16px;background:#1a1a30;border-radius:50%;border:2px solid #00E5A0;display:flex;align-items:center;justify-content:center;">
              <div style="width:6px;height:6px;background:#00E5A0;border-radius:50%;"></div>
            </div>
          `;
          new mapboxgl.Marker({ element: destEl })
            .setLngLat(destCoords)
            .setPopup(new mapboxgl.Popup({ offset: 20 }).setText('Destination'))
            .addTo(map);

          // Current location marker (pulsing)
          const currentEl = document.createElement('div');
          currentEl.style.cssText = `
            width: 24px; height: 24px; position: relative; cursor: pointer;
          `;
          currentEl.innerHTML = `
            <div style="
              position: absolute; inset: 0; background: rgba(0,229,160,0.2);
              border-radius: 50%; animation: ping 1.5s ease-in-out infinite;
            "></div>
            <div style="
              position: absolute; inset: 4px; background: #00E5A0;
              border-radius: 50%; border: 2px solid #0a0a0f;
            "></div>
            <style>@keyframes ping { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.6);opacity:0} }</style>
          `;
          new mapboxgl.Marker({ element: currentEl, anchor: 'center' })
            .setLngLat(currentCoords)
            .setPopup(
              new mapboxgl.Popup({ offset: 16 }).setHTML(
                `<div style="color:#e8e8ed;font-size:12px;font-family:monospace;">
                  <strong style="color:#00E5A0;">Current Location</strong><br/>
                  ${data?.currentLocation || 'Unknown'}
                </div>`
              )
            )
            .addTo(map);

          // Fit bounds to show full route
          const bounds = new mapboxgl.LngLatBounds();
          [originCoords, destCoords, currentCoords].forEach((c) => bounds.extend(c));
          map.fitBounds(bounds, { padding: 60, duration: 1200 });
        });
      } catch (err) {
        console.error('Map init error:', err);
        setMapError('Failed to initialize map');
      }
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [data, mapboxToken]);

  if (mapError) {
    return (
      <div className="w-full h-64 md:h-80 rounded-2xl glass border border-subtle flex flex-col items-center justify-center gap-3 text-center p-6">
        <Navigation className="w-8 h-8 text-signal/40" />
        <p className="text-ink-400 text-sm max-w-sm">{mapError}</p>
        <p className="text-xs text-ink-500 font-mono">
          Get a free token at mapbox.com/account/access-tokens
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-subtle">
      <div ref={mapContainer} className="absolute inset-0" />

      {!mapLoaded && (
        <div className="absolute inset-0 glass flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-signal animate-pulse" />
            <span className="text-ink-400 text-sm font-mono">Loading map...</span>
          </div>
        </div>
      )}

      {/* Legend overlay */}
      {mapLoaded && (
        <div className="absolute bottom-3 left-3 glass rounded-xl px-3 py-2 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span className="text-ink-400">Current</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ink-500" />
            <span className="text-ink-400">Origin</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 border border-signal rounded-full" />
            <span className="text-ink-400">Destination</span>
          </span>
        </div>
      )}
    </div>
  );
}
