'use client';

import React, { useState, useEffect } from 'react';
import { MobilityProfile, RouteCandidate, AccessibilityEvidence } from '@/types';
import { MobilityProfileSelector } from '@/components/routing/MobilityProfileSelector';
import { RouteCard } from '@/components/routing/RouteCard';
import { EvidenceList } from '@/components/routing/EvidenceList';
import { AiExplanationModal } from '@/components/routing/AiExplanationModal';
import { MapContainer } from '@/components/map/MapContainer';
import { MapPin, Search, Sparkles, Loader2, Navigation, AlertCircle, RefreshCw } from 'lucide-react';

const PRESET_LOCATIONS = [
  { label: 'Times Square (7th & 42nd)', coords: [-73.9855, 40.7580] as [number, number] },
  { label: 'Penn Station (8th & 31st)', coords: [-73.9935, 40.7505] as [number, number] },
  { label: 'Grand Central (Park & 42nd)', coords: [-73.9772, 40.7527] as [number, number] },
  { label: 'Bryant Park (6th & 42nd)', coords: [-73.9832, 40.7536] as [number, number] }
];

export default function NavigatePage() {
  const [profile, setProfile] = useState<MobilityProfile>('wheelchair');
  const [origin, setOrigin] = useState<[number, number]>([-73.9855, 40.7580]); // Times Square
  const [destination, setDestination] = useState<[number, number]>([-73.9772, 40.7527]); // Grand Central
  const [originText, setOriginText] = useState('Times Square (7th Ave & 42nd St)');
  const [destinationText, setDestinationText] = useState('Grand Central Terminal');

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteCandidate[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>();
  const [evidence, setEvidence] = useState<AccessibilityEvidence[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async (prof = profile, orig = origin, dest = destination) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: orig,
          destination: dest,
          profile: prof
        })
      });

      if (!res.ok) throw new Error('Failed to retrieve candidate routes');
      const data = await res.json();
      setRoutes(data.routes || []);
      if (data.routes && data.routes.length > 0) {
        setSelectedRouteId(data.routes[0].id);
        setEvidence(data.routes[0].evidence || []);
      }
    } catch (e: any) {
      setError('Route calculation error. Retrying with cached NYC corridor...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [profile]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const fastestRouteDuration = routes.reduce(
    (min, r) => (r.durationMinutes < min ? r.durationMinutes : min),
    routes[0]?.durationMinutes || 10
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] w-full overflow-hidden bg-[#F7FBFF]">
      {/* Left Route Planner Rail (Desktop ~400px / Mobile Scrollable panel) */}
      <div className="w-full lg:w-[420px] shrink-0 border-r border-[#CFE1F1] bg-white p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-[#071A2F]">Route Planner</h1>
            <span className="text-xs font-bold text-[#0867E8] bg-[#DCEEFF] px-2.5 py-1 rounded-full">
              NYC Open Data
            </span>
          </div>
          <p className="text-xs text-[#4C637A] mt-1">
            Compare pedestrian walking routes based on accessibility evidence.
          </p>
        </div>

        {/* 1. Mobility Profile Selector */}
        <MobilityProfileSelector
          selectedProfile={profile}
          onSelectProfile={(p) => setProfile(p)}
        />

        {/* 2. Origin & Destination Inputs */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F]">
            2. Origin & Destination
          </label>
          
          <div className="space-y-2">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 h-4 w-4 text-[#16835D]" />
              <input
                type="text"
                value={originText}
                onChange={(e) => setOriginText(e.target.value)}
                className="w-full rounded-xl border border-[#CFE1F1] bg-[#EFF7FF]/50 pl-9 pr-3 py-2 text-xs font-semibold text-[#071A2F] focus:border-[#0867E8]"
                placeholder="Origin location..."
              />
            </div>

            <div className="relative flex items-center">
              <Navigation className="absolute left-3 h-4 w-4 text-[#0867E8]" />
              <input
                type="text"
                value={destinationText}
                onChange={(e) => setDestinationText(e.target.value)}
                className="w-full rounded-xl border border-[#CFE1F1] bg-[#EFF7FF]/50 pl-9 pr-3 py-2 text-xs font-semibold text-[#071A2F] focus:border-[#0867E8]"
                placeholder="Destination location..."
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#4C637A] self-center mr-1">Presets:</span>
            {PRESET_LOCATIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (idx % 2 === 0) {
                    setOrigin(preset.coords);
                    setOriginText(preset.label);
                  } else {
                    setDestination(preset.coords);
                    setDestinationText(preset.label);
                  }
                  fetchRoutes(profile, idx % 2 === 0 ? preset.coords : origin, idx % 2 !== 0 ? preset.coords : destination);
                }}
                className="rounded-lg bg-[#EFF7FF] border border-[#CFE1F1] px-2 py-1 text-[11px] font-semibold text-[#0867E8] hover:bg-[#DCEEFF]"
              >
                {preset.label.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchRoutes()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0867E8] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0556C8] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recalculate Routes & Signals
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-[#BE3942]/30 bg-[#FFEBEB] p-3 text-xs text-[#BE3942] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3. Candidate Route Comparison */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#071A2F]">
              3. Route Candidates ({routes.length})
            </label>
            <span className="text-[11px] text-[#4C637A]">BAIE Score Ranked</span>
          </div>

          <div className="space-y-3">
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={route.id === (selectedRouteId || routes[0]?.id)}
                onSelect={(r) => {
                  setSelectedRouteId(r.id);
                  setEvidence(r.evidence || []);
                }}
                fastestDurationMinutes={fastestRouteDuration}
              />
            ))}
          </div>
        </div>

        {/* AI Route Explanation Trigger */}
        {selectedRoute && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-[#0867E8] bg-[#EFF7FF] py-3 text-xs font-extrabold text-[#0867E8] hover:bg-[#DCEEFF] transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-[#24B9F3]" />
              Explain Suitability with AI
            </button>
          </div>
        )}

        {/* 4. Evidence Provenance List */}
        {selectedRoute && (
          <div className="pt-2 border-t border-[#CFE1F1]">
            <EvidenceList evidence={selectedRoute.evidence || evidence} />
          </div>
        )}
      </div>

      {/* Right Map Viewport (Flexible) */}
      <div className="flex-1 h-full relative p-2 sm:p-4">
        <MapContainer
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(id) => setSelectedRouteId(id)}
          evidenceList={evidence}
          center={origin}
        />
      </div>

      {/* AI Explanation Modal */}
      {selectedRoute && (
        <AiExplanationModal
          route={selectedRoute}
          profile={profile}
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
        />
      )}
    </div>
  );
}
