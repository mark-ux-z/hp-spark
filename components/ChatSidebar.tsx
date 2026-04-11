"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare, RotateCcw, ImagePlus, ChevronUp } from "lucide-react";
import { Idea, MockupStyle } from "@/lib/supabase";

const QUICK_SUGGESTIONS = [
  "Make it more sustainable",
  "Add gamification",
  "Target Gen Z",
  "Emphasize premium",
];

const STYLE_OPTIONS: Record<keyof MockupStyle, string[]> = {
  shot:   ["Studio", "Lifestyle", "Flat lay"],
  mood:   ["Clean & Bright", "Soft & Natural", "Bold & Dramatic"],
  finish: ["Glossy", "Matte", "Metallic"],
};

const STYLE_LABELS: Record<keyof MockupStyle, string> = {
  shot:   "Shot",
  mood:   "Mood",
  finish: "Finish",
};

const DEFAULT_STYLE: MockupStyle = { shot: "Studio", mood: "Clean & Bright", finish: "Glossy" };

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ChatSidebarProps {
  idea: Idea;
  brandName: string;
  onClose: () => void;
  onIdeaUpdated: (updated: Partial<Idea>) => void;
}

export default function ChatSidebar({
  idea,
  brandName,
  onClose,
  onIdeaUpdated,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: `Hi! I can help refine the "${idea.title}" campaign. Tell me what direction to take it — tone, audience, values, or anything else.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [regeneratingMockup, setRegeneratingMockup] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [regenStyle, setRegenStyle] = useState<MockupStyle>(
    idea.mockup_style ?? DEFAULT_STYLE
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showStylePicker]);

  async function sendFeedback(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/refine-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
          strategyType: idea.strategy_type,
          feedbackHistory: idea.feedback_history ?? [],
          feedback: userMsg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onIdeaUpdated({
        title: data.idea.title,
        description: data.idea.description,
        strategy_type: data.idea.strategy_type,
        feedback_history: [
          ...(idea.feedback_history ?? []),
          { text: userMsg, timestamp: new Date().toISOString() },
        ],
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Done! I've updated the campaign:\n\n**${data.idea.title}**\n\n${data.idea.description}`,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refine idea";
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateMockup() {
    if (regeneratingMockup) return;
    setShowStylePicker(false);
    setRegeneratingMockup(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: `Regenerate mockup — ${regenStyle.shot} · ${regenStyle.mood} · ${regenStyle.finish}`,
      },
      { role: "assistant", text: "Generating a new mockup — this takes a moment..." },
    ]);

    try {
      const res = await fetch("/api/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: idea.id,
          brandName,
          ideaTitle: idea.title,
          ideaDescription: idea.description,
          strategyType: idea.strategy_type,
          mockupStyle: regenStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onIdeaUpdated({ mockup_url: data.mockupUrl, mockup_style: regenStyle });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "✅ Mockup updated! Check the card to see the new image." },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to regenerate mockup";
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setRegeneratingMockup(false);
    }
  }

  const busy = loading || regeneratingMockup;

  return (
    <aside className="w-[360px] shrink-0 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <MessageSquare size={14} className="text-[#0096D6] shrink-0" />
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Refine Idea</span>
          </div>
          <p className="text-sm font-semibold text-[#212121] leading-snug truncate">{idea.title}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#212121] p-1 rounded-lg hover:bg-[#F1F1F1] shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#0096D6] text-white rounded-br-sm"
                  : "bg-[#F1F1F1] text-[#212121] rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#F1F1F1] rounded-2xl rounded-bl-sm px-4 py-3 space-y-1.5">
              <p className="text-xs text-[#0096D6] font-medium animate-pulse flex items-center gap-1.5">
                <RotateCcw size={11} className="animate-spin" />
                Refining Strategy based on your input...
              </p>
              <div className="w-40 h-1.5 bg-[#E6F4FA] rounded-full overflow-hidden">
                <div className="h-full bg-[#0096D6] rounded-full animate-progress" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => sendFeedback(s)}
            disabled={busy}
            className="text-xs bg-[#E6F4FA] text-[#0073A8] border border-[#0096D6]/30 px-2.5 py-1 rounded-full hover:bg-[#0096D6] hover:text-white transition-colors disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Inline style picker */}
      {showStylePicker && (
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Mockup style</p>
          {(Object.keys(STYLE_OPTIONS) as (keyof MockupStyle)[]).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] text-amber-700 font-medium w-9 shrink-0">
                {STYLE_LABELS[key]}
              </span>
              <div className="flex gap-1 flex-wrap">
                {STYLE_OPTIONS[key].map((opt) => {
                  const active = regenStyle[key] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setRegenStyle((p) => ({ ...p, [key]: opt }))}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        active
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-amber-700 border-amber-300 hover:border-amber-500"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={regenerateMockup}
              className="flex-1 bg-amber-500 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Generate with this style
            </button>
            <button
              onClick={() => setShowStylePicker(false)}
              className="text-xs text-amber-600 px-2 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Regenerate Mockup button */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowStylePicker((v) => !v)}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-300 rounded-lg py-2 hover:bg-amber-100 hover:border-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {regeneratingMockup ? (
            <>
              <RotateCcw size={12} className="animate-spin" />
              Generating mockup...
            </>
          ) : (
            <>
              <ImagePlus size={12} />
              Regenerate Mockup
              <ChevronUp
                size={12}
                className={`ml-auto transition-transform ${showStylePicker ? "" : "rotate-180"}`}
              />
            </>
          )}
        </button>
      </div>

      {/* Text input */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex gap-2 items-end bg-[#F1F1F1] rounded-xl border border-gray-200 focus-within:border-[#0096D6] focus-within:bg-white transition-colors px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendFeedback(input);
              }
            }}
            placeholder="Type feedback..."
            rows={2}
            className="flex-1 bg-transparent text-sm text-[#212121] placeholder:text-[#6B7280] resize-none outline-none"
          />
          <button
            onClick={() => sendFeedback(input)}
            disabled={!input.trim() || busy}
            className="bg-[#0096D6] text-white p-2 rounded-lg hover:bg-[#0073A8] disabled:bg-gray-300 transition-colors shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
