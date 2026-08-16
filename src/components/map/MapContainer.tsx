'use client';

import React, { useEffect, useRef } from 'react';
import { AccessibilityEvidence, RouteCandidate } from '@/types';
import { createEvidencePopupContent } from '@/lib/map/create-evidence-popup-content';
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
  const markersRef = useRef<maplibregl.Marker[]>([]);

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
      updateMapLayers(map, routes, selectedRouteId, evidenceList, markersRef, onSelectRoute);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateMapLayers(mapRef.current, routes, selectedRouteId, evidenceList, markersRef, onSelectRoute);
    }
  }, [routes, selectedRouteId, evidenceList]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-[#CFE1F1] shadow-inner bg-[#EFF7FF]">
      <div ref={mapContainerRef} className="w-full h-full" aria-label="Interactive NYC Map" />

      {/* Map Legend & Provenance Overlay */}
      <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-white/95 backdrop-blur-md p-3 shadow-md border border-[#CFE1F1] text-xs space-y-1.5 max-w-[220px]">
        <div className="font-bold text-[#071A2F] mb-1 flex items-center justify-between">
          <span>Map Legend</span>
          <span className="text-[10px] text-[#0867E8] bg-[#DCEEFF] px-1.5 py-0.5 rounded font-semibold">NYC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#0867E8] inline-block" />
          <span className="text-[#071A2F] font-medium">Selected Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#94A3B8] inline-block" />
          <span className="text-[#071A2F]">Alternative Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#16835D] inline-block" />
          <span className="text-[#071A2F]">Official NYC Ramp</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D97706] inline-block" />
          <span className="text-[#071A2F]">Construction Permit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626] inline-block" />
          <span className="text-[#071A2F]">NYC 311 Complaint</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED] inline-block" />
          <span className="text-[#071A2F]">Community Report</span>
        </div>
      </div>
    </div>
  );
}

function updateMapLayers(
  map: maplibregl.Map,
  routes: RouteCandidate[],
  selectedRouteId: string | undefined,
  evidenceList: AccessibilityEvidence[],
  markersRef: React.MutableRefObject<maplibregl.Marker[]>,
  onSelectRoute?: (routeId: string) => void
) {
  // Clear existing HTML markers
  markersRef.current.forEach((m) => m.remove());
  markersRef.current = [];

  // Remove existing route layers & sources
  routes.forEach((route) => {
    const sourceId = `route-${route.id}`;
    if (map.getLayer(sourceId)) map.removeLayer(sourceId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  });

  // Render Candidate Route Line Layers
  routes.forEach((route, idx) => {
    const isSelected = route.id === selectedRouteId || (idx === 0 && !selectedRouteId);
    const sourceId = `route-${route.id}`;

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: { routeId: route.id },
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
        'line-color': isSelected ? '#0867E8' : '#94A3B8',
        'line-width': isSelected ? 7 : 4,
        'line-opacity': isSelected ? 0.95 : 0.45,
      },
    });

    // Handle line click to select route
    map.on('click', sourceId, () => {
      if (onSelectRoute) onSelectRoute(route.id);
    });

    map.on('mouseenter', sourceId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', sourceId, () => {
      map.getCanvas().style.cursor = '';
    });
  });

  // Render Evidence Markers with HTML elements & popups
  evidenceList.forEach((e) => {
    if (!e.coordinate || e.coordinate.length < 2) return;
    const [lng, lat] = e.coordinate;

    const el = document.createElement('div');
    el.className = 'evidence-marker-container';

    // Color and icon code by source type
    let color = '#16835D'; // Ramp default (green)
    let iconSymbol = '✓';
    let sourceLabel = e.sourceName || 'Official NYC Data';

    if (e.source === 'nyc_construction') {
      color = '#D97706'; // Construction (amber)
      iconSymbol = '⚠';
    } else if (e.source === 'nyc_311') {
      color = '#DC2626'; // 311 (red)
      iconSymbol = '!';
    } else if (e.source === 'community') {
      color = '#7C3AED'; // Community (purple)
      iconSymbol = '★';
      sourceLabel = 'Community Report (User Confirmed)';
    }

    el.style.backgroundColor = color;
    el.style.color = '#FFFFFF';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '10px';
    el.style.fontWeight = 'bold';
    el.style.border = '2px solid #FFFFFF';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    el.style.cursor = 'pointer';

    el.innerText = iconSymbol;

    const popupContent = createEvidencePopupContent(e, color, sourceLabel);
    const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setDOMContent(popupContent);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    markersRef.current.push(marker);
  });

  // Fit bounds to candidate routes
  if (routes.length > 0 && routes[0].geometry.coordinates.length > 0) {
    const bounds = new maplibregl.LngLatBounds();
    routes.forEach((r) => {
      r.geometry.coordinates.forEach((coord) => bounds.extend(coord));
    });
    map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
  }
}
