"use client";

import { useState } from "react";
import type { Concept } from "@/lib/types";

const PARTNERS = [
  { name: "Grafiche Garattoni", location: "Bologna, IT" },
  { name: "Printcolor AG", location: "Milan, IT" },
  { name: "Indugraf", location: "Barcelona, ES" },
];

const DEFAULT_CONCEPT: Concept = {
  name: "Snowflake Collection",
  tagline: "Every jar tells a winter story",
  description:
    "A limited-edition Christmas run where each Nutella jar carries a unique hand-illustrated snowflake, printed with HP Indigo variable data. No two jars are identical — making each one a gift in itself.",
  gradientFrom: "#C8102E",
  gradientTo: "#7B3F00",
  imagePrompt: "Nutella jar with elegant snowflake illustration, white background, product photography",
  costMin: 1800,
  costMax: 3200,
  traditionalLeadTime: "6-8 weeks",
  digitalLeadTime: "1-2 weeks",
  traditionalMinOrder: "10,000 units",
  digitalMinOrder: "500 units",
  traditionalVariants: "1 design",
  digitalVariants: "Unlimited",
  traditionalCost: "€8,000+",
  digitalCost: "€1,800 – €3,200",
};

interface ConceptDetailProps {
  concept: Concept | null;
  onBack: () => void;
  onExport: () => void;
}

export default function ConceptDetail({ concept, onBack, onExport }: ConceptDetailProps) {
  const c = concept ?? DEFAULT_CONCEPT;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const tableRows = [
    { label: "Lead time", traditional: c.traditionalLeadTime, digital: c.digitalLeadTime },
    { label: "Min. order", traditional: c.traditionalMinOrder, digital: c.digitalMinOrder },
    { label: "Design variants", traditional: c.traditionalVariants, digital: c.digitalVariants },
    { label: "Estimated cost", traditional: c.traditionalCost, digital: c.digitalCost },
  ];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
      {/* Left: visual */}
      <div
        style={{
          width: "40%",
          background: `linear-gradient(160deg, ${c.gradientFrom}, ${c.gradientTo})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          gap: 24,
        }}
      >
        {/* Image */}
        <div
          style={{
            width: 220,
            height: 340,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {!imgLoaded && !imgError && (
            <div className="shimmer" style={{ position: "absolute", inset: 0 }} />
          )}
          {imgError && <span style={{ fontSize: 48 }}>🎨</span>}
          {c.imageUrl && !imgError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.imageUrl}
              alt={c.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.5s",
              }}
            />
          )}
        </div>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontStyle: "italic", textAlign: "center" }}>
          &ldquo;{c.tagline}&rdquo;
        </p>
      </div>

      {/* Right: detail */}
      <div
        style={{
          flex: 1,
          background: "white",
          padding: 40,
          overflowY: "auto",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            color: "var(--hp-blue)",
            cursor: "pointer",
            padding: 0,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← Back to concepts
        </button>

        <h1
          className="font-serif"
          style={{ fontSize: 32, color: "var(--text)", marginBottom: 12, lineHeight: 1.2 }}
        >
          {c.name}
        </h1>

        <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, marginBottom: 32 }}>
          {c.description}
        </p>

        {/* Comparison table */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--muted)",
              marginBottom: 12,
            }}
          >
            HP DIGITAL VS TRADITIONAL PRINTING
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 12px", background: "#f9fafb", border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 500 }}>
                  &nbsp;
                </th>
                <th style={{ textAlign: "left", padding: "10px 12px", background: "#f9fafb", border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 500 }}>
                  Traditional offset
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    background: "var(--light)",
                    border: "1px solid var(--border)",
                    color: "var(--hp-blue)",
                    fontWeight: 700,
                  }}
                >
                  HP Digital{" "}
                  <span
                    style={{
                      background: "var(--hp-blue)",
                      color: "white",
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                      marginLeft: 4,
                    }}
                  >
                    HP
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.label}>
                  <td style={{ padding: "10px 12px", border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 500 }}>
                    {row.label}
                  </td>
                  <td style={{ padding: "10px 12px", border: "1px solid var(--border)", color: "var(--text)" }}>
                    {row.traditional}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      color: "var(--success)",
                      fontWeight: 700,
                      background: "#fafffc",
                    }}
                  >
                    {row.digital}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Partners */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--muted)",
              marginBottom: 12,
            }}
          >
            HP CERTIFIED PRINT PARTNERS — ITALY &amp; SPAIN
          </p>
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 10,
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {PARTNERS.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: i < PARTNERS.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{p.location}</p>
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
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onExport}
            style={{
              flex: 1,
              padding: "13px 0",
              background: "var(--hp-blue)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⬇ Export board-ready PDF
          </button>
          <button
            style={{
              flex: 1,
              padding: "13px 0",
              background: "white",
              color: "var(--text)",
              border: "1.5px solid var(--border)",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Talk to an HP partner
          </button>
        </div>
      </div>
    </div>
  );
}
