'use client';

import React, { useEffect, useRef } from 'react';
import { AccessibilityEvidence, RouteCandidate } from '@/types';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapContainerProps {
  routes: RouteCandidate[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  evidenceList?: AccessibilityEvidence[];
  center?: [number, number];
  zoom?: number;
}

export function MapContainer({
  routes,
  selectedRouteId,
  onSelectRoute,
  evidenceList = [],
  center = [-73.9855, 40.7580],
  zoom = 14,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize MapLibre GL map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: center,
      zoom: zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      mapRef.current = map;
      updateMapLayers(map, routes, selectedRouteId, evidenceList);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateMapLayers(mapRef.current, routes, selectedRouteId, evidenceList);
    }
  }, [routes, selectedRouteId, evidenceList]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-[#CFE1F1] shadow-inner bg-[#EFF7FF]">
      <div ref={mapContainerRef} className="w-full h-full" aria-label="Interactive NYC Map" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-white/95 backdrop-blur-md p-3 shadow-md border border-[#CFE1F1] text-xs space-y-1.5">
        <div className="font-bold text-[#071A2F] mb-1">Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#0867E8] inline-block" />
          <span className="text-[#071A2F]">Recommended Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#A96500] inline-block" />
          <span className="text-[#071A2F]">Alternative Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#16835D] inline-block" />
          <span className="text-[#071A2F]">NYC Ramp Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#BE3942] inline-block" />
          <span className="text-[#071A2F]">Construction / Barrier</span>
        </div>
      </div>
    </div>
  );
}

function updateMapLayers(
  map: maplibregl.Map,
  routes: RouteCandidate[],
  selectedRouteId?: string,
  evidenceList: AccessibilityEvidence[] = []
) {
  // Remove existing route layers & sources if present
  ['route-recommended', 'route-alt-1', 'route-alt-2'].forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);
  });

  routes.forEach((route, idx) => {
    const isSelected = route.id === selectedRouteId || (idx === 0 && !selectedRouteId);
    const sourceId = `route-${route.id}`;

    if (map.getSource(sourceId)) {
      map.removeLayer(sourceId);
      map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route.geometry,
      },
    });

    map.addLayer({
      id: sourceId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': isSelected ? '#0867E8' : '#A96500',
        'line-width': isSelected ? 6 : 4,
        'line-opacity': isSelected ? 0.9 : 0.6,
      },
    });
  });

  // Fit bounds to routes if available
  if (routes.length > 0 && routes[0].geometry.coordinates.length > 0) {
    const bounds = new maplibregl.LngLatBounds();
    routes.forEach((r) => {
      r.geometry.coordinates.forEach((coord) => bounds.extend(coord));
    });
    map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
  }
}
