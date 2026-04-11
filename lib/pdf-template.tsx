import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Idea, Campaign } from "./supabase";

// ─── Styles ──────────────────────────────────────────────────────────────────

const HP_BLUE = "#0096D6";
const HP_BLUE_DARK = "#0073A8";
const COOL_GREY = "#F1F1F1";
const DARK_SLATE = "#212121";
const MUTED = "#6B7280";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK_SLATE,
    backgroundColor: WHITE,
    paddingTop: 0,
    paddingBottom: 40,
  },

  // ── Cover band ──
  coverBand: {
    backgroundColor: HP_BLUE,
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coverLogo: {
    width: 36,
    height: 36,
    backgroundColor: WHITE,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  coverLogoText: {
    color: HP_BLUE,
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
  },
  coverBrandGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  coverTitle: {
    color: WHITE,
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  coverSub: { color: "#C9E9F7", fontSize: 9 },
  coverDate: { color: "#C9E9F7", fontSize: 8 },

  // ── Campaign hero ──
  hero: {
    backgroundColor: COOL_GREY,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  heroLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  heroBrand: { fontFamily: "Helvetica-Bold", fontSize: 22, color: DARK_SLATE },
  heroContext: { fontSize: 10, color: MUTED, marginTop: 4 },
  heroBadge: {
    marginTop: 10,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    backgroundColor: HP_BLUE,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: { color: WHITE, fontSize: 8, fontFamily: "Helvetica-Bold" },

  // ── Section header ──
  sectionHeader: {
    backgroundColor: HP_BLUE_DARK,
    paddingHorizontal: 40,
    paddingVertical: 8,
    marginBottom: 0,
  },
  sectionHeaderText: {
    color: WHITE,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Idea card ──
  ideaWrapper: {
    marginHorizontal: 40,
    marginTop: 20,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: "hidden",
  },
  ideaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COOL_GREY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  ideaStrategyPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ideaStrategyText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  ideaRevisions: { fontSize: 8, color: MUTED },
  ideaBody: { padding: 16 },
  ideaTitle: { fontFamily: "Helvetica-Bold", fontSize: 13, marginBottom: 6, color: DARK_SLATE },
  ideaDesc: { fontSize: 10, color: MUTED, lineHeight: 1.5 },

  // ── Mockup ──
  mockupWrapper: {
    marginTop: 12,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },
  mockupImage: { width: "100%", maxHeight: 220, objectFit: "contain" },
  mockupCaption: { fontSize: 7, color: MUTED, textAlign: "center", paddingVertical: 4 },

  // ── Feedback history ──
  historySection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  historyLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  historyItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  historyDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: HP_BLUE, marginTop: 3 },
  historyText: { fontSize: 9, color: DARK_SLATE, flex: 1 },
  historyDate: { fontSize: 7, color: MUTED },

  // ── Execution guide ──
  execSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: HP_BLUE,
  },
  execTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, color: HP_BLUE, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  execStep: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  execStepNum: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: HP_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  execStepNumText: { color: WHITE, fontSize: 7, fontFamily: "Helvetica-Bold" },
  execStepBody: { flex: 1 },
  execStepTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, color: DARK_SLATE, marginBottom: 2 },
  execStepDesc: { fontSize: 8, color: MUTED, lineHeight: 1.5 },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerLeft: { fontSize: 7, color: MUTED },
  footerRight: { fontSize: 7, color: MUTED },
});

// ─── Execution instructions per strategy ─────────────────────────────────────

type Step = { title: string; desc: string };

const execSteps: Record<string, Step[]> = {
  VDP: [
    { title: "Prepare your data file", desc: "Export your customer/region database as a CSV with columns for each variable field (name, location, offer code, etc.). Clean for duplicates and special characters." },
    { title: "Build the variable template", desc: "In your design tool (InDesign / HP SmartStream), create the base layout. Define variable text and image frames — link each frame to the corresponding CSV column." },
    { title: "Preflight the variable set", desc: "Run a preflight check across the full data set. Verify fonts are embedded, image resolution ≥ 300 dpi, and all variables resolve without overflow." },
    { title: "Submit to HP Indigo press", desc: "Export a VDP-ready PDF/VT job package. Send to your HP Indigo operator with the data file, confirming substrate, ink profile, and quantity per variant." },
    { title: "Quality control pull", desc: "Request a printed proof of at least 3 representative variants before the full run. Sign off on colour accuracy and variable field placement." },
    { title: "Fulfilment & tracking", desc: "Use the unique identifiers in the data set to route each personalised piece to the correct recipient. Track scan/open rates to measure campaign effectiveness." },
  ],
  QR: [
    { title: "Define QR destinations", desc: "For each print piece, determine the landing URL (personalised page, video, product page). Use a QR management platform (e.g. Flowcode, Bitly) to generate trackable short URLs." },
    { title: "Generate & test QR codes", desc: "Export QR codes at minimum 2 cm × 2 cm. Test scan on iOS and Android in both bright and low-light conditions before embedding in artwork." },
    { title: "Integrate QR into artwork", desc: "Place the QR code with a clear quiet zone (white border ≥ 4 modules). Add a short CTA beneath: 'Scan to claim your offer'. Ensure sufficient contrast with background." },
    { title: "Preflight for print", desc: "Flatten QR layer, verify vector-clean edges, and ensure artwork is submitted as press-ready PDF/X-4 with embedded colour profiles." },
    { title: "Print on HP Indigo", desc: "HP Indigo's 7-colour ink set renders QR codes with sharp edges essential for reliable scanning. Confirm gloss coating does not reduce contrast below scanner threshold." },
    { title: "Monitor scan analytics", desc: "Track scan volume, time, and location via your QR dashboard. Use this data to optimise the landing experience and inform future print runs." },
  ],
  Personalized: [
    { title: "Compile recipient data", desc: "Gather your mailing list with first name, personalisation fields, and any segmentation attributes. Validate data quality — names should be title-case, no truncation." },
    { title: "Design the personalisation zone", desc: "Reserve a defined area on the artwork for the personalised name/message. Use a font ≥ 12pt for legibility, HP Indigo renders variable text at full press quality." },
    { title: "Map fields in SmartStream", desc: "In HP SmartStream Designer, import your data file and map each personalised element. Preview at least 10 records to confirm correct rendering across edge cases." },
    { title: "Colour-manage for consistency", desc: "Use ICC profiles matched to your substrate. HP Indigo's digital offset process ensures colour consistency between personalised and non-personalised elements — request a proof." },
    { title: "Run press production", desc: "Schedule the job with your HP Indigo operator. Confirm substrate weight, finish (matte/silk/gloss), and gang-up or individual sheet format." },
    { title: "Dispatch & measure response", desc: "Match dispatch records to your CRM. Personalised print typically delivers 2–5× higher response rates — set up UTM tracking on any digital touchpoints to close the loop." },
  ],
};

// ─── Colour per strategy ─────────────────────────────────────────────────────

const strategyColour: Record<string, { bg: string; text: string }> = {
  VDP:          { bg: "#E6F4FA", text: HP_BLUE_DARK },
  QR:           { bg: "#ECFDF5", text: "#065F46" },
  Personalized: { bg: "#FFF7ED", text: "#C2410C" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function IdeaCard({ idea, index, brandName }: { idea: Idea; index: number; brandName: string }) {
  const sc = strategyColour[idea.strategy_type] ?? strategyColour.VDP;
  const steps = execSteps[idea.strategy_type] ?? execSteps.VDP;
  const revisions = idea.feedback_history?.length ?? 0;

  return (
    <View style={s.ideaWrapper} wrap={false}>
      {/* Card header */}
      <View style={s.ideaHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: MUTED }}>
            IDEA {index + 1}
          </Text>
          <View style={[s.ideaStrategyPill, { backgroundColor: sc.bg }]}>
            <Text style={[s.ideaStrategyText, { color: sc.text }]}>
              {idea.strategy_type === "VDP" ? "Variable Data" : idea.strategy_type === "QR" ? "QR Integration" : "Personalized"}
            </Text>
          </View>
        </View>
        {revisions > 0 && (
          <Text style={s.ideaRevisions}>{revisions} revision{revisions > 1 ? "s" : ""}</Text>
        )}
      </View>

      <View style={s.ideaBody}>
        {/* Title & description */}
        <Text style={s.ideaTitle}>{idea.title}</Text>
        <Text style={s.ideaDesc}>{idea.description}</Text>

        {/* Mockup image */}
        {idea.mockup_url && idea.mockup_url.startsWith("data:image") && (
          <View style={s.mockupWrapper}>
            <Image src={idea.mockup_url} style={s.mockupImage} />
            <Text style={s.mockupCaption}>AI-generated packaging mockup — HP Indigo quality output</Text>
          </View>
        )}

        {/* Feedback history */}
        {revisions > 0 && (
          <View style={s.historySection}>
            <Text style={s.historyLabel}>Revision history</Text>
            {idea.feedback_history?.map((fb, i) => (
              <View key={i} style={s.historyItem}>
                <View style={s.historyDot} />
                <Text style={s.historyText}>"{fb.text}"</Text>
                <Text style={s.historyDate}>
                  {new Date(fb.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Execution guide */}
        <View style={s.execSection}>
          <Text style={s.execTitle}>Execution guide — {idea.strategy_type} campaign</Text>
          {steps.map((step, i) => (
            <View key={i} style={s.execStep}>
              <View style={s.execStepNum}>
                <Text style={s.execStepNumText}>{i + 1}</Text>
              </View>
              <View style={s.execStepBody}>
                <Text style={s.execStepTitle}>{step.title}</Text>
                <Text style={s.execStepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Main document ────────────────────────────────────────────────────────────

export function CampaignPDF({ campaign, ideas }: { campaign: Campaign; ideas: Idea[] }) {
  const date = new Date(campaign.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Document
      title={`${campaign.brand_name} — HP Spark Campaign Brief`}
      author="HP Spark"
      subject="Digital Printing Campaign Brief"
    >
      <Page size="A4" style={s.page}>
        {/* Top bar */}
        <View style={s.coverBand} fixed>
          <View style={s.coverBrandGroup}>
            <View style={s.coverLogo}>
              <Text style={s.coverLogoText}>HP</Text>
            </View>
            <View>
              <Text style={s.coverTitle}>HP Spark — Campaign Brief</Text>
              <Text style={s.coverSub}>HP Indigo Digital Printing · Marketing Ideation Platform</Text>
            </View>
          </View>
          <Text style={s.coverDate}>Generated {date}</Text>
        </View>

        {/* Campaign hero */}
        <View style={s.hero}>
          <Text style={s.heroLabel}>Brand</Text>
          <Text style={s.heroBrand}>{campaign.brand_name}</Text>
          {campaign.brand_context && (
            <Text style={s.heroContext}>{campaign.brand_context}</Text>
          )}
          <View style={s.heroBadge}>
            <View style={s.badge}>
              <Text style={s.badgeText}>{ideas.length} Campaign Ideas</Text>
            </View>
            <View style={[s.badge, { backgroundColor: "#065F46" }]}>
              <Text style={s.badgeText}>HP Indigo Ready</Text>
            </View>
          </View>
        </View>

        {/* Section header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionHeaderText}>Campaign Ideas &amp; Execution Briefs</Text>
        </View>

        {/* Ideas */}
        {ideas.map((idea, i) => (
          <IdeaCard key={idea.id} idea={idea} index={i} brandName={campaign.brand_name ?? ""} />
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>HP Spark — Confidential Campaign Brief · {campaign.brand_name}</Text>
          <Text style={s.footerRight} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}
