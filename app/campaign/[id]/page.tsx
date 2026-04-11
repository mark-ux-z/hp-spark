"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, FileDown } from "lucide-react";
import TopBar from "@/components/TopBar";
import IdeaCard from "@/components/IdeaCard";
import ChatSidebar from "@/components/ChatSidebar";
import { supabase, Campaign, Idea } from "@/lib/supabase";

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchData = useCallback(async () => {
    const [{ data: campaignData }, { data: ideasData }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("id", id).single(),
      supabase
        .from("ideas")
        .select("*")
        .eq("campaign_id", id)
        .order("created_at", { ascending: true }),
    ]);
    setCampaign(campaignData);
    setIdeas(ideasData ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleIdeaUpdated(ideaId: string, updates: Partial<Idea>) {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, ...updates } : idea))
    );
    setSelectedIdea((prev) =>
      prev?.id === ideaId ? { ...prev, ...updates } : prev
    );
  }

  async function handleExportPdf() {
    if (!campaign) return;
    setExportingPdf(true);
    try {
      const res = await fetch(`/api/export-pdf?campaignId=${campaign.id}`);
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HP-Spark-${(campaign.brand_name ?? "campaign").replace(/\s+/g, "-")}-Brief.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingPdf(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] flex flex-col">
        <TopBar activeTab="campaign" onTabChange={() => {}} apiKeySet={false} onApiKeyClick={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#6B7280]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading campaign...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] flex flex-col">
        <TopBar activeTab="campaign" onTabChange={() => {}} apiKeySet={false} onApiKeyClick={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#6B7280]">Campaign not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F1F1] flex flex-col">
      <TopBar activeTab="campaign" onTabChange={() => {}} apiKeySet={false} onApiKeyClick={() => {}} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-[#6B7280]">
              <Link href="/" className="hover:text-[#0096D6] transition-colors">
                Dashboard
              </Link>
              <ChevronRight size={14} />
              <span className="text-[#212121] font-medium truncate">
                {campaign.brand_name}
              </span>
            </nav>

            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-[#212121]">
                  {campaign.brand_name}
                </h1>
                <p className="text-sm text-[#6B7280] mt-0.5">{campaign.brand_context}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    campaign.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[#F1F1F1] text-[#6B7280]"
                  }`}
                >
                  {campaign.status}
                </span>

                {/* Export PDF button */}
                {ideas.length > 0 && (
                  <button
                    onClick={handleExportPdf}
                    disabled={exportingPdf}
                    className="flex items-center gap-2 bg-[#0096D6] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0073A8] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {exportingPdf ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FileDown size={14} />
                        Export Campaign Brief
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Ideas grid */}
            {ideas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 px-6 py-12 text-center">
                <p className="text-sm text-[#6B7280]">
                  No ideas found for this campaign.
                </p>
              </div>
            ) : (
              <div
                className="grid gap-5"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
              >
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    brandName={campaign.brand_name ?? ""}
                    onSelectForChat={(idea) => setSelectedIdea(idea)}
                    onIdeaUpdated={handleIdeaUpdated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat sidebar */}
        {selectedIdea && (
          <ChatSidebar
            idea={selectedIdea}
            brandName={campaign.brand_name ?? ""}
            onClose={() => setSelectedIdea(null)}
            onIdeaUpdated={(updates) => handleIdeaUpdated(selectedIdea.id, updates)}
          />
        )}
      </div>
    </div>
  );
}
