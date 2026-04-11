"use client";

import { useState, useEffect, useRef } from "react";
import TopBar from "@/components/TopBar";
import ApiKeyModal from "@/components/ApiKeyModal";
import LoadingOverlay from "@/components/LoadingOverlay";
import ConceptCard from "@/components/ConceptCard";
import ConceptDetail from "@/components/ConceptDetail";
import PdfExportView from "@/components/PdfExportView";
import LibraryView from "@/components/LibraryView";
import type { Concept, AppView, NavTab } from "@/lib/types";

const BRAND_COLORS = ["#C8102E", "#7B3F00", "#D4A017", "#F5E3C8", "#002D72", "#2C5F2E", "#1A1A1A"];
const PRODUCT_TYPES = ["Chocolate Hazelnut Spread", "Biscuits / Cookies", "Snacks", "Beverages", "Chocolate", "Dairy"];
const SEASONS = ["Christmas / Winter", "Summer", "Easter / Spring", "Always-on"];
const AUDIENCES = ["Millennials 25–40", "Families with children", "Gen Z 18–25", "Premium / gifting"];
const DEFAULT_PERSONALITY =
  "The world's most recognisable hazelnut spread. Iconic red label on a cream jar. Nostalgic and universally loved. Ferrero has run famous personalised campaigns (city names, personal names on jars). Christmas is their biggest season.";

