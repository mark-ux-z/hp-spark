import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { Idea, Campaign, CampaignBudget } from "./supabase";
import { ProductionSpec, DEFAULT_PRODUCTION_SPEC } from "./types";

// ─── Palette ──────────────────────────────────────────────────────────────────

const HP_BLUE      = "#0096D6";
const HP_DARK      = "#002D72";
const HP_MID       = "#0073A8";
const COOL_GREY    = "#F4F6F8";
const BORDER       = "#E2E8F0";
const DARK_SLATE   = "#1A202C";
const MUTED        = "#718096";
const WHITE        = "#FFFFFF";
const SUCCESS      = "#065F46";

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK_SLATE,
    backgroundColor: WHITE,
    paddingBottom: 48,
  },

  // ── Top bar (fixed on every page) ──
  topBar: {
    backgroundColor: HP_DARK,
    paddingHorizontal: 40,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarLeft: { flexDirection: "row", alignItems: "center" },
  topBarLogo: {
    width: 28, height: 28,
    backgroundColor: WHITE,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  topBarLogoText: { color: HP_DARK, fontFamily: "Helvetica-Bold", fontSize: 11 },
  topBarTitle: { color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 11 },
  topBarSub:   { color: "#93C5FD", fontSize: 8, marginTop: 1 },
  topBarDate:  { color: "#93C5FD", fontSize: 8 },

  // ── Footer (fixed) ──
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
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: MUTED },

  // ── Cover page ──
  coverPage: {
    backgroundColor: HP_DARK,
    flex: 1,
    paddingHorizontal: 56,
    paddingVertical: 64,
    justifyContent: "space-between",
  },
  coverLogoBox: {
    width: 52, height: 52,
    backgroundColor: WHITE,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  coverLogoText:  { color: HP_DARK, fontFamily: "Helvetica-Bold", fontSize: 22 },
  coverLabel:     { color: "#93C5FD", fontSize: 10, letterSpacing: 2, marginBottom: 12 },
  coverBrandName: { color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 44, lineHeight: 1.1, marginBottom: 8 },
  coverSubtitle:  { color: "#BAE6FD", fontSize: 14, marginBottom: 40 },
  coverDivider:   { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 28 },
  coverMeta:      { flexDirection: "row" },
  coverMetaItem:  { marginRight: 40 },
  coverMetaLabel: { color: "#93C5FD", fontSize: 8, letterSpacing: 1, marginBottom: 4 },
  coverMetaValue: { color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 11 },
  coverFooter:    { color: "rgba(255,255,255,0.35)", fontSize: 8 },

  // ── Section divider ──
  sectionBar: {
    backgroundColor: HP_MID,
    paddingHorizontal: 40,
    paddingVertical: 7,
    marginBottom: 4,
  },
  sectionBarText: {
    color: WHITE,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1,
  },

  // ── Campaign hero ──
  hero: {
    backgroundColor: COOL_GREY,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: HP_BLUE,
    marginBottom: 4,
  },
  heroLabel:   { fontSize: 8, color: MUTED, letterSpacing: 1, marginBottom: 4 },
  heroBrand:   { fontFamily: "Helvetica-Bold", fontSize: 26, color: HP_DARK, marginBottom: 4 },
  heroContext: { fontSize: 9, color: MUTED, lineHeight: 1.5, marginBottom: 12 },
  heroBadge: {
    backgroundColor: SUCCESS,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  heroBadgeText: { color: WHITE, fontSize: 8, fontFamily: "Helvetica-Bold" },

  // ── Idea card ──
  ideaWrapper: {
    marginHorizontal: 40,
    marginTop: 16,
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
  ideaHeaderLeft: { flexDirection: "row", alignItems: "center" },
  ideaNum:     { fontFamily: "Helvetica-Bold", fontSize: 8, color: MUTED, marginRight: 8 },
  strategyPill: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  strategyPillText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  ideaRevisions: { fontSize: 8, color: MUTED },
  ideaBody: { padding: 16 },
  ideaTitle: { fontFamily: "Helvetica-Bold", fontSize: 14, color: DARK_SLATE, marginBottom: 6 },
  ideaDesc:  { fontSize: 10, color: MUTED, lineHeight: 1.55 },

  // ── Mockup ──
  mockupWrapper: {
    marginTop: 14,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
  },
  mockupImage: {
    width: "100%",
    height: 210,
    objectFit: "cover",
    objectPosition: "center",
  },
  mockupCaption: { fontSize: 7, color: MUTED, textAlign: "center", paddingVertical: 5, backgroundColor: COOL_GREY },

  // ── Exec context bar (shows idea identity at top of execution section) ──
  execContextBar: {
    backgroundColor: COOL_GREY,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: HP_BLUE,
  },
  execContextText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED },

  // ── Revision history ──
  historySection: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  historyLabel:   { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 0.5, marginBottom: 8 },
  historyRow:     { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  historyDot:     { width: 4, height: 4, borderRadius: 2, backgroundColor: HP_BLUE, marginTop: 3, marginRight: 8 },
  historyText:    { fontSize: 9, color: DARK_SLATE, flex: 1 },
  historyDate:    { fontSize: 7, color: MUTED },

  // ── Execution guide ──
  execSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: HP_BLUE },
  execTitle:   { fontFamily: "Helvetica-Bold", fontSize: 9, color: HP_BLUE, letterSpacing: 0.5, marginBottom: 10 },
  execRow:     { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  execNumBox:  {
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: HP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  execNumText:  { color: WHITE, fontSize: 7, fontFamily: "Helvetica-Bold" },
  execStepBody: { flex: 1 },
  execStepTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, color: DARK_SLATE, marginBottom: 2 },
  execStepDesc:  { fontSize: 8, color: MUTED, lineHeight: 1.5 },

  // ── Packaging spec table ──
  specTableHeader: { backgroundColor: HP_BLUE, paddingHorizontal: 12, paddingVertical: 6 },
  specTableHeaderText: { color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 0.5 },
  specRow: { flexDirection: "row" },
  specRowLabel: {
    width: "35%",
    backgroundColor: COOL_GREY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  specRowLabelText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED },
  specRowValue: { width: "65%", paddingHorizontal: 10, paddingVertical: 5 },
  specRowValueText: { fontSize: 8, color: DARK_SLATE },

  // ── Two-col table (tech spec page) ──
  tcLabel: {
    width: "38%",
    backgroundColor: COOL_GREY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  tcValue: { width: "62%", paddingHorizontal: 10, paddingVertical: 5 },
  tcLabelText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED },
  tcValueText: { fontSize: 8, color: DARK_SLATE },
});

// ─── Strategy colours ─────────────────────────────────────────────────────────

const STRATEGY_COLOUR: Record<string, { bg: string; text: string }> = {
  VDP:          { bg: "#DBEAFE", text: "#1D4ED8" },
  QR:           { bg: "#DCFCE7", text: "#166534" },
  Personalized: { bg: "#FEF3C7", text: "#92400E" },
};

const STRATEGY_LABEL: Record<string, string> = {
  VDP:          "Variable Data",
  QR:           "QR Integration",
  Personalized: "Personalised",
};

// ─── Execution steps ──────────────────────────────────────────────────────────

const EXEC_STEPS: Record<string, { title: string; desc: string }[]> = {
  VDP: [
    { title: "Prepare your data file",     desc: "Export your customer/region database as a CSV with columns for each variable field (name, location, offer code). Clean for duplicates and special characters." },
    { title: "Build the variable template", desc: "In InDesign or HP SmartStream, create the base layout. Define variable text and image frames — link each frame to the corresponding CSV column." },
    { title: "Preflight the variable set",  desc: "Run a preflight check across the full data set. Verify fonts are embedded, image resolution is 300 dpi minimum, and all variables resolve without overflow." },
    { title: "Submit to HP Indigo press",   desc: "Export a VDP-ready PDF/VT job package. Send to your HP Indigo operator with the data file, confirming substrate, ink profile, and quantity per variant." },
    { title: "Quality control pull",        desc: "Request a printed proof of at least 3 representative variants before the full run. Sign off on colour accuracy and variable field placement." },
    { title: "Fulfilment and tracking",     desc: "Use the unique identifiers in the data set to route each personalised piece to the correct recipient. Track scan/open rates to measure campaign effectiveness." },
  ],
  QR: [
    { title: "Define QR destinations",     desc: "For each print piece, determine the landing URL. Use a QR management platform (e.g. Flowcode, Bitly) to generate trackable short URLs." },
    { title: "Generate and test QR codes", desc: "Export QR codes at minimum 2 cm x 2 cm. Test scan on iOS and Android in both bright and low-light conditions before embedding in artwork." },
    { title: "Integrate QR into artwork",  desc: "Place the QR code with a clear quiet zone (white border 4 modules minimum). Add a short call-to-action beneath. Ensure sufficient contrast with background." },
    { title: "Preflight for print",        desc: "Flatten QR layer, verify vector-clean edges, and ensure artwork is submitted as press-ready PDF/X-4 with embedded colour profiles." },
    { title: "Print on HP Indigo",         desc: "HP Indigo's ink set renders QR codes with sharp edges essential for reliable scanning. Confirm gloss coating does not reduce contrast below scanner threshold." },
    { title: "Monitor scan analytics",     desc: "Track scan volume, time, and location via your QR dashboard. Use this data to optimise the landing experience and inform future print runs." },
  ],
  Personalized: [
    { title: "Compile recipient data",        desc: "Gather your mailing list with first name, personalisation fields, and segmentation attributes. Validate data quality — names should be title-case, no truncation." },
    { title: "Design the personalisation zone", desc: "Reserve a defined area on the artwork for the personalised name/message. Use a font 12pt or larger for legibility. HP Indigo renders variable text at full press quality." },
    { title: "Map fields in SmartStream",     desc: "In HP SmartStream Designer, import your data file and map each personalised element. Preview at least 10 records to confirm correct rendering across edge cases." },
    { title: "Colour-manage for consistency", desc: "Use ICC profiles matched to your substrate. HP Indigo's digital offset process ensures colour consistency between personalised and static elements — request a proof." },
    { title: "Run press production",          desc: "Schedule the job with your HP Indigo operator. Confirm substrate weight, finish (matte/silk/gloss), and gang-up or individual sheet format." },
    { title: "Dispatch and measure response", desc: "Match dispatch records to your CRM. Personalised print typically delivers 2-5x higher response rates — set up UTM tracking on digital touchpoints to close the loop." },
  ],
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function TopBar({ title, sub, right }: { title: string; sub: string; right: string }) {
  return (
    <View style={s.topBar} fixed>
      <View style={s.topBarLeft}>
        <View style={s.topBarLogo}>
          <Text style={s.topBarLogoText}>HP</Text>
        </View>
        <View>
          <Text style={s.topBarTitle}>{title}</Text>
          <Text style={s.topBarSub}>{sub}</Text>
        </View>
      </View>
      <Text style={s.topBarDate}>{right}</Text>
    </View>
  );
}

function Footer({ left }: { left: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{left}</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

function SpecRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.specRow, { borderBottomWidth: last ? 0 : 1, borderBottomColor: BORDER }]}>
      <View style={s.specRowLabel}><Text style={s.specRowLabelText}>{label}</Text></View>
      <View style={s.specRowValue}><Text style={s.specRowValueText}>{value || "—"}</Text></View>
    </View>
  );
}

function TwoColRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: "row", borderBottomWidth: last ? 0 : 1, borderBottomColor: BORDER }}>
      <View style={s.tcLabel}><Text style={s.tcLabelText}>{label}</Text></View>
      <View style={s.tcValue}><Text style={s.tcValueText}>{value || "—"}</Text></View>
    </View>
  );
}

function MiniSectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: HP_MID, letterSpacing: 0.5, marginBottom: 6, marginTop: 2 }}>
      {children.toUpperCase()}
    </Text>
  );
}

// ─── PackagingSpec type ───────────────────────────────────────────────────────

type PackagingSpec = {
  type: string;
  label: string;
  width: number;
  height: number;
  depth?: number;
  unit: string;
};

// ─── Idea card (campaign brief page) ─────────────────────────────────────────

function IdeaCard({ idea, index, packagingSpec }: {
  idea: Idea;
  index: number;
  packagingSpec?: PackagingSpec | null;
}) {
  const sc    = STRATEGY_COLOUR[idea.strategy_type] ?? STRATEGY_COLOUR.VDP;
  const steps = EXEC_STEPS[idea.strategy_type] ?? EXEC_STEPS.VDP;
  const revisions = idea.feedback_history?.length ?? 0;
  const dims = packagingSpec && packagingSpec.type !== "none"
    ? (packagingSpec.depth
        ? `${packagingSpec.width} x ${packagingSpec.height} x ${packagingSpec.depth} ${packagingSpec.unit}`
        : `${packagingSpec.width} x ${packagingSpec.height} ${packagingSpec.unit}`)
    : null;

  return (
    // break forces each idea (after the first) onto a new page
    <View style={s.ideaWrapper} break={index > 0}>

      {/* Header — always keep together */}
      <View style={s.ideaHeader} wrap={false}>
        <View style={s.ideaHeaderLeft}>
          <Text style={s.ideaNum}>IDEA {index + 1}</Text>
          <View style={[s.strategyPill, { backgroundColor: sc.bg }]}>
            <Text style={[s.strategyPillText, { color: sc.text }]}>
              {STRATEGY_LABEL[idea.strategy_type] ?? idea.strategy_type}
            </Text>
          </View>
        </View>
        {revisions > 0 && (
          <Text style={s.ideaRevisions}>{revisions} revision{revisions > 1 ? "s" : ""}</Text>
        )}
      </View>

      <View style={s.ideaBody}>

        {/* Title + description — keep together */}
        <View wrap={false}>
          <Text style={s.ideaTitle}>{idea.title}</Text>
          <Text style={s.ideaDesc}>{idea.description}</Text>
        </View>

        {/* Mockup — cover crop like the app */}
        {idea.mockup_url && idea.mockup_url.startsWith("data:image") && (
          <View style={s.mockupWrapper} wrap={false}>
            <Image src={idea.mockup_url} style={s.mockupImage} />
            <Text style={s.mockupCaption}>AI-generated packaging mockup — HP Indigo quality output</Text>
          </View>
        )}

        {/* Revision history */}
        {revisions > 0 && (
          <View style={s.historySection} wrap={false}>
            <Text style={s.historyLabel}>REVISION HISTORY</Text>
            {idea.feedback_history?.map((fb, i) => (
              <View key={i} style={s.historyRow}>
                <View style={s.historyDot} />
                <Text style={s.historyText}>"{fb.text}"</Text>
                <Text style={s.historyDate}>
                  {new Date(fb.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Packaging spec */}
        {packagingSpec && packagingSpec.type !== "none" && (
          <View style={{ marginTop: 14, borderWidth: 1, borderColor: HP_BLUE, borderRadius: 6, overflow: "hidden" }} wrap={false}>
            <View style={s.specTableHeader}>
              <Text style={s.specTableHeaderText}>Packaging Specifications — HP Indigo 6900</Text>
            </View>
            <SpecRow label="Packaging type" value={packagingSpec.label} />
            <SpecRow label="Dimensions"     value={dims ?? ""} />
            <SpecRow label="Bleed"          value="3 mm (all edges)" />
            <SpecRow label="Safe zone"      value="3 mm inset from trim" />
            <SpecRow label="HP Indigo"      value="HP Indigo 6900 Digital Press" />
            <SpecRow label="Max sheet"      value="317 x 464 mm" />
            <SpecRow label="Colour space"   value="CMYK + HP IndiChrome (6-colour)" />
            <SpecRow label="Resolution"     value="300 DPI minimum" />
            <SpecRow label="File format"    value="PDF/X-4, fonts embedded" last />
          </View>
        )}

        {/* Execution guide — context bar keeps idea identity visible if it falls on a new page */}
        <View style={s.execSection}>
          {/* Context bar: always shows idea identity at top of this section */}
          <View style={s.execContextBar} wrap={false}>
            <Text style={s.execContextText}>
              IDEA {index + 1}  —  {idea.title.toUpperCase()}  —  {STRATEGY_LABEL[idea.strategy_type] ?? idea.strategy_type} STRATEGY
            </Text>
          </View>
          <Text style={s.execTitle}>EXECUTION GUIDE</Text>
          {/* Title + first step kept together so heading never orphans */}
          <View wrap={false}>
            <View style={s.execRow}>
              <View style={s.execNumBox}><Text style={s.execNumText}>1</Text></View>
              <View style={s.execStepBody}>
                <Text style={s.execStepTitle}>{steps[0].title}</Text>
                <Text style={s.execStepDesc}>{steps[0].desc}</Text>
              </View>
            </View>
          </View>
          {steps.slice(1).map((step, i) => (
            <View key={i + 1} style={s.execRow} wrap={false}>
              <View style={s.execNumBox}><Text style={s.execNumText}>{i + 2}</Text></View>
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

// ─── Tech spec block (print spec page) ───────────────────────────────────────

const ARTWORK_SPECS = [
  { label: "Bleed",        value: "3 mm (all edges)" },
  { label: "Safe zone",    value: "3 mm inset from trim edge" },
  { label: "Resolution",   value: "300 DPI minimum" },
  { label: "File format",  value: "PDF/X-4" },
  { label: "Fonts",        value: "Embedded (no subset)" },
  { label: "HP Indigo",    value: "HP Indigo 6900 Digital Press" },
  { label: "Max sheet",    value: "317 x 464 mm" },
  { label: "Colour space", value: "CMYK + HP IndiChrome (6-colour)" },
];

function TechSpecBlock({ idea, index, packagingSpec, productionSpec }: {
  idea: Idea;
  index: number;
  packagingSpec?: PackagingSpec | null;
  productionSpec: ProductionSpec;
}) {
  const spec = { ...DEFAULT_PRODUCTION_SPEC, ...productionSpec };
  const sc   = STRATEGY_COLOUR[idea.strategy_type] ?? STRATEGY_COLOUR.VDP;
  const dims = packagingSpec && packagingSpec.type !== "none"
    ? (packagingSpec.depth
        ? `${packagingSpec.width} x ${packagingSpec.height} x ${packagingSpec.depth} ${packagingSpec.unit}`
        : `${packagingSpec.width} x ${packagingSpec.height} ${packagingSpec.unit}`)
    : "—";

  return (
    <View style={{ marginHorizontal: 40, marginTop: 20, borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: "hidden" }} wrap={false}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COOL_GREY, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: MUTED, marginRight: 10 }}>IDEA {index + 1}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, color: DARK_SLATE }}>{idea.title}</Text>
        </View>
        <View style={[s.strategyPill, { backgroundColor: sc.bg }]}>
          <Text style={[s.strategyPillText, { color: sc.text }]}>{STRATEGY_LABEL[idea.strategy_type]}</Text>
        </View>
      </View>

      {/* Two columns */}
      <View style={{ flexDirection: "row", padding: 14 }}>
        {/* Left: Packaging + Colour */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <MiniSectionLabel>Packaging</MiniSectionLabel>
          <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
            <TwoColRow label="Type"       value={packagingSpec?.label ?? "—"} />
            <TwoColRow label="Dimensions" value={dims} />
            <TwoColRow label="Substrate"  value={spec.substrate} />
            <TwoColRow label="Finishing"  value={spec.finishing} last />
          </View>

          <MiniSectionLabel>Colour Management</MiniSectionLabel>
          <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" }}>
            <TwoColRow label="ICC Profile"      value={spec.iccProfile} />
            <TwoColRow label="Rendering intent" value={spec.renderingIntent} />
            <TwoColRow label="Overprint"        value={spec.overprint ? "Enabled" : "Disabled"} />
            <TwoColRow label="Spot colour"      value={spec.spotColour || "None"} last />
          </View>
        </View>

        {/* Right: Artwork Specs */}
        <View style={{ flex: 1 }}>
          <MiniSectionLabel>Artwork Specifications</MiniSectionLabel>
          <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" }}>
            {ARTWORK_SPECS.map((row, i) => (
              <TwoColRow key={row.label} label={row.label} value={row.value} last={i === ARTWORK_SPECS.length - 1} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Main document ────────────────────────────────────────────────────────────

function budgetSummary(b: CampaignBudget | null | undefined): { range: string; runSize: string; cpu: string } | null {
  if (!b) return null;
  const bMin = parseFloat(b.budgetMin);
  const bMax = parseFloat(b.budgetMax);
  const run  = parseFloat(b.runSize);
  const hasMin = !isNaN(bMin) && b.budgetMin;
  const hasMax = !isNaN(bMax) && b.budgetMax;
  const range = (hasMin && hasMax)
    ? `EUR ${bMin.toLocaleString("en-GB")} - ${bMax.toLocaleString("en-GB")}`
    : hasMin ? `From EUR ${bMin.toLocaleString("en-GB")}`
    : hasMax ? `Up to EUR ${bMax.toLocaleString("en-GB")}`
    : "";
  const runLabel = (!isNaN(run) && b.runSize) ? `${run.toLocaleString("en-GB")} units` : "";
  const cpuLo = (hasMin && !isNaN(run) && run > 0) ? bMin / run : null;
  const cpuHi = (hasMax && !isNaN(run) && run > 0) ? bMax / run : null;
  const cpu = (cpuLo !== null && cpuHi !== null)
    ? `EUR ${cpuLo.toFixed(3)} - ${cpuHi.toFixed(3)} / unit`
    : cpuLo !== null ? `EUR ${cpuLo.toFixed(3)} / unit`
    : cpuHi !== null ? `EUR ${cpuHi.toFixed(3)} / unit`
    : "";
  if (!range && !runLabel) return null;
  return { range, runSize: runLabel, cpu };
}

export function CampaignPDF({ campaign, ideas, packagingSpecs, productionSpecs, budget }: {
  campaign: Campaign;
  ideas: Idea[];
  packagingSpecs?: Record<string, PackagingSpec>;
  productionSpecs?: Record<string, ProductionSpec>;
  budget?: CampaignBudget | null;
}) {
  const date = new Date(campaign.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const strategyTypes = [...new Set(ideas.map((i) => STRATEGY_LABEL[i.strategy_type] ?? i.strategy_type))].join(", ");
  const budgetInfo = budgetSummary(budget);

  return (
    <Document
      title={`${campaign.brand_name} — HP Spark Campaign Brief`}
      author="HP Spark"
      subject="Digital Printing Campaign Brief"
    >
      {/* ── Cover page ── */}
      <Page size="A4" style={{ fontFamily: "Helvetica", backgroundColor: WHITE }}>
        <View style={s.coverPage}>
          {/* Top */}
          <View>
            <View style={s.coverLogoBox}>
              <Text style={s.coverLogoText}>HP</Text>
            </View>
            <Text style={s.coverLabel}>HP CAMPAIGN STUDIO</Text>
            <Text style={s.coverBrandName}>{campaign.brand_name}</Text>
            <Text style={s.coverSubtitle}>Digital Packaging Campaign Brief</Text>
            <View style={s.coverDivider} />
            <View style={s.coverMeta}>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>CAMPAIGN IDEAS</Text>
                <Text style={s.coverMetaValue}>{ideas.length}</Text>
              </View>
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>STRATEGIES</Text>
                <Text style={s.coverMetaValue}>{strategyTypes}</Text>
              </View>
              {budgetInfo?.range ? (
                <View style={s.coverMetaItem}>
                  <Text style={s.coverMetaLabel}>BUDGET</Text>
                  <Text style={s.coverMetaValue}>{budgetInfo.range}</Text>
                </View>
              ) : null}
              <View style={s.coverMetaItem}>
                <Text style={s.coverMetaLabel}>GENERATED</Text>
                <Text style={s.coverMetaValue}>{date}</Text>
              </View>
            </View>
          </View>

          {/* Bottom */}
          <View>
            <View style={s.coverDivider} />
            <Text style={s.coverFooter}>
              HP Spark — Powered by HP Indigo Digital Printing Technology{"\n"}
              Confidential — prepared for {campaign.brand_name}
            </Text>
          </View>
        </View>
      </Page>

      {/* ── Campaign brief page ── */}
      <Page size="A4" style={s.page}>
        <TopBar
          title="HP Spark — Campaign Brief"
          sub="HP Indigo Digital Printing"
          right={`Generated ${date}`}
        />

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroLabel}>BRAND</Text>
          <Text style={s.heroBrand}>{campaign.brand_name}</Text>
          {campaign.brand_context && (
            <Text style={s.heroContext}>{campaign.brand_context}</Text>
          )}
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>HP Indigo Ready</Text>
          </View>
        </View>

        <View style={s.sectionBar}>
          <Text style={s.sectionBarText}>CAMPAIGN IDEAS AND EXECUTION BRIEFS</Text>
        </View>

        {ideas.map((idea, i) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            index={i}
            packagingSpec={packagingSpecs?.[idea.id]}
          />
        ))}

        <Footer left={`HP Spark — Campaign Brief  |  ${campaign.brand_name}`} />
      </Page>

      {/* ── Technical Print Specification page ── */}
      <Page size="A4" style={s.page}>
        <TopBar
          title="HP Spark — Technical Print Specification"
          sub="HP Indigo 6900 — Production-ready specs"
          right={campaign.brand_name ?? ""}
        />

        <View style={s.sectionBar}>
          <Text style={s.sectionBarText}>TECHNICAL PRINT SPECIFICATION — ALL IDEAS</Text>
        </View>

        {ideas.map((idea, i) => (
          <TechSpecBlock
            key={idea.id}
            idea={idea}
            index={i}
            packagingSpec={packagingSpecs?.[idea.id]}
            productionSpec={productionSpecs?.[idea.id] ?? DEFAULT_PRODUCTION_SPEC}
          />
        ))}

        {/* Budget overview block */}
        {budgetInfo && (
          <View style={{ marginHorizontal: 40, marginTop: 20, borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: "hidden" }} wrap={false}>
            <View style={{ backgroundColor: HP_MID, paddingHorizontal: 16, paddingVertical: 8 }}>
              <Text style={{ color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 9, letterSpacing: 0.5 }}>
                PRODUCTION BUDGET OVERVIEW
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              {budgetInfo.range ? (
                <View style={{ flex: 1, padding: 14, borderRightWidth: 1, borderRightColor: BORDER }}>
                  <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 0.5, marginBottom: 4 }}>TOTAL BUDGET</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: HP_DARK }}>{budgetInfo.range}</Text>
                </View>
              ) : null}
              {budgetInfo.runSize ? (
                <View style={{ flex: 1, padding: 14, borderRightWidth: budgetInfo.cpu ? 1 : 0, borderRightColor: BORDER }}>
                  <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 0.5, marginBottom: 4 }}>EXPECTED RUN SIZE</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: HP_DARK }}>{budgetInfo.runSize}</Text>
                </View>
              ) : null}
              {budgetInfo.cpu ? (
                <View style={{ flex: 1, padding: 14 }}>
                  <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 0.5, marginBottom: 4 }}>EST. COST PER UNIT</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: HP_BLUE }}>{budgetInfo.cpu}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        <Footer left={`HP Spark — Technical Print Specification  |  ${campaign.brand_name}`} />
      </Page>
    </Document>
  );
}
