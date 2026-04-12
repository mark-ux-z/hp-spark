"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare, RotateCcw, ImagePlus, ChevronUp, Sparkles } from "lucide-react";
import type { Concept } from "@/lib/types";

const QUICK_SUGGESTIONS = [
  "Make it more premium",
  "Add a sustainability angle",
  "Target Gen Z",
  "More playful and bold",
  "Emphasise limited edition",
];

const STYLE_OPTIONS = {
  shot:   ["Studio", "Lifestyle", "Flat lay"],
  mood:   ["Clean & Bright", "Soft & Natural", "Bold & Dramatic"],
  finish: ["Glossy", "Matte", "Metallic"],
};

const STYLE_LABELS = { shot: "Shot", mood: "Mood", finish: "Finish" };
const STYLE_KEYWORDS: Record<string, string> = {
  Studio: "studio product shot",
  Lifestyle: "lifestyle scene",
  "Flat lay": "flat lay overhead",
  "Clean & Bright": "clean bright lighting",
  "Soft & Natural": "soft natural light",
  "Bold & Dramatic": "bold dramatic lighting",
  Glossy: "glossy finish packaging",
  Matte: "matte finish packaging",
  Metallic: "metallic foil finish",
};

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

type MockupStyle = { shot: string; mood: string; finish: string };
const DEFAULT_STYLE: MockupStyle = { shot: "Studio", mood: "Clean & Bright", finish: "Glossy" };

