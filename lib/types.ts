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

export interface CampaignFormData {
  brandName: string;
  productType: string;
  campaignSeason: string;
  targetAudience: string;
  brandPersonality: string;
  selectedColor: string;
}
