"use client";

import { useState } from "react";
import type { Concept } from "@/lib/types";

interface PdfExportViewProps {
  concept: Concept;
  brandName: string;
  season: string;
  onBack: () => void;
}

export default function PdfExportView({ concept, brandName, season, onBack }: PdfExportViewProps) {
  const [filename, setFilename] = useState(
    `HP-Campaign-${concept.name.replace(/\s+/g, "-")}-Brief`
  );
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://hp-marketing-ideation.vercel.app";

  function copyUrl() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px", display: "flex", gap: 40 }}>
      {/* Left: simulated PDF */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", fontSize: 14, color: "var(--hp-blue)", cursor: "pointer", padding: 0, marginBottom: 20 }}
        >
          ← Back to concept
        </button>

        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1.5px solid var(--border)",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {/* PDF header */}
          <div style={{ background: "var(--hp-dark)", padding: "20px 28px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "var(--hp-blue)", borderRadius: 4, padding: "3px 7px", color: "white", fontWeight: 700, fontSize: 12 }}>HP</div>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>Campaign Studio — Confidential Brief</span>
          </div>

          {/* PDF body */}
          <div style={{ padding: 28 }}>
            <h2 className="font-serif" style={{ fontSize: 26, color: "var(--text)", margin: "0 0 8px" }}>
              {concept.name}
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
              {brandName} · {season}
            </p>

            {/* Gradient visual */}
            <div
              style={{
                height: 160,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${concept.gradientFrom}, ${concept.gradientTo})`,
                marginBottom: 20,
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {concept.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={concept.imageUrl}
                  alt={concept.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>

            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 20 }}>
              {concept.description}
            </p>

            {/* 2×2 metric grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Lead time", value: concept.digitalLeadTime },
                { label: "Min. order", value: concept.digitalMinOrder },
                { label: "Design variants", value: concept.digitalVariants },
                { label: "Est. cost", value: concept.digitalCost },
              ].map((m) => (
                <div key={m.label} style={{ background: "var(--light)", borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--hp-dark)", margin: 0 }}>{m.value}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 0 }}>
              <strong style={{ color: "var(--text)" }}>Next step:</strong> Share this brief with your HP print partner to get a production quote. HP Indigo technology enables small-batch, variable-data runs that traditional offset cannot match.
            </p>
          </div>

          {/* PDF footer */}
          <div
            style={{
              background: "var(--light)",
              padding: "12px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--hp-blue)", fontWeight: 500 }}>Powered by HP Campaign Studio</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>confidential · for internal use</span>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Download */}
        <div style={{ background: "white", borderRadius: 12, border: "1.5px solid var(--border)", padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Download PDF</p>
          <input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
          <button
            style={{
              width: "100%",
              padding: "11px 0",
              background: "var(--hp-blue)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⬇ Download {filename}.pdf
          </button>
        </div>

        {/* Share */}
        <div style={{ background: "white", borderRadius: 12, border: "1.5px solid var(--border)", padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Share with team</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              readOnly
              value={shareUrl}
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--muted)",
                background: "#f9fafb",
              }}
            />
            <button
              onClick={copyUrl}
              style={{
                padding: "9px 14px",
                background: copied ? "var(--success)" : "var(--light)",
                color: copied ? "white" : "var(--hp-blue)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Partner CTA */}
        <div
          style={{
            background: "var(--light)",
            borderRadius: 12,
            border: "1px solid rgba(0,150,214,0.2)",
            padding: 20,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--hp-dark)", marginBottom: 6 }}>
            Ready to move forward?
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
            Connect with a certified HP Indigo print partner to get a production quote.
          </p>
          <button
            style={{
              width: "100%",
              padding: "11px 0",
              background: "var(--hp-dark)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Talk to an HP partner →
          </button>
        </div>
      </div>
    </div>
  );
}
