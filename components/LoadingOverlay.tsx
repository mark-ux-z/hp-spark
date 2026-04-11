"use client";

import { Check } from "lucide-react";

const STEPS = [
  "Analysing your brand brief",
  "Creating campaign concepts with AI",
  "Building packaging visuals",
];

interface LoadingOverlayProps {
  brandName: string;
  step: number; // 1 | 2 | 3
}

export default function LoadingOverlay({ brandName, step }: LoadingOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,45,114,0.96)",
        backdropFilter: "blur(4px)",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <p
        className="font-serif"
        style={{ fontSize: 28, color: "white", marginBottom: 4, letterSpacing: "-0.5px" }}
      >
        HP Campaign Studio
      </p>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 36 }}>
        Generating for {brandName}…
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}>
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = step > stepNum;
          const isActive = step === stepNum;

          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Indicator */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? "var(--success)"
                    : isActive
                    ? "var(--hp-blue)"
                    : "rgba(255,255,255,0.15)",
                  transition: "background 0.3s",
                }}
              >
                {isDone ? (
                  <Check size={13} color="white" />
                ) : isActive ? (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : null}
              </div>

              <span
                style={{
                  fontSize: 14,
                  color: isDone || isActive ? "white" : "rgba(255,255,255,0.4)",
                  fontWeight: isActive ? 500 : 400,
                  transition: "color 0.3s",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
