"use client";

import { useState } from "react";
import { MessageSquare, History, Check, Minus, X } from "lucide-react";
import StrategyBadge from "./StrategyBadge";
import MockupArea from "./MockupArea";
import { Idea, IdeaStatus, MockupStyle, supabase } from "@/lib/supabase";

interface IdeaCardProps {
  idea: Idea;
  brandName: string;
  onSelectForChat: (idea: Idea) => void;
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
  onSelectForChat,
  onIdeaUpdated,
}: IdeaCardProps) {
  const revisionCount = idea.feedback_history?.length ?? 0;
  const [statusLoading, setStatusLoading] = useState(false);

  async function handleStatusToggle(status: IdeaStatus) {
    if (statusLoading) return;
    // Clicking the active status clears it
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
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

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Strategy + revision count */}
        <div className="flex items-start justify-between gap-2">
          <StrategyBadge type={idea.strategy_type} />
          {revisionCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#6B7280]">
              <History size={11} />
              {revisionCount} revision{revisionCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div>
          <h3 className="text-sm font-semibold text-[#212121] leading-snug mb-1">
            {idea.title}
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">
            {idea.description}
          </p>
        </div>

        {/* Status toggle */}
        <div className="flex gap-1.5">
          {(Object.keys(STATUS_CONFIG) as IdeaStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const isActive = idea.idea_status === s;
            return (
              <button
                key={s}
                onClick={() => handleStatusToggle(s)}
                disabled={statusLoading}
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                  isActive ? cfg.active : `bg-white ${cfg.ghost}`
                }`}
              >
                {cfg.icon}
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Refine button */}
        <button
          onClick={() => onSelectForChat(idea)}
          className="mt-auto w-full flex items-center justify-center gap-2 text-xs font-medium text-[#0096D6] border border-[#0096D6]/40 rounded-lg py-2 hover:bg-[#E6F4FA] transition-colors"
        >
          <MessageSquare size={13} />
          Refine with Chat
        </button>
      </div>
    </div>
  );
}
