"use client";

import { Settings, Check } from "lucide-react";
import type { NavTab } from "@/lib/types";

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  apiKeySet: boolean;
  onApiKeyClick: () => void;
}

export default function TopBar({ activeTab, onTabChange, apiKeySet, onApiKeyClick }: TopBarProps) {
  return (
    <header
      style={{ height: 60, borderBottom: "1px solid var(--border)", paddingInline: 40 }}
      className="sticky top-0 z-40 bg-white flex items-center justify-between"
    >
      {/* Left: logo + name */}
      <div className="flex items-center gap-3">
        <div
          style={{
            background: "#0096D6",
            borderRadius: 4,
            padding: "4px 8px",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          HP
        </div>
        <span style={{ color: "#002D72", fontSize: 15, fontWeight: 600 }}>Campaign Studio</span>
      </div>

      {/* Centre: tabs */}
      <nav className="flex items-center gap-1">
        {(["campaign", "library"] as NavTab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                padding: "6px 18px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                background: active ? "var(--light)" : "transparent",
                color: active ? "var(--hp-blue)" : "var(--muted)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab === "campaign" ? "New campaign" : "Library"}
            </button>
          );
        })}
      </nav>

      {/* Right: API key + user */}
      <div className="flex items-center gap-4">
        <button
          onClick={onApiKeyClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 8,
            border: apiKeySet ? "1px solid var(--success)" : "1px solid var(--border)",
            background: apiKeySet ? "#f0faf7" : "white",
            color: apiKeySet ? "var(--success)" : "var(--muted)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {apiKeySet ? <Check size={13} /> : <Settings size={13} />}
          {apiKeySet ? "API key set" : "API key"}
        </button>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Nutella · Ferrero Group</span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--hp-blue)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
