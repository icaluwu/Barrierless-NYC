'use client';

import React from 'react';
import { AccessibilityEvidence } from '@/types';
import { Landmark, HardHat, AlertTriangle, Users, CheckCircle } from 'lucide-react';

interface EvidenceListProps {
  evidence: AccessibilityEvidence[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="rounded-xl border border-[#CFE1F1] bg-[#EFF7FF] p-4 text-center text-xs text-[#4C637A]">
        No active construction or sidewalk obstructions reported along this corridor.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[#071A2F]">
        Intersected Accessibility Signals ({evidence.length})
      </h4>
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
        {evidence.map((item) => {
          let icon = Landmark;
          let badgeColor = 'bg-[#DCEEFF] text-[#0867E8] border-[#0867E8]/30';
          let sourceName = 'NYC Open Data Ramp';

          if (item.source === 'nyc_construction') {
            icon = HardHat;
            badgeColor = 'bg-[#FFF3DC] text-[#A96500] border-[#A96500]/30';
            sourceName = 'NYC Construction Permit';
          } else if (item.source === 'nyc_311') {
            icon = AlertTriangle;
            badgeColor = 'bg-[#FFEBEB] text-[#BE3942] border-[#BE3942]/30';
            sourceName = 'NYC 311 Complaint';
          } else if (item.source === 'community') {
            icon = Users;
            badgeColor = 'bg-[#E3F9ED] text-[#16835D] border-[#16835D]/30';
            sourceName = 'Community Report';
          }

          const Icon = icon;

          return (
            <div
              key={item.id}
              className="flex items-start gap-2.5 rounded-xl border border-[#CFE1F1] bg-white p-3 shadow-xs"
            >
              <div className={`rounded-lg p-2 border ${badgeColor}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#071A2F] truncate">{item.category}</span>
                  <span className="text-[10px] font-semibold uppercase text-[#4C637A]">{sourceName}</span>
                </div>
                <p className="mt-0.5 text-xs text-[#4C637A] leading-snug">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
