'use client';

import React from 'react';
import { RouteCandidate } from '@/types';
import { ShieldCheck, Clock, Ruler, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RouteCardProps {
  route: RouteCandidate;
  isSelected: boolean;
  onSelect: (route: RouteCandidate) => void;
  fastestDurationMinutes?: number;
}

export function RouteCard({
  route,
  isSelected,
  onSelect,
  fastestDurationMinutes = 10,
}: RouteCardProps) {
  const score = route.score || 50;
  const scoreLabel = route.scoreLabel || 'Moderate Accessibility';

  const timeDiff = route.durationMinutes - fastestDurationMinutes;
  const timeDiffText =
    timeDiff <= 0
      ? 'Fastest direct path'
      : `+${timeDiff} min trade-off vs fastest route`;

  return (
    <div
      onClick={() => onSelect(route)}
      className={`relative cursor-pointer rounded-2xl border p-4 transition-all focus-within:ring-2 focus-within:ring-[#0867E8] ${
        isSelected
          ? 'border-[#0867E8] bg-[#DCEEFF]/40 shadow-md ring-2 ring-[#0867E8]/20'
          : 'border-[#CFE1F1] bg-white hover:border-[#24B9F3] hover:bg-[#EFF7FF]/50'
      }`}
    >
      {/* Recommended badge */}
      {route.isRecommended && (
        <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-[#16835D] px-3 py-0.5 text-xs font-bold text-white shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Recommended Route
        </div>
      )}

      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <h3 className="text-base font-bold text-[#071A2F]">{route.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs font-medium text-[#4C637A]">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#0867E8]" />
              {route.durationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-[#0867E8]" />
              {(route.distanceMeters / 1000).toFixed(2)} km
            </span>
          </div>
        </div>

        {/* BAIE Score Badge */}
        <div className="text-right flex flex-col items-end">
          <div
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-sm font-extrabold shadow-sm ${
              score >= 85
                ? 'bg-[#16835D] text-white'
                : score >= 70
                ? 'bg-[#0867E8] text-white'
                : score >= 50
                ? 'bg-[#A96500] text-white'
                : 'bg-[#BE3942] text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {score}/100
          </div>
          <span className="mt-1 text-[11px] font-semibold text-[#4C637A]">{scoreLabel}</span>
        </div>
      </div>

      {/* Tradeoff / Evidence Summary line */}
      <div className="mt-3 flex flex-col gap-1 rounded-lg bg-[#EFF7FF] p-2.5 text-xs text-[#071A2F] border border-[#CFE1F1]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#0867E8]">{timeDiffText}</span>
          <span className="text-[#4C637A]">
            {route.scoreBreakdown?.evidenceCounts.ramps || 0} ramps • {route.scoreBreakdown?.evidenceCounts.construction || 0} construction
          </span>
        </div>
      </div>
    </div>
  );
}
