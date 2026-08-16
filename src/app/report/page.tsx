'use client';

import React, { useState } from 'react';
import { BarrierAnalysisResult, BarrierReport, MobilityProfile } from '@/types';
import { Upload, Camera, Sparkles, CheckCircle2, AlertTriangle, MapPin, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BarrierAnalysisResult | null>(null);
  
  const [latitude, setLatitude] = useState(40.7583);
  const [longitude, setLongitude] = useState(-73.9851);
  const [description, setDescription] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<BarrierReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be under 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const runAiAnalysis = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/ai/barrier', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to analyze barrier photo');
      }

      const data: BarrierAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (e: any) {
      setError(e.message || 'AI barrier scanner error. Proceeding with manual confirmation.');
      // Provide deterministic fallback
      setAnalysisResult({
        barrierType: 'Physical Sidewalk Obstruction',
        severity: 'high',
        observations: ['Photo indicates physical block or ramp disruption.'],
        affectedProfiles: ['wheelchair', 'stroller'],
        suggestedReportCategory: 'Pedestrian Barrier',
        certainty: 'moderate',
        requiresUserConfirmation: true,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!analysisResult) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          barrierType: analysisResult.barrierType,
          severity: analysisResult.severity,
          description: description || analysisResult.observations.join(' '),
          aiObservations: analysisResult.observations,
          affectedProfiles: analysisResult.affectedProfiles,
        }),
      });

      if (!res.ok) throw new Error('Failed to persist community report');
      const json = await res.json();
      setSubmittedReport(json.report);
    } catch (e: any) {
      setError('Failed to submit report. Please check location parameters.');
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
            {selectedFile && !analysisResult && (
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

            {/* Location Inputs */}
            <div className="space-y-3 pt-4 border-t border-[#CFE1F1]">
              <h2 className="text-base font-bold text-[#071A2F]">2. Obstruction Location</h2>
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
              <p className="text-[11px] text-[#4C637A]">
                Default coordinates set to Times Square corridor. Adjust to exact barrier position.
              </p>
            </div>
          </div>

          {/* Right Column: AI Analysis & Confirmation */}
          <div className="space-y-6 rounded-3xl border border-[#CFE1F1] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#071A2F] mb-4">3. Structured AI Analysis & Confirmation</h2>

              {error && (
                <div className="rounded-xl border border-[#BE3942]/30 bg-[#FFEBEB] p-3 text-xs text-[#BE3942] mb-4">
                  {error}
                </div>
              )}

              {!analysisResult ? (
                <div className="rounded-2xl border border-dashed border-[#CFE1F1] bg-[#EFF7FF]/30 p-8 text-center text-xs text-[#4C637A]">
                  Upload a barrier photo and click <span className="font-bold">Run Multimodal AI Analysis</span> to generate structured evidence.
                </div>
              ) : (
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

                  <div>
                    <h4 className="text-xs font-bold text-[#071A2F] mb-1">Affected Mobility Profiles:</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.affectedProfiles.map((p) => (
                        <span key={p} className="rounded-lg bg-[#DCEEFF] px-2 py-0.5 text-[11px] font-bold text-[#0867E8]">
                          {p.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A2F] mb-1">Additional Notes (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add any extra detail about this obstacle..."
                      className="w-full rounded-xl border border-[#CFE1F1] p-2 text-xs text-[#071A2F]"
                      rows={2}
                    />
                  </div>

                  <div className="rounded-xl bg-[#FFF3DC] p-3 border border-[#A96500]/20 text-[11px] text-[#A96500] flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Explicit user confirmation is required before persisting community reports.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm & Submit Button */}
            {analysisResult && (
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#16835D] py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#126b4c] transition-colors disabled:opacity-50"
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
