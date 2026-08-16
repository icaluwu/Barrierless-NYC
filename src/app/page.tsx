import React from 'react';
import Link from 'next/link';
import { HeroSpline } from '@/components/landing/HeroSpline';
import { Route, AlertTriangle, ShieldCheck, Sparkles, Accessibility, HardHat, Landmark, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EFF7FF] via-[#F7FBFF] to-white pt-12 pb-16 border-b border-[#CFE1F1]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEEFF] px-3.5 py-1.5 text-xs font-bold text-[#0867E8] border border-[#0867E8]/20">
                <Sparkles className="h-4 w-4 text-[#24B9F3]" />
                Accessibility-Aware Navigation for NYC
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#071A2F] leading-[1.1]">
                The shortest route isn't always the route you can use.
              </h1>

              <p className="text-lg sm:text-xl text-[#4C637A] leading-relaxed max-w-2xl">
                Barrierless NYC compares pedestrian walking routes using your mobility needs, official NYC Open Data accessibility signals, community barrier reports, and AI-assisted explanations.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/navigate"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0867E8] px-6 py-3.5 text-base font-bold text-white shadow-lg hover:bg-[#0556C8] transition-all transform hover:-translate-y-0.5 focus-visible:outline-2"
                >
                  <Route className="h-5 w-5" />
                  Find an Accessible Route
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-[#071A2F] border border-[#CFE1F1] shadow-sm hover:bg-[#EFF7FF] hover:border-[#24B9F3] transition-all focus-visible:outline-2"
                >
                  <AlertTriangle className="h-5 w-5 text-[#A96500]" />
                  Report a Barrier
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#CFE1F1]/60 text-xs font-semibold text-[#4C637A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16835D]" />
                  NYC Open Data
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16835D]" />
                  Deterministic BAIE
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16835D]" />
                  No Account Needed
                </div>
              </div>
            </div>

            {/* Right Hero Visual Column (Spline / Fallback) */}
            <div className="lg:col-span-5 w-full">
              <HeroSpline />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar 1: Mobility Profiles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0867E8]">Tailored Mobility Profiles</h2>
          <p className="text-3xl font-extrabold text-[#071A2F]">Built for how you move</p>
          <p className="text-sm text-[#4C637A]">
            Every pedestrian encounters different obstacles. Select your profile to calculate comparative suitability.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-[#CFE1F1] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-[#DCEEFF] flex items-center justify-center text-[#0867E8] mb-4">
              <Accessibility className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#071A2F]">Wheelchair</h3>
            <p className="mt-2 text-xs text-[#4C637A] leading-relaxed">
              Prioritizes step-free routes, verified curb ramp proximity, low incline gradients, and strict construction avoidance.
            </p>
          </div>

          <div className="rounded-2xl border border-[#CFE1F1] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-[#DCEEFF] flex items-center justify-center text-[#0867E8] mb-4">
              <Route className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#071A2F]">Reduced Mobility</h3>
            <p className="mt-2 text-xs text-[#4C637A] leading-relaxed">
              Balances reasonable walking distances with manageable crosswalks and reduced physical block difficulty.
            </p>
          </div>

          <div className="rounded-2xl border border-[#CFE1F1] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-[#DCEEFF] flex items-center justify-center text-[#0867E8] mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#071A2F]">Stroller</h3>
            <p className="mt-2 text-xs text-[#4C637A] leading-relaxed">
              Avoids steep curb drops, narrow scaffoldings, sidewalk cracks, and unpaved street excavations.
            </p>
          </div>

          <div className="rounded-2xl border border-[#CFE1F1] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-[#DCEEFF] flex items-center justify-center text-[#0867E8] mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#071A2F]">Mobility Aid</h3>
            <p className="mt-2 text-xs text-[#4C637A] leading-relaxed">
              Favors smooth continuous pavement, high street lighting, and clear pedestrian refuge islands.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillar 2: BAIE Engine & Provenance */}
      <section className="bg-[#072B52] text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#24B9F3]/20 px-3.5 py-1.5 text-xs font-bold text-[#24B9F3] border border-[#24B9F3]/30">
                <ShieldCheck className="h-4 w-4" />
                Deterministic Scoring Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Barrierless Accessibility Intelligence Engine (BAIE)
              </h2>
              <p className="text-base text-[#CFE1F1] leading-relaxed">
                Unlike systems that rely on unverified LLM hallucinations for safety claims, BAIE calculates comparative 0–100 suitability scores deterministically using weighted civic evidence.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#164273] border border-[#24B9F3]/30">
                  <Landmark className="h-6 w-6 text-[#24B9F3] shrink-0" />
                  <div>
                    <div className="text-sm font-bold">NYC Pedestrian Ramp Locations (30%)</div>
                    <div className="text-xs text-[#CFE1F1]">Official DOT verified curb transition coverage</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#164273] border border-[#24B9F3]/30">
                  <HardHat className="h-6 w-6 text-[#A96500] shrink-0" />
                  <div>
                    <div className="text-sm font-bold">Street Construction Permits (25%)</div>
                    <div className="text-xs text-[#CFE1F1]">Active excavations and sidewalk shed restrictions</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#164273] border border-[#24B9F3]/30">
                  <AlertTriangle className="h-6 w-6 text-[#BE3942] shrink-0" />
                  <div>
                    <div className="text-sm font-bold">311 Sidewalk Complaints & Community Barriers (35%)</div>
                    <div className="text-xs text-[#CFE1F1]">Real-time crowdsourced obstruction evidence</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#24B9F3]/30 bg-[#071A2F] p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white">How Evidence Grounds AI</h3>
              <p className="text-xs text-[#CFE1F1] leading-relaxed">
                AI has exactly two approved responsibilities in Barrierless NYC: explaining computed route evidence and analyzing uploaded barrier photos.
              </p>

              <div className="space-y-4">
                <div className="rounded-2xl bg-[#072B52] p-4 border border-[#24B9F3]/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#24B9F3]">
                    <Sparkles className="h-4 w-4" />
                    AI Route Explainer
                  </div>
                  <p className="mt-1 text-xs text-[#CFE1F1]">
                    Translates complex evidence metrics into concise, plain-English trade-off explanations.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#072B52] p-4 border border-[#24B9F3]/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#24B9F3]">
                    <Sparkles className="h-4 w-4" />
                    Multimodal Barrier Scanner
                  </div>
                  <p className="mt-1 text-xs text-[#CFE1F1]">
                    Extracts structured barrier severity and profile impacts from uploaded photos. Requires user confirmation before publishing.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#24B9F3] hover:underline"
                >
                  Read full scoring methodology & documentation →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0867E8] to-[#072B52] p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to compare NYC pedestrian routes?</h2>
          <p className="text-base text-[#CFE1F1] max-w-xl mx-auto">
            Experience evidence-backed accessibility routing across Manhattan, Brooklyn, and all five boroughs.
          </p>
          <div>
            <Link
              href="/navigate"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-[#0867E8] shadow-lg hover:bg-[#EFF7FF] transition-all transform hover:scale-105"
            >
              Start Route Comparison
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
