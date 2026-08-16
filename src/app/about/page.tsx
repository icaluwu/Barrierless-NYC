import React from 'react';
import Link from 'next/link';
import { Route, ShieldCheck, Heart, Users, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Mission */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-[#071A2F]">About Barrierless NYC</h1>
        <p className="text-lg text-[#4C637A] max-w-2xl mx-auto leading-relaxed">
          The shortest route isn't always the route you can use. Barrierless NYC is an English-language accessibility-first web application designed to help people compare New York City pedestrian routes based on mobility needs rather than distance alone.
        </p>
      </div>

      {/* Target Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm space-y-3">
          <div className="rounded-xl bg-[#DCEEFF] p-3 text-[#0867E8] w-fit">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#071A2F]">Primary Users</h2>
          <ul className="text-sm text-[#4C637A] space-y-2 list-disc list-inside">
            <li>Wheelchair users requiring step-free paths and verified curb ramps.</li>
            <li>People using canes, walkers, or mobility aids needing manageable pavement.</li>
            <li>Parents and caregivers maneuvering strollers through busy city blocks.</li>
            <li>Seniors and individuals with reduced mobility seeking safer crosswalks.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm space-y-3">
          <div className="rounded-xl bg-[#DCEEFF] p-3 text-[#0867E8] w-fit">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#071A2F]">Community & Advocates</h2>
          <ul className="text-sm text-[#4C637A] space-y-2 list-disc list-inside">
            <li>NYC residents reporting temporary sidewalk obstacles and broken ramps.</li>
            <li>Accessibility advocates promoting evidence-backed urban planning.</li>
            <li>Caregivers planning mobility-conscious trips across NYC boroughs.</li>
          </ul>
        </div>
      </div>

      {/* Product Principles */}
      <div className="rounded-3xl bg-[#072B52] text-white p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white">Our Product Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#CFE1F1]">
          <div className="p-4 rounded-2xl bg-[#164273] border border-[#24B9F3]/30">
            <div className="font-bold text-white text-sm mb-1">1. Accessibility Before Novelty</div>
            If visual complexity competes with usability or keyboard focus, usability always wins.
          </div>
          <div className="p-4 rounded-2xl bg-[#164273] border border-[#24B9F3]/30">
            <div className="font-bold text-white text-sm mb-1">2. Deterministic Engine, Generative Explanation</div>
            Routes and scores are calculated strictly in code. AI only explains computed evidence.
          </div>
          <div className="p-4 rounded-2xl bg-[#164273] border border-[#24B9F3]/30">
            <div className="font-bold text-white text-sm mb-1">3. Comparative Suitability</div>
            Never claim a route is 100% safe or guaranteed obstacle-free. Real-world street conditions vary.
          </div>
          <div className="p-4 rounded-2xl bg-[#164273] border border-[#24B9F3]/30">
            <div className="font-bold text-white text-sm mb-1">4. No Account Required</div>
            Immediate, frictionless accessibility routing for all residents and visitors.
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/navigate"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0867E8] px-8 py-3.5 text-base font-bold text-white shadow-lg hover:bg-[#0556C8]"
        >
          <Route className="h-5 w-5" />
          Try Barrierless Route Planner
        </Link>
      </div>
    </div>
  );
}
