'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Route, AlertTriangle, Info, BookOpen } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#CFE1F1] bg-[#FFFFFF]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="Barrierless NYC Home">
          <Image
            src="/brand/logo.svg"
            alt="Barrierless NYC Logo"
            width={180}
            height={42}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main Navigation">
          <Link
            href="/navigate"
            className="flex items-center gap-1.5 font-medium text-[#071A2F] hover:text-[#0867E8] transition-colors"
          >
            <Route className="h-4 w-4 text-[#0867E8]" />
            Find Route
          </Link>
          <Link
            href="/report"
            className="flex items-center gap-1.5 font-medium text-[#071A2F] hover:text-[#0867E8] transition-colors"
          >
            <AlertTriangle className="h-4 w-4 text-[#A96500]" />
            Report Barrier
          </Link>
          <Link
            href="/methodology"
            className="flex items-center gap-1.5 font-medium text-[#4C637A] hover:text-[#0867E8] transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Methodology
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-1.5 font-medium text-[#4C637A] hover:text-[#0867E8] transition-colors"
          >
            <Info className="h-4 w-4" />
            About
          </Link>
        </nav>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/navigate"
            className="inline-flex items-center justify-center rounded-xl bg-[#0867E8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0556C8] transition-all focus-visible:outline-2"
          >
            Plan Accessible Route
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#071A2F] hover:bg-[#EFF7FF]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#CFE1F1] bg-[#FFFFFF] px-4 pt-2 pb-6 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/navigate"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-[#071A2F] hover:bg-[#EFF7FF]"
            >
              <Route className="h-5 w-5 text-[#0867E8]" />
              Find Accessible Route
            </Link>
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-[#071A2F] hover:bg-[#EFF7FF]"
            >
              <AlertTriangle className="h-5 w-5 text-[#A96500]" />
              Report Barrier
            </Link>
            <Link
              href="/methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-[#4C637A] hover:bg-[#EFF7FF]"
            >
              <BookOpen className="h-5 w-5" />
              Methodology & Scoring
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-[#4C637A] hover:bg-[#EFF7FF]"
            >
              <Info className="h-5 w-5" />
              About Barrierless
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
