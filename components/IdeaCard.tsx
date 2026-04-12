"use client";

import { useState } from "react";
import { MessageSquare, History, Check, Minus, X, ClipboardList } from "lucide-react";
import StrategyBadge from "./StrategyBadge";
import MockupArea from "./MockupArea";
import { Idea, IdeaStatus, supabase } from "@/lib/supabase";

export type PackagingSpec = {
  type: string;
  label: string;
  width: number;
  height: number;
  depth?: number;
  unit: string;
};

export const PACKAGING_TYPES: PackagingSpec[] = [
  { type: "none", label: "Select packaging type…", width: 0, height: 0, unit: "mm" },
  { type: "bottle_label_front", label: "Bottle label (front)", width: 90, height: 120, unit: "mm" },
  { type: "bottle_label_wrap", label: "Bottle label (wrap-around)", width: 250, height: 80, unit: "mm" },
  { type: "box_small", label: "Box / carton (small)", width: 80, height: 200, depth: 120, unit: "mm" },
  { type: "box_medium", label: "Box / carton (medium)", width: 120, height: 250, depth: 80, unit: "mm" },
  { type: "pouch", label: "Pouch / sachet", width: 150, height: 200, unit: "mm" },
  { type: "can_sleeve", label: "Can sleeve (330ml)", width: 330, height: 115, unit: "mm" },
  { type: "jar_label", label: "Jar label", width: 200, height: 60, unit: "mm" },
];

interface IdeaCardProps {
  idea: Idea;
  brandName: string;
  isActive?: boolean;
  isSpecActive?: boolean;
  packagingSpec?: PackagingSpec | null;
  onPackagingChange?: (ideaId: string, spec: PackagingSpec | null) => void;
  onSelectForChat: (idea: Idea) => void;
  onSelectForSpec?: (idea: Idea) => void;
  onIdeaUpdated: (id: string, updates: Partial<Idea>) => void;
}

const STATUS_CONFIG: Record<
  IdeaStatus,
  { label: string; icon: React.ReactNode; active: string; ghost: string }
> = {
  approved: {
    label: "Approved",
    icon: <Check size={11} />,
    active: "bg-emerald-500 text-white border-emerald-500",
    ghost: "text-emerald-600 border-emerald-300 hover:bg-emerald-50",
  },
  maybe: {
    label: "Maybe",
    icon: <Minus size={11} />,
    active: "bg-amber-400 text-white border-amber-400",
    ghost: "text-amber-600 border-amber-300 hover:bg-amber-50",
  },
  rejected: {
    label: "Rejected",
    icon: <X size={11} />,
    active: "bg-red-400 text-white border-red-400",
    ghost: "text-red-500 border-red-300 hover:bg-red-50",
  },
};

export default function IdeaCard({
  idea,
  brandName,
  isActive,
  isSpecActive,
  packagingSpec,
  onPackagingChange,
  onSelectForChat,
  onSelectForSpec,
  onIdeaUpdated,
}: IdeaCardProps) {
  const revisionCount = idea.feedback_history?.length ?? 0;
  const [statusLoading, setStatusLoading] = useState(false);

  async function handleStatusToggle(status: IdeaStatus) {
    if (statusLoading) return;
    const next: IdeaStatus | null = idea.idea_status === status ? null : status;
    setStatusLoading(true);
    try {
      const { error } = await supabase
        .from("ideas")
        .update({ idea_status: next, updated_at: new Date().toISOString() })
        .eq("id", idea.id);
      if (error) throw error;
      onIdeaUpdated(idea.id, { idea_status: next });
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: `1.5px solid ${isActive ? "var(--hp-blue)" : "var(--border)"}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: isActive ? "0 4px 20px rgba(0,150,214,0.22)" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        if (!isActive) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,150,214,0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isActive ? "0 4px 20px rgba(0,150,214,0.22)" : "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      {/* Nano Banana 2 image area */}
      <MockupArea
        ideaId={idea.id}
        brandName={brandName}
        ideaTitle={idea.title}
        ideaDescription={idea.description}
        strategyType={idea.strategy_type}
        mockupUrl={idea.mockup_url}
        savedStyle={idea.mockup_style}
        onMockupGenerated={(url, style) =>
          onIdeaUpdated(idea.id, { mockup_url: url, mockup_style: style })
        }
      />

      {/* Card body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {/* Strategy badge + revision count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StrategyBadge type={idea.strategy_type} />
          {revisionCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}>
              <History size={11} />
              {revisionCount} revision{revisionCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 5px", lineHeight: 1.3 }}>
            {idea.title}
          </h3>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {idea.description}
          </p>
        </div>

        {/* Packaging spec summary — click to open spec panel */}
        {packagingSpec && packagingSpec.type !== "none" && (
          <div style={{
            borderTop: "1px solid var(--border)", paddingTop: 10,
            fontSize: 11, color: "var(--muted)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <ClipboardList size={11} />
            <span style={{ fontWeight: 600 }}>{packagingSpec.label}</span>
            <span>·</span>
            <span>
              {packagingSpec.depth
                ? `${packagingSpec.width}×${packagingSpec.height}×${packagingSpec.depth}${packagingSpec.unit}`
                : `${packagingSpec.width}×${packagingSpec.height}${packagingSpec.unit}`}
            </span>
          </div>
        )}

        {/* Status toggles */}
        <div style={{ display: "flex", gap: 6 }}>
          {(Object.keys(STATUS_CONFIG) as IdeaStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const active = idea.idea_status === s;
            return (
              <button
                key={s}
                onClick={() => handleStatusToggle(s)}
                disabled={statusLoading}
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                  active ? cfg.active : `bg-white ${cfg.ghost}`
                }`}
              >
                {cfg.icon}
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={() => onSelectForChat(idea)}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, fontWeight: 500, padding: "8px 0", borderRadius: 8,
              border: `1px solid ${isActive ? "var(--hp-blue)" : "rgba(0,150,214,0.35)"}`,
              background: isActive ? "var(--hp-blue)" : "transparent",
              color: isActive ? "white" : "var(--hp-blue)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <MessageSquare size={12} />
            {isActive ? "Close chat" : "Chat"}
          </button>
          {onSelectForSpec && (
            <button
              onClick={() => onSelectForSpec(idea)}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontSize: 12, fontWeight: 500, padding: "8px 0", borderRadius: 8,
                border: `1px solid ${isSpecActive ? "#0073A8" : "rgba(0,115,168,0.35)"}`,
                background: isSpecActive ? "#0073A8" : "transparent",
                color: isSpecActive ? "white" : "#0073A8",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <ClipboardList size={12} />
              {isSpecActive ? "Close spec" : "Spec"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
