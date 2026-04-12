"use client";

import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(255,255,255,0.7)",
    display: "block",
    marginBottom: 6,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #001A4D 0%, #002D72 40%, #005B99 75%, #0096D6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "44px 40px 40px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div
            style={{
              background: "white",
              borderRadius: 6,
              padding: "5px 10px",
              color: "#0096D6",
              fontWeight: 800,
              fontSize: 15,
              lineHeight: 1,
            }}
          >
            HP
          </div>
          <span style={{ color: "white", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Campaign Studio
          </span>
        </div>

        <h1
          style={{
            color: "white",
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 8,
            lineHeight: 1.2,
            fontFamily: "var(--font-serif)",
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginBottom: 32 }}>
          Sign in to your HP account to continue.
        </p>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={fieldStyle}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", cursor: "default" }}>
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={fieldStyle}
            />
          </div>
        </div>

        {/* Sign in button */}
        <button
          onClick={onLogin}
          style={{
            width: "100%",
            marginTop: 28,
            padding: "13px 0",
            borderRadius: 10,
            background: "white",
            color: "#002D72",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.15s",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Sign in
        </button>

        {/* SSO option */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>or </span>
          <span
            style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", cursor: "default" }}
          >
            Continue with HP SSO
          </span>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 28, fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
        © 2025 HP Inc. · Privacy · Terms
      </p>
    </div>
  );
}
