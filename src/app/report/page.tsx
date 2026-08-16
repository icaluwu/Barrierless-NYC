'use client';

import React, { useState } from 'react';
import { BarrierAnalysisResult, BarrierReport } from '@/types';
import { Upload, Camera, Sparkles, CheckCircle2, AlertTriangle, MapPin, Loader2, ShieldAlert, Navigation, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BarrierAnalysisResult | null>(null);
  const [manualMode, setManualMode] = useState(false);

  // Manual Form States
  const [manualBarrierType, setManualBarrierType] = useState('Blocked Curb Ramp');
  const [manualSeverity, setManualSeverity] = useState<'low' | 'moderate' | 'high'>('high');

  // Location States
  const [latitude, setLatitude] = useState(40.7583);
  const [longitude, setLongitude] = useState(-73.9851);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<BarrierReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setAiUnavailable(false);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be under 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setManualMode(false);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationStatus('Fetching GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
        setLocating(false);
        setLocationStatus('Current location acquired!');
      },
      (err) => {
        setLocating(false);
        setLocationStatus(`Geolocation permission denied or unavailable (${err.message}).`);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const runAiAnalysis = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);
    setAiUnavailable(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/ai/barrier', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setAiUnavailable(true);
        setError(json.message || 'AI barrier scanner is temporarily unavailable.');
        return;
      }

      setAnalysisResult(json as BarrierAnalysisResult);
    } catch (e: any) {
      setAiUnavailable(true);
      setError('AI barrier analysis network request failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const reportPayload = {
      latitude,
      longitude,
      barrierType: analysisResult ? analysisResult.barrierType : manualBarrierType,
      severity: analysisResult ? analysisResult.severity : manualSeverity,
      description: description || (analysisResult ? analysisResult.observations.join(' ') : manualBarrierType),
      aiObservations: analysisResult ? analysisResult.observations : ['User submitted manual barrier report'],
      affectedProfiles: analysisResult ? analysisResult.affectedProfiles : ['wheelchair', 'stroller'],
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to submit community report.');
      }

      setSubmittedReport(json.report);
    } catch (e: any) {
      setError(e.message || 'Failed to submit report. Database persistence may be unavailable.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3DC] px-3.5 py-1 text-xs font-bold text-[#A96500]">
          <AlertTriangle className="h-4 w-4" />
          Community Accessibility Reporting
        </div>
        <h1 className="text-3xl font-extrabold text-[#071A2F]">Report a Pedestrian Barrier</h1>
        <p className="text-sm text-[#4C637A] max-w-xl mx-auto">
          Upload a barrier photo to run multimodal AI analysis. Review structured observations before explicitly confirming your report.
        </p>
      </div>

      {/* Success State */}
      {submittedReport ? (
        <div className="rounded-3xl border border-[#16835D]/30 bg-[#E3F9ED] p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#16835D] text-white">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#071A2F]">Community Barrier Report Published</h2>
          <p className="text-sm text-[#071A2F] max-w-md mx-auto">
            Your report for <span className="font-bold">{submittedReport.barrierType}</span> has been confirmed and is now active on the NYC accessibility map.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/navigate"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0867E8] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0556C8]"
            >
              View on Map
            </Link>
            <button
              onClick={() => {
                setSubmittedReport(null);
                setSelectedFile(null);
                setPreviewUrl(null);
                setAnalysisResult(null);
                setManualMode(false);
              }}
              className="rounded-xl border border-[#CFE1F1] bg-white px-6 py-2.5 text-sm font-bold text-[#071A2F]"
            >
              Report Another Barrier
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Image Upload & Location */}
          <div className="space-y-6 rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#071A2F]">1. Upload Barrier Photo</h2>

            {/* Dropzone */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#CFE1F1] bg-[#EFF7FF]/50 p-6 text-center hover:border-[#0867E8] transition-colors">
              {previewUrl ? (
                <div className="space-y-3 w-full">
                  <img
                    src={previewUrl}
                    alt="Barrier Preview"
                    className="max-h-56 w-full object-cover rounded-xl border border-[#CFE1F1]"
                  />
                  <div className="flex justify-between items-center text-xs text-[#4C637A]">
                    <span className="truncate">{selectedFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setAnalysisResult(null);
                        setManualMode(false);
                      }}
                      className="text-[#BE3942] font-bold hover:underline"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                  <div className="rounded-full bg-[#DCEEFF] p-3 text-[#0867E8]">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-[#071A2F]">Click to upload or take photo</span>
                  <span className="text-[11px] text-[#4C637A]">JPEG, PNG, WebP (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Run AI Analysis Button */}
            {selectedFile && !analysisResult && !manualMode && (
              <button
                type="button"
                onClick={runAiAnalysis}
                disabled={analyzing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0867E8] py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#0556C8] transition-colors disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#24B9F3]" />}
                Run Multimodal AI Barrier Analysis
              </button>
            )}

            {/* Location Selection Section */}
            <div className="space-y-3 pt-4 border-t border-[#CFE1F1]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#071A2F]">2. Obstruction Location</h2>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFF7FF] border border-[#CFE1F1] px-2.5 py-1 text-xs font-bold text-[#0867E8] hover:bg-[#DCEEFF]"
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                  Use My Current Location
                </button>
              </div>

              {locationStatus && (
                <div className="text-[11px] font-semibold text-[#0867E8] bg-[#EFF7FF] p-2 rounded-lg border border-[#CFE1F1]">
                  {locationStatus}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4C637A] mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-[#CFE1F1] p-2 text-xs font-mono text-[#071A2F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4C637A] mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-[#CFE1F1] p-2 text-xs font-mono text-[#071A2F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis / Manual Report & Confirmation */}
          <div className="space-y-6 rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#071A2F] mb-4">3. Structured Analysis & Confirmation</h2>

              {error && (
                <div className="rounded-xl border border-[#BE3942]/30 bg-[#FFEBEB] p-3 text-xs text-[#BE3942] mb-4 space-y-2">
                  <div>{error}</div>
                  {aiUnavailable && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={runAiAnalysis}
                        className="rounded-lg bg-[#BE3942] px-3 py-1 text-[11px] font-bold text-white flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" /> Retry AI
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualMode(true);
                          setError(null);
                        }}
                        className="rounded-lg border border-[#BE3942] bg-white px-3 py-1 text-[11px] font-bold text-[#BE3942]"
                      >
                        Continue with Manual Report
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* State A: Initial Idle State */}
              {!analysisResult && !manualMode && !aiUnavailable && (
                <div className="rounded-2xl border border-dashed border-[#CFE1F1] bg-[#EFF7FF]/30 p-8 text-center text-xs text-[#4C637A]">
                  Upload a barrier photo and click <span className="font-bold">Run Multimodal AI Analysis</span> to generate structured evidence.
                </div>
              )}

              {/* State B: Gemini AI Output */}
              {analysisResult && !manualMode && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#EFF7FF] p-4 border border-[#CFE1F1] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0867E8]">Barrier Type:</span>
                      <span className="text-xs font-extrabold text-[#071A2F]">{analysisResult.barrierType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0867E8]">Severity Band:</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                          analysisResult.severity === 'high'
                            ? 'bg-[#FFEBEB] text-[#BE3942]'
                            : 'bg-[#FFF3DC] text-[#A96500]'
                        }`}
                      >
                        {analysisResult.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0867E8]">Qualitative Certainty:</span>
                      <span className="text-xs font-semibold text-[#071A2F] uppercase">{analysisResult.certainty}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#071A2F] mb-1">Visual Observations:</h4>
                    <ul className="space-y-1 text-xs text-[#4C637A]">
                      {analysisResult.observations.map((obs, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#16835D] mt-0.5 shrink-0" />
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* State C: Manual Mode (when AI unavailable) */}
              {manualMode && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#FFF3DC] p-3 text-xs text-[#A96500] font-semibold">
                    Manual Reporting Mode Enabled
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A2F] mb-1">Barrier Category</label>
                    <select
                      value={manualBarrierType}
                      onChange={(e) => setManualBarrierType(e.target.value)}
                      className="w-full rounded-xl border border-[#CFE1F1] p-2 text-xs font-bold text-[#071A2F]"
                    >
                      <option value="Blocked Curb Ramp">Blocked Curb Ramp</option>
                      <option value="Construction Obstruction">Construction Obstruction</option>
                      <option value="Damaged Sidewalk Pavement">Damaged Sidewalk Pavement</option>
                      <option value="Missing Tactile Paving">Missing Tactile Paving</option>
                      <option value="Narrow Pass-through Corridor">Narrow Pass-through Corridor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A2F] mb-1">Severity</label>
                    <select
                      value={manualSeverity}
                      onChange={(e) => setManualSeverity(e.target.value as any)}
                      className="w-full rounded-xl border border-[#CFE1F1] p-2 text-xs font-bold text-[#071A2F]"
                    >
                      <option value="high">High (Completely Impassable)</option>
                      <option value="moderate">Moderate (Hazard / Tip Risk)</option>
                      <option value="low">Low (Minor Restriction)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Additional Description Input */}
              {(analysisResult || manualMode) && (
                <div className="pt-3">
                  <label className="block text-xs font-bold text-[#071A2F] mb-1">Additional Notes (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any extra details about this physical obstacle..."
                    className="w-full rounded-xl border border-[#CFE1F1] p-2 text-xs text-[#071A2F]"
                    rows={2}
                  />
                  <div className="mt-2 rounded-xl bg-[#FFF3DC] p-2.5 border border-[#A96500]/20 text-[11px] text-[#A96500] flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Explicit user confirmation required before storing community reports.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm & Publish Button */}
            {(analysisResult || manualMode) && (
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#16835D] py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#126b4c] transition-colors disabled:opacity-50 mt-4"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirm & Publish Community Report
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
