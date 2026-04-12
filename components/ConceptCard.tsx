"use client";

import { useState } from "react";
import type { Concept } from "@/lib/types";

interface ConceptCardProps {
  concept: Concept;
  index: number;
  season: string;
  isActive?: boolean;
  onClick: () => void;
  onSelectForChat?: (e: React.MouseEvent) => void;
}

export default function ConceptCard({ concept, index, season, isActive, onClick, onSelectForChat }: ConceptCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isTopPick = index === 0;

  const costLabel = `€${concept.costMin.toLocaleString()} – €${concept.costMax.toLocaleString()}`;

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: 14,
        border: `1.5px solid ${isActive ? "var(--hp-blue)" : "var(--border)"}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        boxShadow: isActive ? "0 4px 20px rgba(0,150,214,0.22)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--hp-blue)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,150,214,0.18)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isActive ? "0 4px 20px rgba(0,150,214,0.22)" : "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Visual area */}
      <div
        style={{
          height: 200,
          background: `linear-gradient(135deg, ${concept.gradientFrom}, ${concept.gradientTo})`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top pick badge */}
        {isTopPick && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "var(--warm)",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              zIndex: 2,
            }}
          >
            ★ Top pick
          </div>
        )}

        {/* Shimmer / image */}
        {!imgLoaded && !imgError && (
          <div className="shimmer" style={{ position: "absolute", inset: 0 }} />
        )}

        {imgError && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            🎨
          </div>
        )}

        {concept.imageUrl && !imgError && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={concept.imageUrl}
            alt={concept.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />
        )}

        {/* Mini pack shape */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            width: 52,
            height: 76,
            borderRadius: 8,
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "40%",
              background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 6px)`,
              borderRadius: 4,
              marginBottom: 4,
            }}
          />
          <p style={{ fontSize: 7, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
            {concept.name.split(" ").slice(0, 2).join(" ")}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px 20px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          {concept.name}
        </h3>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>
          {concept.description.slice(0, 115)}{concept.description.length > 115 ? "…" : ""}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span
            style={{
              background: "#f0faf7",
              color: "var(--success)",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              border: "1px solid rgba(0,168,120,0.2)",
              flexShrink: 0,
            }}
          >
            {costLabel}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {onSelectForChat && (
              <button
                onClick={onSelectForChat}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: isActive ? "white" : "var(--hp-blue)",
                  background: isActive ? "var(--hp-blue)" : "var(--light)",
                  border: "1px solid rgba(0,150,214,0.3)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {isActive ? "✕ Close" : "Refine →"}
              </button>
            )}
            <span style={{ fontSize: 13, color: "var(--hp-blue)", fontWeight: 500, whiteSpace: "nowrap" }}>
              Details →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
