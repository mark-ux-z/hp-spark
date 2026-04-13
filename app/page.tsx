"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import LoginPage from "@/components/LoginPage";
import LoadingOverlay from "@/components/LoadingOverlay";
import LibraryView from "@/components/LibraryView";
import { getSettings, saveSettings } from "@/lib/supabase";
import { EUROPEAN_COUNTRIES } from "@/lib/partners";
import type { NavTab } from "@/lib/types";

function formatEuro(val: string): string {
  const n = parseFloat(val);
  if (!val || isNaN(n)) return "";
  return `€${n.toLocaleString("en-GB")}`;
}

function calcCostPerUnit(min: string, max: string, run: string): string | null {
  const bMin = parseFloat(min);
  const bMax = parseFloat(max);
  const r    = parseFloat(run);
  if (!r || r <= 0 || (isNaN(bMin) && isNaN(bMax))) return null;
  const lo = !isNaN(bMin) ? bMin / r : null;
  const hi = !isNaN(bMax) ? bMax / r : null;
  if (lo !== null && hi !== null) return `€${lo.toFixed(3)} – €${hi.toFixed(3)} per unit`;
  if (lo !== null) return `€${lo.toFixed(3)} per unit`;
  if (hi !== null) return `€${hi.toFixed(3)} per unit`;
  return null;
}

const SEASONS = ["Christmas / Winter", "Summer", "Easter / Spring", "Always-on"];
const AUDIENCES = ["Millennials 25–40", "Families with children", "Gen Z 18–25", "Premium / gifting"];

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

