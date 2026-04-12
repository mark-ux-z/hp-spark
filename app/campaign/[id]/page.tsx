"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import TopBar from "@/components/TopBar";
import IdeaCard, { PackagingSpec } from "@/components/IdeaCard";
import ChatSidebar from "@/components/ChatSidebar";
import SpecPanel from "@/components/SpecPanel";
import { supabase, Campaign, Idea, saveIdeaSpecs, getSettings, saveSettings, CampaignBudget } from "@/lib/supabase";
import { getPartnersForCountries } from "@/lib/partners";
import {
  CampaignStatus,
  CAMPAIGN_STATUS_CONFIG,
  CAMPAIGN_STATUS_ORDER,
  ProductionSpec,
  DEFAULT_PRODUCTION_SPEC,
} from "@/lib/types";

const COMPARISON_ROWS = [
  { label: "Lead time",        traditional: "6–8 weeks",     digital: "1–2 weeks" },
  { label: "Min. order",       traditional: "10,000 units",  digital: "500 units" },
  { label: "Design variants",  traditional: "1 design",      digital: "Unlimited" },
  { label: "Estimated cost",   traditional: "€8,000+",       digital: "€1,800 – €3,200" },
];

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [maybeModal, setMaybeModal] = useState(false);
  const [maybeResolutions, setMaybeResolutions] = useState<Record<string, "approved" | "rejected">>({});
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [packagingSpecs, setPackagingSpecs] = useState<Record<string, PackagingSpec>>({});
  const [productionSpecs, setProductionSpecs] = useState<Record<string, ProductionSpec>>({});
  const [selectedSpecIdea, setSelectedSpecIdea] = useState<Idea | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>("ideation");
  const [campaignCountries, setCampaignCountries] = useState<string[]>([]);
  const [campaignBudget, setCampaignBudget] = useState<CampaignBudget | null>(null);

  const fetchData = useCallback(async () => {
    const [{ data: campaignData }, { data: ideasData }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("id", id).single(),
      supabase.from("ideas").select("*").eq("campaign_id", id).order("created_at", { ascending: true }),
    ]);
    setCampaign(campaignData);
    const loadedIdeas = ideasData ?? [];
    setIdeas(loadedIdeas);

    // Extract _pkg/_prod specs stored in mockup_style JSONB
    const dbPkg: Record<string, PackagingSpec> = {};
    const dbProd: Record<string, ProductionSpec> = {};
    for (const idea of loadedIdeas) {
      if (idea.mockup_style?._pkg) dbPkg[idea.id] = idea.mockup_style._pkg as PackagingSpec;
      if (idea.mockup_style?._prod) dbProd[idea.id] = idea.mockup_style._prod as ProductionSpec;
    }
    // Merge: DB values as base, localStorage overrides (handles offline edits)
    const localPkg: Record<string, PackagingSpec> = JSON.parse(localStorage.getItem(`packaging_${id}`) ?? "{}");
    const localProd: Record<string, ProductionSpec> = JSON.parse(localStorage.getItem(`production_${id}`) ?? "{}");
    setPackagingSpecs({ ...dbPkg, ...localPkg });
    setProductionSpecs({ ...dbProd, ...localProd });

    // Load campaign status + countries from Supabase settings with localStorage fallback
    const settings = await getSettings();
    const statusFromDB = settings.campaignStatuses?.[id] as CampaignStatus | undefined;
    const statusFromLocal = (JSON.parse(localStorage.getItem("campaign_statuses") ?? "{}") as Record<string, CampaignStatus>)[id];
    setCampaignStatus(statusFromDB ?? statusFromLocal ?? "ideation");
    setCampaignCountries(settings.campaignCountries?.[id] ?? []);
    setCampaignBudget(settings.campaignBudgets?.[id] ?? null);

    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handlePackagingChange(ideaId: string, spec: PackagingSpec | null) {
    setPackagingSpecs((prev) => {
      const next = { ...prev };
      if (spec) next[ideaId] = spec; else delete next[ideaId];
      localStorage.setItem(`packaging_${id}`, JSON.stringify(next));
      // Persist to Supabase (fire and forget)
      saveIdeaSpecs(ideaId, spec ?? null, productionSpecs[ideaId] ?? null).catch(console.error);
      return next;
    });
  }

  function handleProductionChange(ideaId: string, spec: ProductionSpec) {
    setProductionSpecs((prev) => {
      const next = { ...prev, [ideaId]: spec };
      localStorage.setItem(`production_${id}`, JSON.stringify(next));
      // Persist to Supabase (fire and forget)
      saveIdeaSpecs(ideaId, packagingSpecs[ideaId] ?? null, spec).catch(console.error);
      return next;
    });
  }

  async function handleStatusChange(status: CampaignStatus) {
    setCampaignStatus(status);
    // Keep localStorage in sync
    const statuses = JSON.parse(localStorage.getItem("campaign_statuses") ?? "{}");
    statuses[id] = status;
    localStorage.setItem("campaign_statuses", JSON.stringify(statuses));
    // Persist to Supabase settings
    try {
      const settings = await getSettings();
      const updated = { ...(settings.campaignStatuses ?? {}), [id]: status };
      await saveSettings({ campaignStatuses: updated });
    } catch (e) {
      console.error("Failed to save campaign status:", e);
    }
  }

  function handleIdeaUpdated(ideaId: string, updates: Partial<Idea>) {
    setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, ...updates } : idea)));
    setSelectedIdea((prev) => (prev?.id === ideaId ? { ...prev, ...updates } : prev));
  }

  function startExport() {
    const maybes = ideas.filter((i) => i.idea_status === "maybe");
    if (maybes.length > 0) {
      // Pre-populate resolutions as empty so user must decide each one
      const init: Record<string, "approved" | "rejected"> = {};
      maybes.forEach((i) => { if (maybeResolutions[i.id]) init[i.id] = maybeResolutions[i.id]; });
      setMaybeResolutions(init);
      setMaybeModal(true);
    } else {
      runExport(ideas);
    }
  }

  async function confirmMaybesAndExport() {
    const maybes = ideas.filter((i) => i.idea_status === "maybe");
    // All maybes must be resolved
    if (maybes.some((i) => !maybeResolutions[i.id])) return;

    // Update Supabase for each resolved maybe
    const { updateIdea } = await import("@/lib/supabase");
    await Promise.all(
      maybes.map((i) => updateIdea(i.id, { idea_status: maybeResolutions[i.id] }))
    );

    // Update local state
    const resolved = ideas.map((i) =>
      maybeResolutions[i.id] ? { ...i, idea_status: maybeResolutions[i.id] as "approved" | "rejected" } : i
    );
    setIdeas(resolved);
    setMaybeModal(false);
    runExport(resolved);
  }

  async function runExport(currentIdeas: typeof ideas) {
    if (!campaign) return;
    const approved = currentIdeas.filter((i) => i.idea_status === "approved");
    if (approved.length === 0) {
      setPdfError("No approved ideas to export. Approve at least one idea or refine with Chat.");
      setTimeout(() => setPdfError(null), 5000);
      return;
    }
    setExportingPdf(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id, packagingSpecs, productionSpecs, budget: campaignBudget }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HP-Campaign-${(campaign.brand_name ?? "campaign").replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingPdf(false);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ height: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <TopBar activeTab="campaign" onTabChange={(tab) => router.push(`/?tab=${tab}`)} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite", color: "var(--muted)" }} />
          <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading campaign…</span>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ height: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <TopBar activeTab="campaign" onTabChange={(tab) => router.push(`/?tab=${tab}`)} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Campaign not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar activeTab="campaign" onTabChange={(tab) => router.push(`/?tab=${tab}`)} />

      {/* HP Gradient Hero Header */}
      <div style={{ background: "linear-gradient(135deg, #002D72 0%, #005B99 55%, #0096D6 100%)", padding: "20px 40px 24px", flexShrink: 0 }}>
        {/* Breadcrumb */}
        <button
          onClick={() => router.push("/?tab=library")}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 10, padding: 0,
          }}
        >
          <ChevronLeft size={13} />
          Library
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
              <h1 className="font-serif" style={{ fontSize: 26, color: "white", lineHeight: 1.2, margin: 0 }}>
                {campaign.brand_name}
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                {ideas.length} concept{ideas.length !== 1 ? "s" : ""} · HP Indigo
              </p>
            </div>

            {/* Campaign status stepper */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {CAMPAIGN_STATUS_ORDER.map((s, i) => {
                const cfg = CAMPAIGN_STATUS_CONFIG[s];
                const isActive = s === campaignStatus;
                const isPast = CAMPAIGN_STATUS_ORDER.indexOf(s) < CAMPAIGN_STATUS_ORDER.indexOf(campaignStatus);
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center" }}>
                    <button
                      onClick={() => handleStatusChange(s)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 12px", borderRadius: 20,
                        border: "none", cursor: "pointer", transition: "all 0.15s",
                        background: isActive ? "white" : "rgba(255,255,255,0.15)",
                        color: isActive ? cfg.color : isPast ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                        fontSize: 11, fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        background: isActive ? cfg.color : isPast ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
                      }} />
                      {cfg.label}
                    </button>
                    {i < CAMPAIGN_STATUS_ORDER.length - 1 && (
                      <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.25)", margin: "0 2px" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {ideas.length > 0 && (
              <button
                onClick={startExport}
                disabled={exportingPdf}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "white", color: "var(--hp-dark)",
                  border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  padding: "9px 18px", cursor: "pointer",
                  opacity: exportingPdf ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {exportingPdf ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <FileDown size={13} />}
                {exportingPdf ? "Generating…" : "Export PDF"}
              </button>
            )}
            {pdfError && (
              <p style={{ fontSize: 12, color: "#fca5a5", margin: 0, maxWidth: 260, textAlign: "right" }}>
                {pdfError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main flex layout — flex:1 + minHeight:0 fills remaining viewport correctly */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>

          {/* Ideas grid */}
          {ideas.length === 0 ? (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>No ideas found for this campaign.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: selectedIdea ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 48,
            }}>
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  brandName={campaign.brand_name ?? ""}
                  isActive={selectedIdea?.id === idea.id}
                  isSpecActive={selectedSpecIdea?.id === idea.id}
                  packagingSpec={packagingSpecs[idea.id] ?? null}
                  onPackagingChange={handlePackagingChange}
                  onSelectForChat={(i) => {
                    setSelectedSpecIdea(null);
                    setSelectedIdea(selectedIdea?.id === i.id ? null : i);
                  }}
                  onSelectForSpec={(i) => {
                    setSelectedIdea(null);
                    setSelectedSpecIdea(selectedSpecIdea?.id === i.id ? null : i);
                  }}
                  onIdeaUpdated={handleIdeaUpdated}
                />
              ))}
            </div>
          )}

          {/* ── Budget overview ── */}
          {campaignBudget && (campaignBudget.budgetMin || campaignBudget.budgetMax || campaignBudget.runSize) && (() => {
            const { budgetMin, budgetMax, runSize } = campaignBudget;
            const bMin = parseFloat(budgetMin);
            const bMax = parseFloat(budgetMax);
            const run  = parseFloat(runSize);
            const cpuLo = (!isNaN(bMin) && !isNaN(run) && run > 0) ? (bMin / run) : null;
            const cpuHi = (!isNaN(bMax) && !isNaN(run) && run > 0) ? (bMax / run) : null;
            const budgetLabel = (budgetMin && budgetMax)
              ? `€${Number(bMin).toLocaleString("en-GB")} – €${Number(bMax).toLocaleString("en-GB")}`
              : budgetMin ? `From €${Number(bMin).toLocaleString("en-GB")}`
              : budgetMax ? `Up to €${Number(bMax).toLocaleString("en-GB")}`
              : "—";
            const cpuLabel = (cpuLo !== null && cpuHi !== null)
              ? `€${cpuLo.toFixed(3)} – €${cpuHi.toFixed(3)}`
              : cpuLo !== null ? `€${cpuLo.toFixed(3)}`
              : cpuHi !== null ? `€${cpuHi.toFixed(3)}`
              : "—";
            return (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14, textTransform: "uppercase" }}>
                  Production Budget Overview
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "Total budget", value: budgetLabel, accent: false },
                    { label: "Expected run size", value: runSize ? `${Number(run).toLocaleString("en-GB")} units` : "—", accent: false },
                    { label: "Est. cost per unit", value: cpuLabel !== "—" ? cpuLabel : "—", accent: cpuLabel !== "—" },
                  ].map((stat) => (
                    <div key={stat.label} style={{
                      background: "white", borderRadius: 10, border: `1px solid var(--border)`,
                      padding: "16px 20px",
                    }}>
                      <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {stat.label}
                      </p>
                      <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: stat.accent ? "var(--hp-blue)" : "var(--text)" }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── HP Digital vs Traditional comparison ── */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14, textTransform: "uppercase" }}>
              HP Digital vs Traditional Printing
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px 16px", background: "#f9fafb", border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 500, width: "30%" }}>
                    &nbsp;
                  </th>
                  <th style={{ textAlign: "left", padding: "12px 16px", background: "#f9fafb", border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 500 }}>
                    Traditional offset
                  </th>
                  <th style={{ textAlign: "left", padding: "12px 16px", background: "var(--light)", border: "1px solid var(--border)", color: "var(--hp-blue)", fontWeight: 700 }}>
                    HP Digital{" "}
                    <span style={{ background: "var(--hp-blue)", color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 700, marginLeft: 4 }}>
                      HP
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td style={{ padding: "12px 16px", border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: "12px 16px", border: "1px solid var(--border)", color: "var(--text)" }}>{row.traditional}</td>
                    <td style={{ padding: "12px 16px", border: "1px solid var(--border)", color: "var(--success)", fontWeight: 700, background: "#fafffc" }}>{row.digital}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── HP Certified Print Partners ── */}
          {(() => {
            const partners = getPartnersForCountries(campaignCountries);
            const countryLabel = campaignCountries.length === 0
              ? null
              : campaignCountries.length <= 3
              ? campaignCountries.join(" & ")
              : `${campaignCountries.slice(0, 2).join(", ")} +${campaignCountries.length - 2} more`;
            return (
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14, textTransform: "uppercase" }}>
                  HP Certified Print Partners{countryLabel ? ` — ${countryLabel}` : ""}
                </p>
                {partners.length > 0 ? (
                  <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
                    {partners.map((p, i) => (
                      <div
                        key={`${p.name}-${i}`}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "14px 20px",
                          borderBottom: i < partners.length - 1 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", margin: 0 }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{p.city}, {p.code}</p>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          style={{ fontSize: 13, color: "var(--hp-blue)", textDecoration: "none", fontWeight: 500 }}
                        >
                          Contact →
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    background: "white", borderRadius: 12, border: "1px solid var(--border)",
                    padding: "28px 24px", textAlign: "center",
                  }}>
                    <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 500, margin: "0 0 4px" }}>
                      No countries set for this campaign
                    </p>
                    <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px" }}>
                      Add countries of operation when creating a campaign to see matched HP Indigo print partners.
                    </p>
                    <a
                      href="https://www.hp.com/us-en/printers/indigo-presses/find-a-printer.html"
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 13, color: "var(--hp-blue)", fontWeight: 500, textDecoration: "none" }}
                    >
                      Find an HP partner globally →
                    </a>
                  </div>
                )}
              </div>
            );
          })()}

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

        {/* Spec & Production panel */}
        {selectedSpecIdea && (
          <SpecPanel
            idea={selectedSpecIdea}
            packagingSpec={packagingSpecs[selectedSpecIdea.id] ?? null}
            productionSpec={productionSpecs[selectedSpecIdea.id] ?? DEFAULT_PRODUCTION_SPEC}
            onPackagingChange={handlePackagingChange}
            onProductionChange={handleProductionChange}
            onClose={() => setSelectedSpecIdea(null)}
          />
        )}
      </div>

      {/* Maybe resolver modal */}
      {maybeModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div style={{
            background: "white", borderRadius: 16, padding: 32,
            maxWidth: 520, width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
              Before exporting
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
              You have ideas marked as <strong>Maybe</strong>. Decide whether to include or exclude each one from the PDF.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {ideas.filter((i) => i.idea_status === "maybe").map((idea) => (
                <div key={idea.id} style={{
                  border: "1.5px solid var(--border)", borderRadius: 10, padding: "14px 16px",
                  background: "var(--bg)",
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 10px" }}>
                    {idea.title}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setMaybeResolutions((p) => ({ ...p, [idea.id]: "approved" }))}
                      style={{
                        flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: maybeResolutions[idea.id] === "approved" ? "#16a34a" : "var(--border)",
                        background: maybeResolutions[idea.id] === "approved" ? "#f0fdf4" : "white",
                        color: maybeResolutions[idea.id] === "approved" ? "#16a34a" : "var(--muted)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      ✓ Include
                    </button>
                    <button
                      onClick={() => setMaybeResolutions((p) => ({ ...p, [idea.id]: "rejected" }))}
                      style={{
                        flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: maybeResolutions[idea.id] === "rejected" ? "#dc2626" : "var(--border)",
                        background: maybeResolutions[idea.id] === "rejected" ? "#fef2f2" : "white",
                        color: maybeResolutions[idea.id] === "rejected" ? "#dc2626" : "var(--muted)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      ✕ Exclude
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setMaybeModal(false)}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  border: "1.5px solid var(--border)", background: "white", color: "var(--muted)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmMaybesAndExport}
                disabled={ideas.filter((i) => i.idea_status === "maybe").some((i) => !maybeResolutions[i.id])}
                style={{
                  flex: 2, padding: "11px 0", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: ideas.filter((i) => i.idea_status === "maybe").every((i) => maybeResolutions[i.id])
                    ? "var(--hp-blue)" : "var(--border)",
                  color: "white",
                }}
              >
                Confirm &amp; Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
