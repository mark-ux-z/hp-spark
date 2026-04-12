"use client";

import { useState } from "react";
import { Zap, Maximize2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import Lightbox from "./Lightbox";
import type { MockupStyle } from "@/lib/supabase";

type MockupStep = "building" | "calling" | "saving";

const stepLabels: Record<MockupStep, string> = {
  building: "Building prompt...",
  calling: "Calling Nano Banana 2...",
  saving: "Saving to database...",
};

const STYLE_OPTIONS: Record<keyof MockupStyle, string[]> = {
  shot:   ["Studio", "Lifestyle", "Flat lay"],
  mood:   ["Clean & Bright", "Soft & Natural", "Bold & Dramatic"],
  finish: ["Glossy", "Matte", "Metallic"],
};

const STYLE_LABELS: Record<keyof MockupStyle, string> = {
  shot:   "Shot",
  mood:   "Mood",
  finish: "Finish",
};

const DEFAULT_STYLE: MockupStyle = {
  shot:   "Studio",
  mood:   "Clean & Bright",
  finish: "Glossy",
};

interface MockupAreaProps {
  ideaId: string;
  brandName: string;
  ideaTitle: string;
  ideaDescription: string;
  strategyType: string;
  mockupUrl: string | null;
  savedStyle?: MockupStyle | null;
  onMockupGenerated: (url: string, style: MockupStyle) => void;
}

export default function MockupArea({
  ideaId,
  brandName,
  ideaTitle,
  ideaDescription,
  strategyType,
  mockupUrl,
  savedStyle,
  onMockupGenerated,
}: MockupAreaProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<MockupStep>("building");
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [style, setStyle] = useState<MockupStyle>(savedStyle ?? DEFAULT_STYLE);

  function toggleOption(key: keyof MockupStyle, value: string) {
    setStyle((prev) => ({ ...prev, [key]: value }));
  }

  async function generateMockup() {
    setLoading(true);
    setError(null);
    setStep("building");

    try {
      await delay(400);
      setStep("calling");

      const res = await fetch("/api/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          brandName,
          ideaTitle,
          ideaDescription,
          strategyType,
          mockupStyle: style,
        }),
      });

      setStep("saving");
      await delay(300);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onMockupGenerated(data.mockupUrl, style);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate mockup";
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#F1F1F1] rounded-xl flex flex-col items-center justify-center gap-3 py-10">
        <div className="w-8 h-8 border-2 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#0096D6] font-medium animate-pulse">{stepLabels[step]}</p>
        <div className="w-48 h-1.5 bg-[#E6F4FA] rounded-full overflow-hidden">
          <div className="h-full bg-[#0096D6] rounded-full animate-progress" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
        <AlertTriangle size={20} className="text-red-500" />
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (mockupUrl) {
    if (collapsed) {
      return (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[#F1F1F1] rounded-xl border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mockupUrl} alt={ideaTitle} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          <span className="text-xs text-[#6B7280] truncate flex-1">Mockup generated</span>
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1 text-xs text-[#0096D6] font-medium shrink-0 hover:underline"
          >
            <ChevronDown size={13} /> Show
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Image */}
        <div className="relative rounded-t-xl overflow-hidden h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mockupUrl} alt={ideaTitle} className="w-full h-full object-cover" />
        </div>

        {/* Controls bar — always visible below the image, never overlapping */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#F8F9FB] border-b border-gray-200">
          <button
            onClick={() => setLightboxOpen(true)}
            className="flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-[#212121] transition-colors"
          >
            <Maximize2 size={11} /> View full size
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#0096D6] hover:text-[#0073A8] transition-colors"
          >
            <ChevronUp size={11} /> Minimise
          </button>
        </div>

        {lightboxOpen && (
          <Lightbox src={mockupUrl} title={ideaTitle} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    );
  }

  // Empty state — show style survey + generate button
  return (
    <div className="bg-[#F1F1F1] rounded-xl border-2 border-dashed border-gray-300 px-4 pt-4 pb-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-center gap-1.5">
        <Zap size={14} className="text-[#0096D6]" />
        <span className="text-xs font-semibold text-[#0073A8]">Nano Banana 2</span>
      </div>

      {/* Style survey */}
      <div className="space-y-2">
        {(Object.keys(STYLE_OPTIONS) as (keyof MockupStyle)[]).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide w-10 shrink-0">
              {STYLE_LABELS[key]}
            </span>
            <div className="flex gap-1 flex-wrap">
              {STYLE_OPTIONS[key].map((opt) => {
                const active = style[key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => toggleOption(key, opt)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      active
                        ? "bg-[#0096D6] text-white border-[#0096D6]"
                        : "bg-white text-[#6B7280] border-gray-300 hover:border-[#0096D6] hover:text-[#0096D6]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={generateMockup}
        className="w-full bg-[#0096D6] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#0073A8] transition-colors"
      >
        Generate Mockup
      </button>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
