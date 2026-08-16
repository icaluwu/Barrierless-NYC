'use client';

import React from 'react';
import { MobilityProfile } from '@/types';
import { Accessibility, Footprints, Baby, PersonStanding } from 'lucide-react';

interface MobilityProfileSelectorProps {
  selectedProfile: MobilityProfile;
  onSelectProfile: (profile: MobilityProfile) => void;
}

const PROFILES: { id: MobilityProfile; label: string; description: string; icon: React.ElementType }[] = [
  {
    id: 'wheelchair',
    label: 'Wheelchair',
    description: 'Requires step-free path, verified curb ramps, and low incline.',
    icon: Accessibility,
  },
  {
    id: 'reduced_mobility',
    label: 'Reduced Mobility',
    description: 'Minimizes long walking distances and steep block segments.',
    icon: Footprints,
  },
  {
    id: 'stroller',
    label: 'Stroller',
    description: 'Prioritizes curb ramps, wide sidewalks, and smooth transitions.',
    icon: Baby,
  },
  {
    id: 'mobility_aid',
    label: 'Mobility Aid',
    description: 'Avoids broken pavement, high curbs, and active construction.',
    icon: PersonStanding,
  },
];

export function MobilityProfileSelector({
  selectedProfile,
  onSelectProfile,
}: MobilityProfileSelectorProps) {
  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F]">
        1. Select Mobility Profile
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Mobility Profile Selection">
        {PROFILES.map((p) => {
          const isSelected = selectedProfile === p.id;
          const Icon = p.icon;

          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectProfile(p.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all focus-visible:outline-2 ${
                isSelected
                  ? 'border-[#0867E8] bg-[#0867E8] text-white shadow-md ring-2 ring-[#0867E8]/30'
                  : 'border-[#CFE1F1] bg-white text-[#071A2F] hover:bg-[#EFF7FF] hover:border-[#24B9F3]'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isSelected ? 'text-white' : 'text-[#0867E8]'}`} />
              <span className="text-xs font-bold">{p.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[#4C637A] mt-1.5 italic">
        {PROFILES.find((p) => p.id === selectedProfile)?.description}
      </p>
    </div>
  );
}
