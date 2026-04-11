"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface ApiKeyModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function ApiKeyModal({ onClose, onSaved }: ApiKeyModalProps) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  function save() {
    const key = value.trim();
    if (!key) return;
    localStorage.setItem("hpcs_k", key);
    onSaved();
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 480,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", margin: 0 }}>
            Connect your Anthropic API key
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
          Enter your key to generate campaign ideas with Claude AI. It&apos;s sent directly to Anthropic and never stored on our servers.
        </p>

        {/* Input */}
        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>
          API Key
        </label>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="sk-ant-api03-…"
            style={{
              width: "100%",
              padding: "10px 40px 10px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 14,
              color: "var(--text)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Note */}
        <div
          style={{
            background: "#f4f6f9",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--muted)",
            marginBottom: 24,
          }}
        >
          🔒 Your key is stored in your browser&apos;s localStorage and sent only to Anthropic&apos;s API. It never touches our servers.
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "white",
              color: "var(--muted)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!value.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: value.trim() ? "var(--hp-blue)" : "var(--border)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: value.trim() ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Save &amp; continue →
          </button>
        </div>
      </div>
    </div>
  );
}
