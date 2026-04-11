"use client";

const CAMPAIGNS = [
  { name: "Snowflake Collection", subtitle: "Christmas 2025", status: "Presented to board", statusColor: "var(--hp-blue)", statusBg: "var(--light)", from: "#C8102E", to: "#7B3F00" },
  { name: "City Jars — Europe", subtitle: "Christmas 2025", status: "PDF exported", statusColor: "var(--success)", statusBg: "#f0faf7", from: "#002D72", to: "#0096D6" },
  { name: "Warm by the Fire", subtitle: "Christmas 2024", status: "Presented to board", statusColor: "var(--hp-blue)", statusBg: "var(--light)", from: "#7B3F00", to: "#D4A017" },
  { name: "Easter Mornings", subtitle: "Easter 2025", status: "PDF exported", statusColor: "var(--success)", statusBg: "#f0faf7", from: "#2C5F2E", to: "#D4A017" },
  { name: "Summer Picnic Jar", subtitle: "Summer 2025", status: "Draft", statusColor: "var(--warm)", statusBg: "#fff8f0", from: "#F7941D", to: "#D4A017" },
  { name: "Your Name on Nutella", subtitle: "Always-on", status: "Draft", statusColor: "var(--warm)", statusBg: "#fff8f0", from: "#1A1A1A", to: "#C8102E" },
];

const FILTERS = ["All", "Exported", "Draft", "Presented", "Christmas", "Summer"];

export default function LibraryView() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 32, color: "var(--text)", margin: 0, lineHeight: 1.2 }}>
            Brand library
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
            Nutella · Ferrero Group · 6 campaigns
          </p>
        </div>
        <button
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

      {/* Filter pills */}
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

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {CAMPAIGNS.map((campaign) => (
          <div
            key={campaign.name}
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
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                height: 120,
                background: `linear-gradient(135deg, ${campaign.from}, ${campaign.to})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 64,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  backdropFilter: "blur(6px)",
                }}
              />
            </div>

            {/* Body */}
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0, marginBottom: 3 }}>
                {campaign.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, marginBottom: 10 }}>
                {campaign.subtitle}
              </p>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: campaign.statusBg,
                  color: campaign.statusColor,
                }}
              >
                {campaign.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
