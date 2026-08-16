import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-[#071A2F]">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold">Privacy Policy & Data Ethics</h1>
        <p className="text-xs text-[#4C637A]">Last updated: Hackathon MVP Release</p>
      </div>

      <div className="rounded-3xl border border-[#CFE1F1] bg-white p-6 space-y-6 text-xs leading-relaxed text-[#4C637A]">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#071A2F]">1. Zero Personal Data Requirement</h2>
          <p>
            Barrierless NYC does not require account creation, social login, email registration, or name submission to search routes, view scores, or submit community barrier reports.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#071A2F]">2. Image Upload Handling</h2>
          <p>
            Photos uploaded to the Barrier Scanner are processed server-side solely to extract physical accessibility barrier attributes (such as barrier category, severity, and visual observations). Files are validated for MIME type and restricted to 5MB maximum size.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#071A2F]">3. Anonymous Session Tokens</h2>
          <p>
            To reduce duplicate report confirmations, lightweight random session hashes may be used. No continuous background GPS tracking or persistent cross-site tracking cookies are deployed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#071A2F]">4. NYC Open Data Public Signals</h2>
          <p>
            Infrastructure evidence (pedestrian ramps, construction permits, 311 service requests) is retrieved from official NYC Open Data (Socrata) public endpoints.
          </p>
        </section>
      </div>
    </div>
  );
}
