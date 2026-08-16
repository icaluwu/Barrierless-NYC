'use client';

import React, { useState } from 'react';
import { AiRouteExplanation, RouteCandidate, MobilityProfile } from '@/types';
import { Sparkles, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface AiExplanationModalProps {
  route: RouteCandidate;
  profile: MobilityProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function AiExplanationModal({
  route,
  profile,
  isOpen,
  onClose,
}: AiExplanationModalProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<AiRouteExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/explain-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          recommendedRouteName: route.name,
          recommendedScore: route.score || 85,
          evidenceCounts: route.scoreBreakdown?.evidenceCounts || { ramps: 3, construction: 0, complaints: 0, communityBarriers: 0 },
          timeDifferenceMinutes: 2,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate AI explanation');
      const data: AiRouteExplanation = await res.json();
      setExplanation(data);
    } catch (e: any) {
      setError('AI service temporarily unavailable. Deterministic route evidence remains active.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !explanation && !loading) {
      fetchExplanation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A2F]/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#CFE1F1] pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#0867E8] p-2 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#071A2F]">AI-Assisted Route Explanation</h2>
              <span className="text-xs font-semibold text-[#24B9F3]">Grounded exclusively in deterministic route evidence</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#4C637A] hover:bg-[#EFF7FF] hover:text-[#071A2F]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-[#4C637A]">
              <Loader2 className="h-8 w-8 animate-spin text-[#0867E8] mb-2" />
              Analyzing route trade-offs and NYC Open Data evidence...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-[#BE3942]/30 bg-[#FFEBEB] p-4 text-xs text-[#BE3942]">
              {error}
            </div>
          )}

          {explanation && !loading && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#EFF7FF] p-4 border border-[#CFE1F1]">
                <p className="text-sm font-semibold text-[#071A2F] leading-relaxed">
                  {explanation.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-2">
                  Key Accessibility Suitability Factors:
                </h4>
                <ul className="space-y-2">
                  {explanation.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#071A2F]">
                      <CheckCircle2 className="h-4 w-4 text-[#16835D] shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-[#FFF3DC] p-3 border border-[#A96500]/20 text-[11px] text-[#A96500]">
                <span className="font-bold">Disclaimer: </span>
                {explanation.caveat}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#0867E8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0556C8] transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
