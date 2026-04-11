"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import DropZone from "@/components/DropZone";
import CampaignCard from "@/components/CampaignCard";
import { supabase, Campaign } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [brandContext, setBrandContext] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      setCampaigns(data ?? []);
      setLoadingCampaigns(false);
    }
    fetchCampaigns();
  }, []);

  async function handleGenerate() {
    if (!brandName.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          brandContext: brandContext.trim() || `${brandName.trim()} FMCG brand`,
          filenames: files.map((f) => f.name),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/campaign/${data.campaignId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate ideas");
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F1F1]">
      <TopBar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Hero */}
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">HP Spark</h1>
          <p className="text-[#6B7280] mt-1 text-sm">
            AI-powered digital printing campaign ideation — powered by HP Indigo &amp; Claude
          </p>
        </div>

        {/* New Campaign card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={18} className="text-[#0096D6]" />
            <h2 className="text-base font-semibold text-[#212121]">New Campaign</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#212121] mb-1.5">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. NaturaBev"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#212121] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/10 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#212121] mb-1.5">
                  Brand Context
                  <span className="text-[#6B7280] font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  value={brandContext}
                  onChange={(e) => setBrandContext(e.target.value)}
                  placeholder="e.g. Premium organic beverages"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#212121] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/10 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#212121] mb-1.5">
                Brand Assets
                <span className="text-[#6B7280] font-normal ml-1">(optional)</span>
              </label>
              <DropZone files={files} onFilesChange={setFiles} />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={!brandName.trim() || generating}
              className="w-full bg-[#0096D6] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#0073A8] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Campaign Ideas...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Campaign Ideas
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div>
          <h2 className="text-sm font-semibold text-[#212121] mb-3">Recent Campaigns</h2>
          {loadingCampaigns ? (
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Loader2 size={14} className="animate-spin" />
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-[#6B7280] bg-white rounded-xl border border-gray-200 px-5 py-8 text-center">
              No campaigns yet. Generate your first one above.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
