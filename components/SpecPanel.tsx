"use client";

import { useState, useEffect } from "react";
import { X, Check, BookmarkPlus, BookOpen, Trash2 } from "lucide-react";
import { PackagingSpec, PACKAGING_TYPES } from "./IdeaCard";
import type { Idea } from "@/lib/supabase";
import { getSettings, saveSettings, type SpecPreset } from "@/lib/supabase";
import { ProductionSpec, DEFAULT_PRODUCTION_SPEC } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const FINISHING_OPTIONS = [
  "No finish",
  "Gloss laminate",
  "Matte laminate",
  "Soft-touch laminate",
  "Spot UV varnish",
  "Gloss varnish",
];

const ICC_PROFILES = [
  "ISOcoated_v2 (Fogra39)",
  "PSO Coated v3 (Fogra51)",
  "GRACoL2013 (CRPC6)",
  "HP IndiChrome profile",
];

const RENDERING_INTENTS = [
  "Relative Colorimetric",
  "Perceptual",
  "Absolute Colorimetric",
  "Saturation",
];

export const CHECKLIST_STEPS = [
  { title: "Brief designer",       desc: "Share campaign concept, brand assets, and this spec sheet" },
  { title: "Request print quote",  desc: "Contact HP Certified Print Partner with packaging type and run quantity" },
  { title: "Prepare artwork",      desc: "Design to spec: 3 mm bleed, 3 mm safe zone, 300 DPI, correct colour profile" },
  { title: "Preflight & submit",   desc: "Export PDF/X-4, embed fonts & ICC profile, verify overprint settings" },
  { title: "Approve proof",        desc: "Sign off on colour accuracy, variable field placement, and trim marks" },
  { title: "Confirm press run",    desc: "Confirm substrate, quantity, finishing, and delivery timeline with printer" },
];

