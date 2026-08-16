import React from 'react';
import { ShieldCheck, BookOpen, Landmark, HardHat, AlertTriangle, Scale } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DCEEFF] px-3.5 py-1 text-xs font-bold text-[#0867E8]">
          <BookOpen className="h-4 w-4" />
          Technical & Data Methodology
        </div>
        <h1 className="text-3xl font-extrabold text-[#071A2F]">Barrierless Accessibility Intelligence Engine (BAIE)</h1>
        <p className="text-sm text-[#4C637A] max-w-xl mx-auto">
          Detailed documentation of scoring weights, evidence normalization, NYC Open Data integrations, and qualitative uncertainty boundaries.
        </p>
      </div>

      {/* Scoring Weight Breakdown Table */}
      <div className="rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#071A2F] flex items-center gap-2">
          <Scale className="h-5 w-5 text-[#0867E8]" />
          BAIE Score Weight Distribution
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#CFE1F1] bg-[#EFF7FF] text-[#071A2F]">
                <th className="p-3 font-bold">Signal Family</th>
                <th className="p-3 font-bold">Weight</th>
                <th className="p-3 font-bold">Source Provenance</th>
                <th className="p-3 font-bold">Scoring Mechanics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CFE1F1] text-[#071A2F]">
              <tr>
                <td className="p-3 font-semibold">Pedestrian Ramp Proximity</td>
                <td className="p-3 font-extrabold text-[#16835D]">30%</td>
                <td className="p-3">NYC DOT Ramp Dataset</td>
                <td className="p-3">Calculates density of verified ADA curb ramps per 500m route segment.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Street Construction Permits</td>
                <td className="p-3 font-extrabold text-[#A96500]">25%</td>
                <td className="p-3">NYC DOT Construction Permits</td>
                <td className="p-3">Penalizes active street excavation permits, sidewalk closures, and heavy equipment sheds.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">311 Sidewalk Complaints</td>
                <td className="p-3 font-extrabold text-[#BE3942]">20%</td>
                <td className="p-3">NYC 311 Service Requests</td>
                <td className="p-3">Deducts score for active complaints regarding broken pavement and defective curb transitions.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Confirmed Community Reports</td>
                <td className="p-3 font-extrabold text-[#0867E8]">15%</td>
                <td className="p-3">Barrierless Crowdsourcing</td>
                <td className="p-3">Incorporates user-confirmed physical obstruction reports uploaded via the barrier scanner.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Profile Suitability Compatibility</td>
                <td className="p-3 font-extrabold text-[#24B9F3]">10%</td>
                <td className="p-3">BAIE Profile Rules</td>
                <td className="p-3">Adjusts bonus score based on specific mobility profile requirements (e.g. step-free requirement for Wheelchair).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Freshness & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-[#071A2F]">Data Freshness Policy</h3>
          <p className="text-xs text-[#4C637A] leading-relaxed">
            NYC Open Data permits and 311 complaints are synchronized via API adapters. Community barrier reports support expiration parameters to ensure temporary construction material or parked vehicle blockages clear over time.
          </p>
        </div>

        <div className="rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-[#071A2F]">Suitability Disclaimer</h3>
          <p className="text-xs text-[#4C637A] leading-relaxed">
            Barrierless Score is an estimated comparative suitability index based on available digital evidence. It does not certify a route as 100% ADA compliant or obstacle-free in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