function pollinationsUrl(prompt: string, seed: number) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt + ", white background, isolated, product photography, no text"
  )}?width=512&height=768&seed=${seed}&nologo=true&model=flux`;
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 14,
  color: "var(--text)",
  background: "white",
  outline: "none",
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C6B82' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 36,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text)",
  display: "block",
  marginBottom: 6,
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function Home() {
  const [navTab, setNavTab] = useState<NavTab>("campaign");
  const [view, setView] = useState<AppView>("form");

  // Form
  const [brandName, setBrandName] = useState("Nutella");
  const [productType, setProductType] = useState(PRODUCT_TYPES[0]);
  const [campaignSeason, setCampaignSeason] = useState(SEASONS[0]);
  const [targetAudience, setTargetAudience] = useState(AUDIENCES[0]);
  const [brandPersonality, setBrandPersonality] = useState(DEFAULT_PERSONALITY);
  const [selectedColor, setSelectedColor] = useState(BRAND_COLORS[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    setApiKeySet(!!localStorage.getItem("hpcs_k"));
  }, []);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  }

  async function handleGenerate() {
    const key = localStorage.getItem("hpcs_k");
    if (!key) { setShowApiKeyModal(true); return; }

    setLoading(true);
    setLoadingStep(1);
    try {
      await sleep(700);
      setLoadingStep(2);

      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, productType, campaignSeason, targetAudience, brandPersonality, selectedColor, apiKey: key }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLoadingStep(3);
      await sleep(500);

      const seeds = [10000, 13333, 16666];
      const conceptsWithImages: Concept[] = (data.concepts as Concept[]).map((c, i) => ({
        ...c,
        imageUrl: pollinationsUrl(c.imagePrompt, seeds[i]),
      }));

      setConcepts(conceptsWithImages);
      setView("results");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar
        activeTab={navTab}
        onTabChange={(tab) => { setNavTab(tab); if (tab === "campaign") setView("form"); }}
        apiKeySet={apiKeySet}
        onApiKeyClick={() => setShowApiKeyModal(true)}
      />

      {loading && <LoadingOverlay brandName={brandName} step={loadingStep} />}
      {showApiKeyModal && <ApiKeyModal onClose={() => setShowApiKeyModal(false)} onSaved={() => setApiKeySet(true)} />}

      {/* LIBRARY */}
      {navTab === "library" && <LibraryView />}

      {/* CAMPAIGN */}
      {navTab === "campaign" && (
        <>
          {/* ── FORM ── */}
          {view === "form" && (
            <>
              {/* Hero */}
              <div style={{ background: "linear-gradient(135deg, #002D72, #005B99, #0096D6)", padding: "60px 40px 80px" }}>
                <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 12 }}>
                  HP CAMPAIGN STUDIO
                </p>
                <h1 className="font-serif" style={{ fontSize: 44, color: "white", lineHeight: 1.15, marginBottom: 16, maxWidth: 620 }}>
                  Your brand. A campaign like Ferrero&apos;s.
                </h1>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", maxWidth: 560 }}>
                  Tell us about your brand and we&apos;ll generate digital packaging campaign ideas — with cost estimates — in under 2 minutes.
                </p>
              </div>

              {/* Form card */}
              <div style={{ maxWidth: 860, margin: "-40px auto 60px", padding: "0 40px" }}>
                <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 32, boxShadow: "0 8px 32px rgba(0,45,114,0.1)" }}>

                  {/* 2-col grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={labelStyle}>Brand name <span style={{ color: "#e53e3e" }}>*</span></label>
                      <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Nutella"
                        style={{ ...selectStyle, backgroundImage: "none", paddingRight: 12 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Product type</label>
                      <select value={productType} onChange={(e) => setProductType(e.target.value)} style={selectStyle}>
                        {PRODUCT_TYPES.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Campaign season</label>
                      <select value={campaignSeason} onChange={(e) => setCampaignSeason(e.target.value)} style={selectStyle}>
                        {SEASONS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Target audience</label>
                      <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} style={selectStyle}>
                        {AUDIENCES.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Brand personality */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Brand personality</label>
                    <textarea value={brandPersonality} onChange={(e) => setBrandPersonality(e.target.value)} rows={3}
                      style={{ ...selectStyle, backgroundImage: "none", paddingRight: 12, resize: "vertical", lineHeight: 1.6 }} />
                  </div>

                  {/* Colour swatches */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Brand colour</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {BRAND_COLORS.map((color) => {
                        const active = selectedColor === color;
                        return (
                          <button key={color} onClick={() => setSelectedColor(color)}
                            style={{
                              width: 36, height: 36, borderRadius: 8, background: color, cursor: "pointer",
                              border: active ? "3px solid var(--hp-blue)" : "3px solid transparent",
                              outline: active ? "2px solid white" : "none", outlineOffset: -1,
                              transform: active ? "scale(1.15)" : "scale(1)",
                              boxShadow: active ? "0 0 0 1px var(--hp-blue)" : "none",
                              transition: "all 0.15s",
                            }} />
                        );
                      })}
                    </div>
                  </div>

                  {/* Drop zone */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Brand assets <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: `2px dashed ${dragging ? "var(--hp-blue)" : "var(--border)"}`,
                        borderRadius: 10, padding: "20px 16px", textAlign: "center", cursor: "pointer",
                        background: dragging ? "var(--light)" : "#fafbfc", transition: "all 0.15s",
                      }}
                    >
                      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}>
                        Drop a Nutella jar photo or PDF — the AI will use your actual packaging as reference
                      </p>
                      <p style={{ fontSize: 12, color: "var(--muted)" }}>PDF, PNG, JPG supported</p>
                      <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg"
                        style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
                    </div>
                    {files.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                        {files.map((f, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: "var(--light)", border: "1px solid rgba(0,150,214,0.2)",
                            borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "var(--hp-blue)",
                          }}>
                            📄 {f.name}
                            <button onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, j) => j !== i)); }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Generate */}
                  <button onClick={handleGenerate} disabled={!brandName.trim()}
                    style={{
                      width: "100%", padding: "14px 0", border: "none", borderRadius: 10,
                      background: brandName.trim() ? "var(--hp-blue)" : "var(--border)",
                      color: "white", fontSize: 15, fontWeight: 600,
                      cursor: brandName.trim() ? "pointer" : "not-allowed", transition: "background 0.15s",
                    }}>
                    ✦ Generate campaign ideas
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── RESULTS ── */}
          {view === "results" && (
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                  <h2 className="font-serif" style={{ fontSize: 32, color: "var(--text)", margin: 0 }}>
                    Campaign ideas for {brandName}
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
                    3 AI-generated concepts · {campaignSeason}
                  </p>
                </div>
                <button onClick={() => setView("form")}
                  style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "white", color: "var(--muted)", fontSize: 14, cursor: "pointer" }}>
                  ← Edit brief
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {concepts.map((concept, i) => (
                  <ConceptCard key={concept.name} concept={concept} index={i} season={campaignSeason}
                    onClick={() => { setSelectedConcept(concept); setView("detail"); }} />
                ))}
              </div>
            </div>
          )}

          {/* ── DETAIL ── */}
          {view === "detail" && (
            <ConceptDetail concept={selectedConcept} onBack={() => setView("results")} onExport={() => setView("pdf")} />
          )}

          {/* ── PDF EXPORT ── */}
          {view === "pdf" && selectedConcept && (
            <PdfExportView concept={selectedConcept} brandName={brandName} season={campaignSeason} onBack={() => setView("detail")} />
          )}
        </>
      )}
    </>
  );
}