const STATIC_SPECS = [
  { label: "Bleed",        value: "3 mm (all edges)" },
  { label: "Safe zone",    value: "3 mm inset from trim" },
  { label: "Resolution",   value: "300 DPI minimum" },
  { label: "File format",  value: "PDF/X-4" },
  { label: "Fonts",        value: "Embedded (no subset)" },
  { label: "HP Indigo",    value: "HP Indigo 6900 Digital Press" },
  { label: "Max sheet",    value: "317 x 464 mm" },
  { label: "Colour space", value: "CMYK + HP IndiChrome (6-colour)" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface SpecPanelProps {
  idea: Idea;
  packagingSpec: PackagingSpec | null;
  productionSpec: ProductionSpec;
  onPackagingChange: (ideaId: string, spec: PackagingSpec | null) => void;
  onProductionChange: (ideaId: string, spec: ProductionSpec) => void;
  onClose: () => void;
}

export default function SpecPanel({
  idea,
  packagingSpec,
  productionSpec,
  onPackagingChange,
  onProductionChange,
  onClose,
}: SpecPanelProps) {
  const spec = { ...DEFAULT_PRODUCTION_SPEC, ...productionSpec };

  const [presets, setPresets]           = useState<SpecPreset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName]     = useState("");
  const [showPresets, setShowPresets]   = useState(false);
  const [saving, setSaving]             = useState(false);

  // Load presets from Supabase settings
  useEffect(() => {
    getSettings().then((s) => setPresets(s.specPresets ?? []));
  }, []);

  function update(partial: Partial<ProductionSpec>) {
    onProductionChange(idea.id, { ...spec, ...partial });
  }

  function toggleChecklist(i: number) {
    const next = [...spec.checklist];
    next[i] = !next[i];
    update({ checklist: next });
  }

  async function savePreset() {
    if (!presetName.trim()) return;
    setSaving(true);
    const newPreset: SpecPreset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      spec: {
        substrate:       spec.substrate,
        finishing:       spec.finishing,
        iccProfile:      spec.iccProfile,
        renderingIntent: spec.renderingIntent,
        overprint:       spec.overprint,
        spotColour:      spec.spotColour,
        checklist:       spec.checklist,
      },
    };
    const updated = [...presets, newPreset];
    await saveSettings({ specPresets: updated });
    setPresets(updated);
    setPresetName("");
    setShowSaveModal(false);
    setSaving(false);
  }

  async function deletePreset(id: string) {
    const updated = presets.filter((p) => p.id !== id);
    await saveSettings({ specPresets: updated });
    setPresets(updated);
  }

  function applyPreset(preset: SpecPreset) {
    onProductionChange(idea.id, { ...spec, ...preset.spec });
    setShowPresets(false);
  }

  const completedSteps = spec.checklist.filter(Boolean).length;

  return (
    <div style={{
      width: 360,
      borderLeft: "1px solid var(--border)",
      background: "white",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflowY: "auto",
    }}>
      {/* Sticky header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 10,
      }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>
            Production Spec
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>
            {idea.title}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Load preset button */}
          <button
            onClick={() => setShowPresets((v) => !v)}
            title="Load preset"
            style={{ background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--muted)", padding: "5px 8px", borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}
          >
            <BookOpen size={13} />
            Presets
          </button>
          {/* Save as preset button */}
          <button
            onClick={() => setShowSaveModal(true)}
            title="Save as preset"
            style={{ background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--hp-blue)", padding: "5px 8px", borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}
          >
            <BookmarkPlus size={13} />
            Save
          </button>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 6, marginLeft: 2 }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Preset list dropdown */}
      {showPresets && (
        <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)", padding: "10px 16px" }}>
          {presets.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>No saved presets yet. Fill in specs and click Save.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {presets.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", border: "1px solid var(--border)", borderRadius: 7, padding: "7px 10px" }}>
                  <button
                    onClick={() => applyPreset(p)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--hp-blue)", padding: 0, textAlign: "left" }}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => deletePreset(p.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* ── PACKAGING ── */}
        <Section label="Packaging">
          <Field label="Type">
            <select
              value={packagingSpec?.type ?? "none"}
              onChange={(e) => {
                const s = PACKAGING_TYPES.find((p) => p.type === e.target.value);
                onPackagingChange(idea.id, s && s.type !== "none" ? s : null);
              }}
              style={selectStyle}
            >
              {PACKAGING_TYPES.map((p) => (
                <option key={p.type} value={p.type}>{p.label}</option>
              ))}
            </select>
          </Field>
          {packagingSpec && packagingSpec.type !== "none" && (
            <div style={{ fontSize: 11, color: "var(--muted)", background: "var(--bg)", borderRadius: 6, padding: "6px 10px", marginBottom: 10 }}>
              {packagingSpec.depth
                ? `${packagingSpec.width} × ${packagingSpec.height} × ${packagingSpec.depth} ${packagingSpec.unit}`
                : `${packagingSpec.width} × ${packagingSpec.height} ${packagingSpec.unit}`}
            </div>
          )}
          <Field label="Substrate">
            <input
              type="text"
              value={spec.substrate}
              onChange={(e) => update({ substrate: e.target.value })}
              placeholder="e.g. 80gsm PP self-adhesive, 350gsm coated board…"
              style={inputStyle}
            />
          </Field>
          <Field label="Finishing">
            <select value={spec.finishing} onChange={(e) => update({ finishing: e.target.value })} style={selectStyle}>
              {FINISHING_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </Section>

        {/* ── COLOUR MANAGEMENT ── */}
        <Section label="Colour Management">
          <Field label="ICC Profile">
            <select value={spec.iccProfile} onChange={(e) => update({ iccProfile: e.target.value })} style={selectStyle}>
              {ICC_PROFILES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Rendering intent">
            <select value={spec.renderingIntent} onChange={(e) => update({ renderingIntent: e.target.value })} style={selectStyle}>
              {RENDERING_INTENTS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Overprint">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
              <button
                onClick={() => update({ overprint: !spec.overprint })}
                style={{
                  width: 38, height: 22, borderRadius: 11,
                  background: spec.overprint ? "var(--hp-blue)" : "#D1D5DB",
                  border: "none", cursor: "pointer", position: "relative",
                  transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <span style={{
                  position: "absolute", top: 3,
                  left: spec.overprint ? 19 : 3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "white", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                {spec.overprint ? "Enabled" : "Disabled"}
              </span>
            </div>
          </Field>
          <Field label="Spot colour">
            <input
              type="text"
              value={spec.spotColour}
              onChange={(e) => update({ spotColour: e.target.value })}
              placeholder="e.g. Pantone 485 C (leave blank if none)"
              style={inputStyle}
            />
          </Field>
        </Section>

        {/* ── ARTWORK SPECS (static) ── */}
        <Section label="Artwork Specs">
          <div style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden" }}>
            {STATIC_SPECS.map((row, i) => (
              <div key={row.label} style={{
                display: "flex",
                borderBottom: i < STATIC_SPECS.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ width: "42%", padding: "7px 10px", background: "var(--bg)", fontSize: 11, fontWeight: 600, color: "var(--muted)", borderRight: "1px solid var(--border)" }}>
                  {row.label}
                </div>
                <div style={{ flex: 1, padding: "7px 10px", fontSize: 11, color: "var(--text)" }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── PRODUCTION CHECKLIST ── */}
        <Section
          label="Production Checklist"
          right={
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: completedSteps === CHECKLIST_STEPS.length ? "#065F46" : "var(--muted)",
              background: completedSteps === CHECKLIST_STEPS.length ? "#D1FAE5" : "var(--bg)",
              borderRadius: 20, padding: "2px 8px",
            }}>
              {completedSteps}/{CHECKLIST_STEPS.length}
            </span>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CHECKLIST_STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => toggleChecklist(i)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: spec.checklist[i] ? "#f0fdf4" : "var(--bg)",
                  border: `1px solid ${spec.checklist[i] ? "#86efac" : "var(--border)"}`,
                  borderRadius: 8, padding: "10px 12px",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  background: spec.checklist[i] ? "#22c55e" : "white",
                  border: `1.5px solid ${spec.checklist[i] ? "#22c55e" : "#D1D5DB"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {spec.checklist[i] && <Check size={11} color="white" strokeWidth={3} />}
                </div>
                <div>
                  <p style={{
                    fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 2px",
                    textDecoration: spec.checklist[i] ? "line-through" : "none",
                    opacity: spec.checklist[i] ? 0.5 : 1,
                  }}>
                    {i + 1}. {step.title}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
                    {step.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Section>

      </div>

      {/* Save preset modal */}
      {showSaveModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div style={{
            background: "white", borderRadius: 14, padding: 28,
            maxWidth: 360, width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
              Save as preset
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 18px" }}>
              Give this spec a name so you can reuse it across campaigns.
            </p>
            <input
              autoFocus
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") savePreset(); if (e.key === "Escape") setShowSaveModal(false); }}
              placeholder="e.g. Standard Can Sleeve, Heineken Gloss Box…"
              style={{ ...inputStyle, marginBottom: 18 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid var(--border)", background: "white", color: "var(--muted)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={savePreset}
                disabled={!presetName.trim() || saving}
                style={{ flex: 2, padding: "9px 0", borderRadius: 8, border: "none", background: presetName.trim() ? "var(--hp-blue)" : "var(--border)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving…" : "Save preset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          {label}
        </p>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--text)",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--text)",
  background: "white",
  outline: "none",
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235C6B82' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 28,
};
