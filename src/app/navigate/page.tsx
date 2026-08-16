'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MobilityProfile, RouteCandidate, AccessibilityEvidence, SystemDataStatus } from '@/types';
import { MobilityProfileSelector } from '@/components/routing/MobilityProfileSelector';
import { RouteCard } from '@/components/routing/RouteCard';
import { EvidenceList } from '@/components/routing/EvidenceList';
import { AiExplanationModal } from '@/components/routing/AiExplanationModal';
import { MapContainer } from '@/components/map/MapContainer';
import { MapPin, Sparkles, Loader2, Navigation, AlertCircle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LocationSuggestion {
  label: string;
  coordinates: [number, number];
}

const PRESET_LOCATIONS: LocationSuggestion[] = [
  { label: 'Times Square (7th & 42nd)', coordinates: [-73.9855, 40.7580] },
  { label: 'Bryant Park (6th & 42nd)', coordinates: [-73.9832, 40.7536] },
  { label: 'Grand Central Terminal', coordinates: [-73.9772, 40.7527] },
  { label: 'Penn Station (8th & 31st)', coordinates: [-73.9935, 40.7505] },
  { label: 'Washington Square Park', coordinates: [-73.9973, 40.7308] },
  { label: 'Columbus Circle', coordinates: [-73.9819, 40.7681] },
];

export default function NavigatePage() {
  const [profile, setProfile] = useState<MobilityProfile>('wheelchair');

  // Origin State
  const [originText, setOriginText] = useState('Times Square (7th & 42nd)');
  const [originCoords, setOriginCoords] = useState<[number, number] | null>([-73.9855, 40.7580]);
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  // Destination State
  const [destinationText, setDestinationText] = useState('Grand Central Terminal');
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>([-73.9772, 40.7527]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteCandidate[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>();
  const [evidence, setEvidence] = useState<AccessibilityEvidence[]>([]);
  const [dataStatus, setDataStatus] = useState<SystemDataStatus | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced Origin Geocoding
  useEffect(() => {
    if (!originText.trim()) {
      setOriginSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: originText }),
        });
        if (res.ok) {
          const data = await res.json();
          setOriginSuggestions(data.results || []);
        }
      } catch (e) {
        // Ignore geocode search error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [originText]);

  // Debounced Destination Geocoding
  useEffect(() => {
    if (!destinationText.trim()) {
      setDestinationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: destinationText }),
        });
        if (res.ok) {
          const data = await res.json();
          setDestinationSuggestions(data.results || []);
        }
      } catch (e) {
        // Ignore geocode search error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destinationText]);

  const fetchRoutes = async (
    prof = profile,
    orig = originCoords,
    dest = destinationCoords
  ) => {
    if (!orig || !dest) {
      setError('Select a location from the suggestions before calculating routes.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: orig,
          destination: dest,
          profile: prof,
        }),
      });

      if (!res.ok) throw new Error('Failed to retrieve candidate routes');
      const data = await res.json();
      setRoutes(data.routes || []);
      setDataStatus(data.dataStatus || null);

      if (data.routes && data.routes.length > 0) {
        setSelectedRouteId(data.routes[0].id);
        setEvidence(data.routes[0].evidence || []);
      }
    } catch (e: any) {
      setError('Route calculation error. Please try selecting coordinates again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (originCoords && destinationCoords) {
      fetchRoutes();
    }
  }, [profile]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const fastestRouteDuration = routes.reduce(
    (min, r) => (r.durationMinutes < min ? r.durationMinutes : min),
    routes[0]?.durationMinutes || 10
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] w-full overflow-hidden bg-[#F7FBFF]">
      {/* Left Route Planner Rail */}
      <div className="w-full lg:w-[440px] shrink-0 border-r border-[#CFE1F1] bg-white p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-[#071A2F]">Route Planner</h1>
            <span className="text-xs font-bold text-[#0867E8] bg-[#DCEEFF] px-2.5 py-1 rounded-full">
              NYC Open Data
            </span>
          </div>
          <p className="text-xs text-[#4C637A] mt-1">
            Compare pedestrian routes based on verified accessibility signals.
          </p>
        </div>

        {/* System Data Status Indicator */}
        {dataStatus && (
          <div className="rounded-xl border border-[#CFE1F1] bg-[#EFF7FF] p-3 text-xs space-y-1">
            <div className="font-bold text-[#071A2F] flex items-center justify-between">
              <span>Data Provenance Status</span>
              <span className="text-[10px] text-[#4C637A]">Live Status</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-[#4C637A] pt-1">
              <span className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${dataStatus.routing === 'live' ? 'bg-[#16835D]' : 'bg-[#D97706]'}`} />
                Routing: {dataStatus.routing}
              </span>
              <span className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${dataStatus.ramps === 'live' ? 'bg-[#16835D]' : 'bg-[#D97706]'}`} />
                Ramps: {dataStatus.ramps}
              </span>
              <span className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${dataStatus.construction === 'live' ? 'bg-[#16835D]' : 'bg-[#D97706]'}`} />
                Construction: {dataStatus.construction}
              </span>
              <span className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${dataStatus.complaints311 === 'live' ? 'bg-[#16835D]' : 'bg-[#D97706]'}`} />
                311: {dataStatus.complaints311}
              </span>
            </div>
          </div>
        )}

        {/* 1. Mobility Profile Selector */}
        <MobilityProfileSelector
          selectedProfile={profile}
          onSelectProfile={(p) => setProfile(p)}
        />

        {/* 2. Geocoded Origin & Destination Inputs */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F]">
            2. Origin & Destination Locations
          </label>

          <div className="space-y-3 relative">
            {/* Origin Input + Suggestions */}
            <div className="relative">
              <div className="flex items-center">
                <MapPin className="absolute left-3 h-4 w-4 text-[#16835D] z-10" />
                <input
                  type="text"
                  value={originText}
                  onFocus={() => setShowOriginDropdown(true)}
                  onChange={(e) => {
                    setOriginText(e.target.value);
                    setOriginCoords(null); // Force explicit selection
                    setShowOriginDropdown(true);
                  }}
                  className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-xs font-semibold text-[#071A2F] focus:outline-none ${
                    !originCoords
                      ? 'border-[#D97706] bg-[#FFFBEB]'
                      : 'border-[#CFE1F1] bg-[#EFF7FF]/50 focus:border-[#0867E8]'
                  }`}
                  placeholder="Type origin address or landmark..."
                />
              </div>

              {/* Origin Dropdown Suggestions */}
              {showOriginDropdown && originSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl bg-white border border-[#CFE1F1] shadow-lg max-h-48 overflow-y-auto py-1">
                  {originSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setOriginText(item.label);
                        setOriginCoords(item.coordinates);
                        setShowOriginDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#071A2F] hover:bg-[#EFF7FF] flex items-center justify-between"
                    >
                      <span className="truncate">{item.label}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#16835D] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Input + Suggestions */}
            <div className="relative">
              <div className="flex items-center">
                <Navigation className="absolute left-3 h-4 w-4 text-[#0867E8] z-10" />
                <input
                  type="text"
                  value={destinationText}
                  onFocus={() => setShowDestinationDropdown(true)}
                  onChange={(e) => {
                    setDestinationText(e.target.value);
                    setDestinationCoords(null); // Force explicit selection
                    setShowDestinationDropdown(true);
                  }}
                  className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-xs font-semibold text-[#071A2F] focus:outline-none ${
                    !destinationCoords
                      ? 'border-[#D97706] bg-[#FFFBEB]'
                      : 'border-[#CFE1F1] bg-[#EFF7FF]/50 focus:border-[#0867E8]'
                  }`}
                  placeholder="Type destination address or landmark..."
                />
              </div>

              {/* Destination Dropdown Suggestions */}
              {showDestinationDropdown && destinationSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl bg-white border border-[#CFE1F1] shadow-lg max-h-48 overflow-y-auto py-1">
                  {destinationSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDestinationText(item.label);
                        setDestinationCoords(item.coordinates);
                        setShowDestinationDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#071A2F] hover:bg-[#EFF7FF] flex items-center justify-between"
                    >
                      <span className="truncate">{item.label}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0867E8] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
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
                    setOriginCoords(preset.coordinates);
                    setOriginText(preset.label);
                  } else {
                    setDestinationCoords(preset.coordinates);
                    setDestinationText(preset.label);
                  }
                  fetchRoutes(
                    profile,
                    idx % 2 === 0 ? preset.coordinates : originCoords,
                    idx % 2 !== 0 ? preset.coordinates : destinationCoords
                  );
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
            disabled={loading || !originCoords || !destinationCoords}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0867E8] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0556C8] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Calculate Route Candidates
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
        <div className="space-y-3 pt-1">
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
          <div className="pt-1">
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

      {/* Right Map Viewport */}
      <div className="flex-1 h-full relative p-2 sm:p-4">
        <MapContainer
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(id) => setSelectedRouteId(id)}
          evidenceList={evidence}
          center={originCoords || [-73.9855, 40.7580]}
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
