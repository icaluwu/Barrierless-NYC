import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Home, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-4 py-16 text-center bg-[#F7FBFF]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DCEEFF] text-[#0867E8] shadow-sm mb-6">
        <ShieldAlert className="h-8 w-8 text-[#0867E8]" />
      </div>

      <span className="rounded-full bg-[#EFF7FF] border border-[#CFE1F1] px-3.5 py-1 text-xs font-bold text-[#0867E8] mb-3">
        404 — Route Not Found
      </span>

      <h1 className="text-3xl font-extrabold text-[#071A2F] sm:text-4xl">
        This path doesn't exist
      </h1>

      <p className="mt-3 text-sm text-[#4C637A] max-w-md mx-auto">
        This route could not be located on our NYC map grid — but we can help you calculate an accessible alternative path.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-[#CFE1F1] px-5 py-2.5 text-xs font-bold text-[#071A2F] hover:bg-[#EFF7FF] shadow-xs w-full sm:w-auto"
        >
          <Home className="h-4 w-4 text-[#0867E8]" />
          Return Home
        </Link>
        <Link
          href="/navigate"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0867E8] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0556C8] transition-colors w-full sm:w-auto"
        >
          <Navigation className="h-4 w-4" />
          Plan an Accessible Route
        </Link>
      </div>
    </div>
  );
}
