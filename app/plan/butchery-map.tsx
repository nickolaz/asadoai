'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import type { MapLocation } from '@/data/map-locations';

type ButcheryMapProps = {
  locations: MapLocation[];
  selectedLocationId: string;
  userCoordinates: [number, number] | null;
  onSelect: (locationId: string) => void;
};

const mapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const caba: [number, number] = [-58.437, -34.603];

export function ButcheryMap({ locations, selectedLocationId, userCoordinates, onSelect }: ButcheryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef(new Map<string, mapboxgl.Marker>());
  const selectRef = useRef(onSelect);

  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!mapToken || !containerRef.current) return;
    const map = new mapboxgl.Map({
      accessToken: mapToken,
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userCoordinates ?? locations[0]?.coordinates ?? caba,
      zoom: userCoordinates ? 12.2 : 12.7,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    if (userCoordinates) addUserMarker(map, userCoordinates);
    const bounds = new mapboxgl.LngLatBounds();
    for (const location of locations) {
      bounds.extend(location.coordinates);
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `mapbox-store-marker ${location.kind}`;
      element.setAttribute('aria-label', `Seleccionar ${location.name}`);
      element.addEventListener('click', () => selectRef.current(location.id));
      const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
        .setLngLat(location.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 22, closeButton: false }).setText(`${location.name}${location.distanceKm === undefined ? '' : ` · ${location.distanceKm} km`}`))
        .addTo(map);
      markersRef.current.set(location.id, marker);
    }

    // Fit the bundled points once the style is ready. This makes the pins
    // immediately visible even when the browser has no geolocation permission.
    if (!bounds.isEmpty()) {
      map.once('load', () => map.fitBounds(bounds, { padding: 38, maxZoom: 13, duration: 0 }));
    }

    return () => {
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [locations, userCoordinates]);

  useEffect(() => {
    const map = mapRef.current;
    const location = locations.find((item) => item.id === selectedLocationId);
    if (!map || !location) return;
    map.easeTo({ center: location.coordinates, zoom: Math.max(map.getZoom(), 12.7), duration: 550 });
    markersRef.current.get(location.id)?.togglePopup();
  }, [locations, selectedLocationId]);

  if (!mapToken) return <OpenStreetMapFallback locations={locations} selectedLocationId={selectedLocationId} onSelect={onSelect} />;
  return <div ref={containerRef} className="city-map mapbox-map" aria-label="Mapa interactivo de carnicerías y comercios" />;
}

function OpenStreetMapFallback({ locations, selectedLocationId, onSelect }: Pick<ButcheryMapProps, 'locations' | 'selectedLocationId' | 'onSelect'>) {
  const [zoom, setZoom] = useState(1);
  const selected = locations.find((location) => location.id === selectedLocationId) ?? locations[0];
  if (!selected) return <div className="city-map" aria-label="Mapa no disponible" />;
  const [longitude, latitude] = selected.coordinates;
  const radius = 0.028 / zoom;
  const source = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - radius}%2C${latitude - radius}%2C${longitude + radius}%2C${latitude + radius}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  return <div className="city-map" aria-label="Mapa interactivo de carnicerías">
    <iframe title={`Mapa de ${selected.name}`} src={source} loading="lazy" />
    {locations.slice(0, 8).map((location, index) => <button className={`map-pin p${index % 3} ${selectedLocationId === location.id ? 'selected' : ''}`} onClick={() => onSelect(location.id)} aria-label={`Seleccionar ${location.name}`} key={location.id}><MapPin /></button>)}
    <div className="map-controls"><button onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} aria-label="Acercar mapa"><ZoomIn /></button><button onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))} aria-label="Alejar mapa"><ZoomOut /></button></div>
    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name}, ${selected.address}`)}`} target="_blank" rel="noreferrer">Abrir mapa</a>
  </div>;
}

function addUserMarker(map: mapboxgl.Map, coordinates: [number, number]) {
  const element = document.createElement('span');
  element.className = 'mapbox-user-marker';
  element.setAttribute('aria-label', 'Tu ubicación');
  new mapboxgl.Marker({ element }).setLngLat(coordinates).setPopup(new mapboxgl.Popup({ offset: 16 }).setText('Tu ubicación')).addTo(map);
}
