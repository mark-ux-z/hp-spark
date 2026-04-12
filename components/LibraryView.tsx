"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { supabase, getSettings, saveSettings } from "@/lib/supabase";
import type { Campaign } from "@/lib/supabase";
import { CAMPAIGN_STATUS_CONFIG, CampaignStatus } from "@/lib/types";

const FILTERS = ["All", "Active", "Draft", "Exported", "Presented"];

// Deterministic gradient from a string
function brandGradient(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const hue1 = h % 360;
  const hue2 = (hue1 + 40) % 360;
  return [`hsl(${hue1},60%,40%)`, `hsl(${hue2},55%,55%)`];
}

// Convert brand name to a likely domain for logo lookup
function brandToDomain(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
}

function statusLabel(status: string) {
  if (status === "active") return { label: "Active", color: "var(--hp-blue)", bg: "var(--light)" };
  return { label: "Draft", color: "var(--warm)", bg: "#fff8f0" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Logo thumbnail with fallback to gradient + initials
function BrandThumbnail({ brandName, campaignId }: { brandName: string; campaignId: string }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [from, to] = brandGradient(brandName || campaignId);
  const domain = brandToDomain(brandName);
  const logoUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;

  return (
    <div
      style={{
        height: 120,
        background: logoFailed || !brandName
          ? `linear-gradient(135deg, ${from}, ${to})`
          : "#f8f9fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {(!logoFailed && brandName) ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logoUrl}
          alt={`${brandName} logo`}
          onError={() => setLogoFailed(true)}
          style={{ height: 56, width: 56, objectFit: "contain", borderRadius: 8 }}
        />
      ) : (
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.04em",
            textShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          {(brandName || "?").slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

interface LibraryViewProps {
  onNewCampaign: () => void;
}

export default function LibraryView({ onNewCampaign }: LibraryViewProps) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, CampaignStatus>>({});
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Editable library title stored in localStorage
  const [title, setTitle] = useState("My brand library");
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("library_title");
    if (saved) setTitle(saved);
    // Load from Supabase settings, fall back to localStorage
    getSettings().then((settings) => {
      const dbNames = settings.campaignNames ?? {};
      const dbStatuses = settings.campaignStatuses ?? {};
      const localNames = JSON.parse(localStorage.getItem("campaign_names") ?? "{}");
      const localStatuses = JSON.parse(localStorage.getItem("campaign_statuses") ?? "{}");
      setCampaignNames({ ...dbNames, ...localNames });
      setCampaignStatuses({ ...dbStatuses, ...localStatuses } as Record<string, CampaignStatus>);
    }).catch(() => {
      setCampaignNames(JSON.parse(localStorage.getItem("campaign_names") ?? "{}"));
      setCampaignStatuses(JSON.parse(localStorage.getItem("campaign_statuses") ?? "{}") as Record<string, CampaignStatus>);
    });
  }, []);

  useEffect(() => {
    supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", "demo-user")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCampaigns((data as Campaign[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (editingTitle) titleRef.current?.select();
  }, [editingTitle]);

  function saveTitle() {
    const trimmed = title.trim() || "My brand library";
    setTitle(trimmed);
    localStorage.setItem("library_title", trimmed);
    setEditingTitle(false);
  }

  async function deleteCampaign() {
    if (!deleteTarget) return;
    setDeleting(true);
    // Delete ideas first (foreign key), then campaign
    await supabase.from("ideas").delete().eq("campaign_id", deleteTarget.id);
    await supabase.from("campaigns").delete().eq("id", deleteTarget.id);
    // Remove from localStorage
    const names = JSON.parse(localStorage.getItem("campaign_names") ?? "{}");
    delete names[deleteTarget.id];
    localStorage.setItem("campaign_names", JSON.stringify(names));
    const statuses = JSON.parse(localStorage.getItem("campaign_statuses") ?? "{}");
    delete statuses[deleteTarget.id];
    localStorage.setItem("campaign_statuses", JSON.stringify(statuses));
    // Remove from Supabase settings
    try {
      const settings = await getSettings();
      const updatedNames = { ...(settings.campaignNames ?? {}) };
      const updatedStatuses = { ...(settings.campaignStatuses ?? {}) };
      delete updatedNames[deleteTarget.id];
      delete updatedStatuses[deleteTarget.id];
      await saveSettings({ campaignNames: updatedNames, campaignStatuses: updatedStatuses });
    } catch (e) {
      console.error("Failed to clean up settings:", e);
    }
    setCampaignNames(names);
    setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          {/* Editable title */}
          {editingTitle ? (
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setEditingTitle(false); } }}
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "var(--text)",
                border: "none",
                borderBottom: "2px solid var(--hp-blue)",
                outline: "none",
                background: "transparent",
                fontFamily: "inherit",
                lineHeight: 1.2,
                marginBottom: 4,
                width: 420,
                padding: "0 2px",
              }}
            />
          ) : (
            <h1
              className="font-serif"
              onClick={() => setEditingTitle(true)}
              title="Click to rename"
              style={{
                fontSize: 32,
                color: "var(--text)",
                margin: 0,
                lineHeight: 1.2,
                cursor: "text",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {title}
              <span style={{ fontSize: 14, color: "var(--muted)", fontFamily: "sans-serif", fontWeight: 400, opacity: 0.6 }}>
                ✎
              </span>
            </h1>
          )}
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
            {loading ? "Loading…" : `${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={onNewCampaign}
          style={{
            padding: "10px 20px",
            background: "var(--hp-blue)",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New campaign
        </button>
      </div>

      {/* Filter pills — decorative */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {FILTERS.map((f, i) => (
          <button
            key={f}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: i === 0 ? "var(--hp-blue)" : "white",
              color: i === 0 ? "white" : "var(--muted)",
              fontSize: 13,
              fontWeight: i === 0 ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ borderRadius: 12, border: "1.5px solid var(--border)", overflow: "hidden" }}>
              <div style={{ height: 120, background: "#f0f2f5" }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ height: 14, width: "60%", background: "#f0f2f5", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 11, width: "40%", background: "#f0f2f5", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && campaigns.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 40px",
            border: "2px dashed var(--border)",
            borderRadius: 16,
            background: "#fafbfc",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            No campaigns yet
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
            Generate your first HP Indigo campaign and it will appear here.
          </p>
          <button
            onClick={onNewCampaign}
            style={{
              padding: "12px 28px",
              background: "var(--hp-blue)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✦ Create your first campaign
          </button>
        </div>
      )}

      {/* Campaign grid */}
      {!loading && campaigns.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {campaigns.map((campaign) => {
            const campaignStatus = campaignStatuses[campaign.id] ?? "ideation";
            const { label, color, bg } = CAMPAIGN_STATUS_CONFIG[campaignStatus as CampaignStatus];
            const displayName = campaignNames[campaign.id] || campaign.brand_name || "Untitled campaign";
            return (
              <div
                key={campaign.id}
                onClick={() => router.push(`/campaign/${campaign.id}`)}
                style={{
                  background: "white",
                  borderRadius: 12,
                  border: "1.5px solid var(--border)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  const btn = e.currentTarget.querySelector(".delete-btn") as HTMLElement;
                  if (btn) btn.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  const btn = e.currentTarget.querySelector(".delete-btn") as HTMLElement;
                  if (btn) btn.style.opacity = "0";
                }}
              >
                {/* Thumbnail — logo or gradient fallback */}
                <div style={{ position: "relative" }}>
                  <BrandThumbnail brandName={campaign.brand_name ?? ""} campaignId={campaign.id} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(campaign); }}
                    title="Delete campaign"
                    style={{
                      position: "absolute", top: 8, right: 8,
                      width: 28, height: 28, borderRadius: 6,
                      background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", opacity: 0, transition: "opacity 0.15s",
                      backdropFilter: "blur(4px)",
                    }}
                    className="delete-btn"
                  >
                    <Trash2 size={13} color="#dc2626" />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0, marginBottom: 2 }}>
                    {displayName}
                  </p>
                  {campaignNames[campaign.id] && campaign.brand_name && (
                    <p style={{ fontSize: 12, color: "var(--hp-blue)", margin: 0, marginBottom: 2, fontWeight: 500 }}>
                      {campaign.brand_name}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, marginBottom: 10 }}>
                    {formatDate(campaign.created_at)}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: bg,
                      color,
                    }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => { if (!deleting) setDeleteTarget(null); }}
        >
          <div
            style={{
              background: "white", borderRadius: 14, padding: 28,
              maxWidth: 400, width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
              Delete campaign?
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px", lineHeight: 1.5 }}>
              <strong>{campaignNames[deleteTarget.id] || deleteTarget.brand_name || "This campaign"}</strong> and all its ideas will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  border: "1.5px solid var(--border)", background: "white", color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={deleteCampaign}
                disabled={deleting}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  border: "none", background: "#dc2626", color: "white", cursor: "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
