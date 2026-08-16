import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#CFE1F1] bg-[#072B52] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <img src="/brand/logo.svg" alt="Barrierless NYC Logo" className="h-8 w-8 object-contain" />
              <span><span className="text-[#24B9F3]">Barrierless</span> NYC</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-[#CFE1F1] leading-relaxed">
              Navigate New York by accessibility, not just distance. Empowering wheelchair users, caregivers, and mobility aid users with evidence-backed pedestrian route trade-offs.
            </p>
            <p className="mt-4 text-xs text-[#90B5D8]">
              Disclaimer: Barrierless Score estimates comparative accessibility suitability from official NYC Open Data and community signals. Real-world street conditions may vary.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#24B9F3]">Navigation</h3>
            <ul className="mt-4 space-y-2 text-sm text-[#CFE1F1]">
              <li><Link href="/navigate" className="hover:text-white transition-colors">Route Planner</Link></li>
              <li><Link href="/report" className="hover:text-white transition-colors">Barrier Scanner</Link></li>
              <li><Link href="/methodology" className="hover:text-white transition-colors">Scoring Engine Methodology</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About & Team</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#24B9F3]">Data Provenance</h3>
            <ul className="mt-4 space-y-2 text-xs text-[#CFE1F1]">
              <li>Official NYC Pedestrian Ramp Dataset</li>
              <li>NYC DOT Street Construction Permits</li>
              <li>NYC 311 Sidewalk Condition Complaints</li>
              <li>Community Barrier Reports</li>
              <li><Link href="/privacy" className="underline hover:text-white">Privacy Statement</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#164273] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#90B5D8]">
          <p>© {new Date().getFullYear()} Barrierless NYC (icaluwu/Barrierless-NYC). Hackathon MVP.</p>
          <p className="mt-2 sm:mt-0">Domain: barrierless.icaluwu.site</p>
        </div>
      </div>
    </footer>
  );
}