export default function Home() {
  return <Suspense><HomeInner /></Suspense>;
}

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navTab, setNavTab] = useState<NavTab>("campaign");
  const [loggedIn, setLoggedIn] = useState(false);

  // Persist login state across navigation
  useEffect(() => {
    if (localStorage.getItem("hp_logged_in") === "1") setLoggedIn(true);
  }, []);

  // Restore tab from URL param (e.g. ?tab=library when navigating back from campaign)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "library" || tab === "campaign") setNavTab(tab);
  }, [searchParams]);

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [productType, setProductType] = useState("");
  const [campaignSeason, setCampaignSeason] = useState(SEASONS[0]);
  const [targetAudience, setTargetAudience] = useState(AUDIENCES[0]);
  const [brandPersonality, setBrandPersonality] = useState("");
  const [brandColors, setBrandColors] = useState<string[]>(["#0096D6"]);
  const [pickerValue, setPickerValue] = useState("#0096D6");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [runSize, setRunSize] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleCountry(country: string) {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  }

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  }

  async function handleGenerate() {
    if (!brandName.trim() || !productType.trim()) return;
    setLoading(true);
    setLoadingStep(1);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setLoadingStep(2);

      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          productType,
          campaignSeason,
          targetAudience,
          brandPersonality,
          brandColors,
          filenames: files.map((f) => f.name),
        }),
      });

      let data: { campaignId?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned an invalid response — please try again.");
      }
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setLoadingStep(3);
      await new Promise((r) => setTimeout(r, 400));

      // Save campaign name, countries, and budget to localStorage + Supabase settings
      {
        const names = JSON.parse(localStorage.getItem("campaign_names") ?? "{}");
        if (campaignName.trim()) names[data.campaignId!] = campaignName.trim();
        localStorage.setItem("campaign_names", JSON.stringify(names));
        // Persist to Supabase (fire and forget)
        getSettings().then((settings) => {
          const hasBudget = budgetMin || budgetMax || runSize;
          return saveSettings({
            ...(campaignName.trim() ? { campaignNames: { ...(settings.campaignNames ?? {}), [data.campaignId!]: campaignName.trim() } } : {}),
            ...(selectedCountries.length > 0 ? { campaignCountries: { ...(settings.campaignCountries ?? {}), [data.campaignId!]: selectedCountries } } : {}),
            ...(hasBudget ? { campaignBudgets: { ...(settings.campaignBudgets ?? {}), [data.campaignId!]: { budgetMin, budgetMax, runSize } } } : {}),
          });
        }).catch(console.error);
      }

      router.push(`/campaign/${data.campaignId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generation failed");
      setLoading(false);
    }
  }

  if (!loggedIn) {
    return <LoginPage onLogin={() => { localStorage.setItem("hp_logged_in", "1"); setLoggedIn(true); }} />;
  }

  return (
    <>
      <TopBar
        activeTab={navTab}
        onTabChange={(tab) => setNavTab(tab)}
      />

      {loading && <LoadingOverlay brandName={brandName} step={loadingStep} />}

      {/* LIBRARY */}
      {navTab === "library" && <LibraryView onNewCampaign={() => setNavTab("campaign")} />}

      {/* CAMPAIGN FORM */}
      {navTab === "campaign" && (
        <>
          {/* Hero */}
          <div style={{ background: "linear-gradient(135deg, #002D72, #005B99, #0096D6)", padding: "60px 40px 80px" }}>
            <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 12 }}>
              HP CAMPAIGN STUDIO
            </p>
            <h1 className="font-serif" style={{ fontSize: 44, color: "white", lineHeight: 1.15, marginBottom: 16, maxWidth: 620 }}>
              Your brand. An HP Indigo campaign.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", maxWidth: 560 }}>
              Tell us about your brand and we&apos;ll generate digital packaging campaign ideas — with cost estimates — in under 2 minutes.
            </p>
          </div>

          {/* Form card */}
          <div style={{ maxWidth: 860, margin: "-40px auto 60px", padding: "0 40px" }}>
            <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 32, boxShadow: "0 8px 32px rgba(0,45,114,0.1)" }}>

              {/* Campaign name — full width */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Campaign name</label>
                <input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Christmas Collection 2025, Summer Festival Edition…"
                  style={{ ...selectStyle, backgroundImage: "none", paddingRight: 12 }}
                />
              </div>

              {/* 2-col grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Brand name <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Cadbury, Heinz, Oatly…"
                    style={{ ...selectStyle, backgroundImage: "none", paddingRight: 12 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Product type <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="e.g. Chocolate bar, Hot sauce, Oat milk…"
                    style={{ ...selectStyle, backgroundImage: "none", paddingRight: 12 }}
                  />
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
                <textarea
                  value={brandPersonality}
                  onChange={(e) => setBrandPersonality(e.target.value)}
                  rows={3}
                  placeholder="Describe your brand's tone, values, and what makes it unique — e.g. playful and bold, heritage British brand, known for vibrant limited editions…"
                  style={{ ...selectStyle, backgroundImage: "none", paddingRight: 12, resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              {/* Country of operation — multi-select dropdown */}
              <div style={{ marginBottom: 20 }} ref={countryDropdownRef}>
                <label style={labelStyle}>
                  Countries of operation
                  <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: 6 }}>optional — used to match print partners</span>
                </label>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen((o) => !o)}
                    style={{
                      ...selectStyle,
                      textAlign: "left",
                      cursor: "pointer",
                      color: selectedCountries.length > 0 ? "var(--text)" : "var(--muted)",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, paddingRight: 8 }}>
                      {selectedCountries.length === 0
                        ? "Select countries…"
                        : selectedCountries.length === 1
                        ? selectedCountries[0]
                        : `${selectedCountries[0]} +${selectedCountries.length - 1} more`}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5C6B82" strokeWidth="2">
                      <polyline points={countryDropdownOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                    </svg>
                  </button>

                  {countryDropdownOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                      background: "white", border: "1px solid var(--border)", borderRadius: 8,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      zIndex: 50, maxHeight: 280, overflowY: "auto",
                    }}>
                      {EUROPEAN_COUNTRIES.map((country) => {
                        const checked = selectedCountries.includes(country);
                        return (
                          <label
                            key={country}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "9px 14px", cursor: "pointer",
                              background: checked ? "var(--light)" : "white",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => { if (!checked) (e.currentTarget as HTMLLabelElement).style.background = "#f9fafb"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.background = checked ? "var(--light)" : "white"; }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCountry(country)}
                              style={{ accentColor: "var(--hp-blue)", width: 14, height: 14, cursor: "pointer", flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 14, color: "var(--text)" }}>{country}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected country chips */}
                {selectedCountries.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {selectedCountries.map((country) => (
                      <span
                        key={country}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "var(--light)", border: "1px solid rgba(0,150,214,0.25)",
                          borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "var(--hp-blue)",
                        }}
                      >
                        {country}
                        <button
                          type="button"
                          onClick={() => toggleCountry(country)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--hp-blue)", padding: 0, lineHeight: 1, fontSize: 14 }}
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Production cost range */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Production cost range
                  <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: 6 }}>optional</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {/* Budget min */}
                  <div>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Budget min (€)</p>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted)", pointerEvents: "none" }}>€</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="e.g. 2000"
                        style={{ ...selectStyle, backgroundImage: "none", paddingLeft: 24, paddingRight: 12 }}
                      />
                    </div>
                  </div>
                  {/* Budget max */}
                  <div>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Budget max (€)</p>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted)", pointerEvents: "none" }}>€</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="e.g. 5000"
                        style={{ ...selectStyle, backgroundImage: "none", paddingLeft: 24, paddingRight: 12 }}
                      />
                    </div>
                  </div>
                  {/* Run size */}
                  <div>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Expected run size (units)</p>
                    <input
                      type="number"
                      min="1"
                      step="500"
                      value={runSize}
                      onChange={(e) => setRunSize(e.target.value)}
                      placeholder="e.g. 5000"
                      style={{ ...selectStyle, backgroundImage: "none", paddingRight: 12 }}
                    />
                  </div>
                </div>
                {/* Live cost per unit estimate */}
                {calcCostPerUnit(budgetMin, budgetMax, runSize) && (
                  <div style={{
                    marginTop: 8, padding: "8px 12px",
                    background: "var(--light)", borderRadius: 6,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Est. cost per unit:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--hp-blue)" }}>
                      {calcCostPerUnit(budgetMin, budgetMax, runSize)}
                    </span>
                  </div>
                )}
              </div>

              {/* Colour picker — palette + custom */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Brand colours
                  <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: 6 }}>pick one or more</span>
                </label>

                {/* Selected swatches */}
                {brandColors.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {brandColors.map((color, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px 4px 6px" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: color, border: "1px solid rgba(0,0,0,0.12)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{color}</span>
                        <button onClick={() => setBrandColors((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preset palette grid */}
                <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", background: "#fafbfc", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>Preset palette — click to add</p>
                  {[
                    ["#000000","#1a1a1a","#333333","#555555","#777777","#999999","#bbbbbb","#dddddd","#f5f5f5","#ffffff"],
                    ["#7f1d1d","#b91c1c","#dc2626","#ef4444","#f97316","#fb923c","#fbbf24","#fde68a","#fef9c3","#fffbeb"],
                    ["#14532d","#166534","#16a34a","#22c55e","#4ade80","#065f46","#047857","#059669","#34d399","#a7f3d0"],
                    ["#1e3a5f","#1d4ed8","#2563eb","#3b82f6","#60a5fa","#0096D6","#0073A8","#002D72","#7c3aed","#8b5cf6"],
                    ["#831843","#be185d","#db2777","#ec4899","#f472b6","#6b21a8","#9333ea","#a855f7","#c084fc","#e879f9"],
                    ["#78350f","#92400e","#b45309","#d97706","#f59e0b","#fcd34d","#0f766e","#0d9488","#14b8a6","#2dd4bf"],
                  ].map((row, ri) => (
                    <div key={ri} style={{ display: "flex", gap: 5, marginBottom: ri < 5 ? 5 : 0 }}>
                      {row.map((hex) => {
                        const already = brandColors.includes(hex);
                        return (
                          <button
                            key={hex}
                            type="button"
                            title={hex}
                            onClick={() => { if (!already) setBrandColors((p) => [...p, hex]); }}
                            style={{
                              width: 28, height: 28, borderRadius: 5, background: hex, flexShrink: 0,
                              border: already ? "2.5px solid var(--hp-blue)" : "1.5px solid rgba(0,0,0,0.12)",
                              cursor: already ? "default" : "pointer",
                              outline: already ? "2px solid white" : "none",
                              outlineOffset: "-4px",
                              transition: "transform 0.1s",
                              boxShadow: hex === "#ffffff" ? "inset 0 0 0 1px #ddd" : "none",
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Custom picker row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    value={pickerValue}
                    onChange={(e) => setPickerValue(e.target.value)}
                    style={{ width: 44, height: 40, borderRadius: 8, border: "1.5px solid var(--border)", padding: 3, cursor: "pointer", background: "white", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace", minWidth: 68 }}>{pickerValue}</span>
                  <button
                    onClick={() => { if (!brandColors.includes(pickerValue)) setBrandColors((p) => [...p, pickerValue]); }}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid var(--border)", background: "white", fontSize: 13, fontWeight: 500, color: "var(--text)", cursor: "pointer" }}
                  >
                    + Custom colour
                  </button>
                </div>
              </div>

              {/* Drop zone */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>
                  Brand assets <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
                </label>
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
                    Drop a product photo or PDF — the AI will use your actual packaging as reference
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted)" }}>PDF, PNG, JPG supported</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: "none" }}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
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
                        <button
                          onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, j) => j !== i)); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0 }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={!brandName.trim() || !productType.trim() || loading}
                style={{
                  width: "100%", padding: "14px 0", border: "none", borderRadius: 10,
                  background: (brandName.trim() && productType.trim()) ? "var(--hp-blue)" : "var(--border)",
                  color: "white", fontSize: 15, fontWeight: 600,
                  cursor: (brandName.trim() && productType.trim()) ? "pointer" : "not-allowed",
                  transition: "background 0.15s",
                }}
              >
                ✦ Generate campaign ideas
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
