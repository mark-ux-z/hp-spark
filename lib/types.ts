export interface Concept {
  name: string;
  tagline: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  imagePrompt: string;
  costMin: number;
  costMax: number;
  traditionalLeadTime: string;
  digitalLeadTime: string;
  traditionalMinOrder: string;
  digitalMinOrder: string;
  traditionalVariants: string;
  digitalVariants: string;
  traditionalCost: string;
  digitalCost: string;
  imageUrl?: string;
}

export type AppView = "form" | "results" | "detail" | "pdf";
export type NavTab = "campaign" | "library";

export type CampaignStatus = "ideation" | "specced" | "in-production" | "launched";

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  ideation:      { label: "Ideation",      color: "#6B7280", bg: "#F3F4F6" },
  specced:       { label: "Specced",       color: "#0073A8", bg: "#E6F4FA" },
  "in-production": { label: "In Production", color: "#B45309", bg: "#FEF3C7" },
  launched:      { label: "Launched",      color: "#065F46", bg: "#D1FAE5" },
};

export const CAMPAIGN_STATUS_ORDER: CampaignStatus[] = ["ideation", "specced", "in-production", "launched"];

export type ProductionSpec = {
  substrate: string;
  finishing: string;
  iccProfile: string;
  renderingIntent: string;
  overprint: boolean;
  spotColour: string;
  checklist: boolean[];
};

export const DEFAULT_PRODUCTION_SPEC: ProductionSpec = {
  substrate: "",
  finishing: "No finish",
  iccProfile: "ISOcoated_v2 (Fogra39)",
  renderingIntent: "Relative Colorimetric",
  overprint: true,
  spotColour: "",
  checklist: [false, false, false, false, false, false],
};

export interface CampaignFormData {
  brandName: string;
  productType: string;
  campaignSeason: string;
  targetAudience: string;
  brandPersonality: string;
  brandColors: string[];
}