function buildPollinationsUrl(
  prompt: string,
  seed: number,
  brandColors: string[],
  style?: MockupStyle
) {
  const colorStr = brandColors.length
    ? `, using colour palette: ${brandColors.join(" ")}`
    : "";
  const styleStr = style
    ? `, ${STYLE_KEYWORDS[style.shot]}, ${STYLE_KEYWORDS[style.mood]}, ${STYLE_KEYWORDS[style.finish]}`
    : "";
  const full = `${prompt}${colorStr}${styleStr}, white background, isolated, product photography, no text`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=512&height=768&seed=${seed}&nologo=true&model=flux`;
}

interface ConceptChatSidebarProps {
  concept: Concept;
  brandName: string;
  productType: string;
  brandPersonality: string;
  brandColors: string[];
  onClose: () => void;
  onConceptUpdated: (updates: Partial<Concept>) => void;
}

export default function ConceptChatSidebar({
  concept,
  brandName,
  productType,
  brandPersonality,
  brandColors,
  onClose,
  onConceptUpdated,
}: ConceptChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: `Hi! I can refine the "${concept.name}" concept. Tell me what direction to take it — tone, audience, visual style, or anything else.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [regenStyle, setRegenStyle] = useState<MockupStyle>(DEFAULT_STYLE);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showStylePicker]);

  async function sendFeedback(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput("");
    const updatedMessages: ChatMessage[] = [...messages, { role: "user", text: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/refine-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept,
          brandName,
          productType,
          brandPersonality,
          feedback: userMsg,
          history: updatedMessages.slice(0, -1),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onConceptUpdated(data.concept);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Updated! New concept:\n\n**${data.concept.name}**\n"${data.concept.tagline}"\n\n${data.concept.description}`,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refine concept";
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function regenerateImage() {
    if (regeneratingImage) return;
    setShowStylePicker(false);
    setRegeneratingImage(true);

    const seed = Math.floor(Math.random() * 99999) + 1;
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: `Regenerate image — ${regenStyle.shot} · ${regenStyle.mood} · ${regenStyle.finish}`,
      },
      { role: "assistant", text: "Generating a new image — it will update on the card in a moment..." },
    ]);

    const newUrl = buildPollinationsUrl(concept.imagePrompt, seed, brandColors, regenStyle);
    onConceptUpdated({ imageUrl: newUrl });

    // Brief delay so user sees the message before image loads
    setTimeout(() => {
      setRegeneratingImage(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "✅ Image updated! Check the card to see the new visual." },
      ]);
    }, 1200);
  }

  const busy = loading || regeneratingImage;

  return (
    <aside
      style={{
        width: 360,
        flexShrink: 0,
        background: "white",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <MessageSquare size={13} color="var(--hp-blue)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Refine Concept
            </span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {concept.name}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 6, flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "85%",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px",
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                background: msg.role === "user" ? "var(--hp-blue)" : "var(--light)",
                color: msg.role === "user" ? "white" : "var(--text)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "var(--light)", borderRadius: "16px 16px 16px 4px", padding: "10px 14px" }}>
              <p style={{ fontSize: 12, color: "var(--hp-blue)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <RotateCcw size={11} style={{ animation: "spin 1s linear infinite" }} />
                Refining concept...
              </p>
              <div style={{ width: 120, height: 4, background: "rgba(0,150,214,0.15)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
                <div className="animate-progress" style={{ height: "100%", background: "var(--hp-blue)", borderRadius: 4 }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => sendFeedback(s)}
            disabled={busy}
            style={{
              fontSize: 11,
              background: "var(--light)",
              color: "var(--hp-blue)",
              border: "1px solid rgba(0,150,214,0.3)",
              padding: "4px 10px",
              borderRadius: 20,
              cursor: "pointer",
              transition: "all 0.15s",
              opacity: busy ? 0.4 : 1,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Style picker panel */}
      {showStylePicker && (
        <div
          style={{
            margin: "0 16px 10px",
            background: "#fffbeb",
            border: "1px solid #fbbf24",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Image style
          </p>
          {(Object.keys(STYLE_OPTIONS) as (keyof typeof STYLE_OPTIONS)[]).map((key) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#92400e", fontWeight: 600, width: 36, flexShrink: 0 }}>
                {STYLE_LABELS[key]}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {STYLE_OPTIONS[key].map((opt) => {
                  const active = regenStyle[key] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setRegenStyle((p) => ({ ...p, [key]: opt }))}
                      style={{
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 20,
                        border: `1px solid ${active ? "#f59e0b" : "#fbbf24"}`,
                        background: active ? "#f59e0b" : "white",
                        color: active ? "white" : "#92400e",
                        cursor: "pointer",
                        transition: "all 0.1s",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              onClick={regenerateImage}
              style={{
                flex: 1,
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "7px 0",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Generate with this style
            </button>
            <button
              onClick={() => setShowStylePicker(false)}
              style={{ fontSize: 12, color: "#92400e", background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Regenerate image button */}
      <div style={{ padding: "0 16px 10px" }}>
        <button
          onClick={() => setShowStylePicker((v) => !v)}
          disabled={busy}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#92400e",
            background: "#fffbeb",
            border: "1px solid #fbbf24",
            borderRadius: 8,
            padding: "8px 0",
            cursor: "pointer",
            transition: "all 0.15s",
            opacity: busy ? 0.4 : 1,
          }}
        >
          {regeneratingImage ? (
            <>
              <RotateCcw size={12} style={{ animation: "spin 1s linear infinite" }} />
              Generating image...
            </>
          ) : (
            <>
              <ImagePlus size={12} />
              Regenerate Image
              <ChevronUp
                size={12}
                style={{
                  marginLeft: "auto",
                  transform: showStylePicker ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.15s",
                }}
              />
            </>
          )}
        </button>
      </div>

      {/* Also regenerate the full concept */}
      <div style={{ padding: "0 16px 10px" }}>
        <button
          onClick={() => sendFeedback("Regenerate this concept with a fresh creative direction")}
          disabled={busy}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--hp-blue)",
            background: "var(--light)",
            border: "1px solid rgba(0,150,214,0.3)",
            borderRadius: 8,
            padding: "8px 0",
            cursor: "pointer",
            transition: "all 0.15s",
            opacity: busy ? 0.4 : 1,
          }}
        >
          <Sparkles size={12} />
          Regenerate concept
        </button>
      </div>

      {/* Text input */}
      <div style={{ padding: "4px 16px 16px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            background: "#f7f9fc",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "8px 12px",
            transition: "border-color 0.15s",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendFeedback(input);
              }
            }}
            placeholder="Type feedback or a direction…"
            rows={2}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "var(--text)",
              resize: "none",
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => sendFeedback(input)}
            disabled={!input.trim() || busy}
            style={{
              background: input.trim() && !busy ? "var(--hp-blue)" : "var(--border)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: 8,
              cursor: input.trim() && !busy ? "pointer" : "not-allowed",
              transition: "background 0.15s",
              flexShrink: 0,
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
