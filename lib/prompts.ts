import type { CampaignFormData } from "./types";

const strategyDetails: Record<string, string> = {
  VDP: "Variable Data Printing — each pack is unique, personalised with names, messages, or data",
  QR: "QR-enabled packaging — scannable codes unlock digital experiences, competitions, or content",
  Personalized: "Personalised limited edition — small-batch runs with location, season, or story-driven variants",
};

export function buildConceptGenerationPrompt(form: CampaignFormData): string {
  const isNutella = form.brandName.toLowerCase().includes("nutella");

  const nutellaContext = isNutella
    ? `\nBRAND CONTEXT: Nutella is made by Ferrero. Its iconic packaging is a cream jar with a bold red label. Ferrero has run city name and personal name limited edition jar campaigns. Christmas is their biggest gifting season. The jar is the canvas.`
    : "";

  return `Generate exactly 3 HP Indigo digital packaging campaign concepts for the following brand.${nutellaContext}

BRAND BRIEF:
- Brand: ${form.brandName}
- Product type: ${form.productType}
- Campaign season: ${form.campaignSeason}
- Target audience: ${form.targetAudience}
- Brand personality: ${form.brandPersonality}
- Primary brand colour: ${form.selectedColor}

Return ONLY a valid JSON array of exactly 3 objects. No markdown. No explanation. Schema:
[
  {
    "name": "3-5 word concept name",
    "tagline": "under 10 words",
    "description": "2-3 sentences about the concept",
    "gradientFrom": "#hexcolor",
    "gradientTo": "#hexcolor",
    "imagePrompt": "60-80 word photorealistic product photography prompt, white background, no text on packaging",
    "costMin": 1500,
    "costMax": 3200,
    "traditionalLeadTime": "6-8 weeks",
    "digitalLeadTime": "1-2 weeks",
    "traditionalMinOrder": "10,000 units",
    "digitalMinOrder": "500 units",
    "traditionalVariants": "1 design",
    "digitalVariants": "Unlimited",
    "traditionalCost": "€8,000+",
    "digitalCost": "€1,800 – €3,200"
  }
]`;
}

// Keep existing prompt builders for campaign/[id] flow
export function buildIdeaGenerationPrompt(
  brandName: string,
  brandContext: string,
  filenames: string[]
): string {
  const fileInfo = filenames.length
    ? `\nUploaded brand assets: ${filenames.join(", ")}`
    : "";
  return `Generate 3 HP Indigo campaign ideas for ${brandName}. Context: ${brandContext}.${fileInfo}
Return JSON array: [{"title":"...","description":"2 sentences.","strategy_type":"VDP"|"QR"|"Personalized"}]`;
}

export function buildIdeaRefinementPrompt(
  title: string,
  description: string,
  strategyType: string,
  feedbackHistory: { text: string; timestamp: string }[],
  newFeedback: string
): string {
  const lastFeedback = feedbackHistory.slice(-1);
  return `Refine this HP Indigo campaign idea based on new feedback.\n\nCurrent: "${title}" — ${description}\n${lastFeedback.length ? `Previous feedback: "${lastFeedback[0].text}"` : ""}\nNew feedback: "${newFeedback}"\n\nReturn JSON: {"title":"...","description":"2 sentences.","strategy_type":"${strategyType}"}`;
}

export interface MockupStyle {
  shot: string;
  mood: string;
  finish: string;
}

export function buildMockupPrompt(
  brandName: string,
  ideaTitle: string,
  ideaDescription: string,
  strategyType: string,
  style?: MockupStyle
): string {
  const shot = style?.shot ?? "Studio";
  const mood = style?.mood ?? "Clean & Bright";
  const finish = style?.finish ?? "Glossy";
  return `Photorealistic FMCG packaging mockup for "${brandName}". Concept: "${ideaTitle}". Strategy: ${strategyDetails[strategyType] ?? strategyDetails.VDP}. Shot: ${shot}. Mood: ${mood}. Finish: ${finish}. Brand name "${brandName}" clearly visible on pack. HP Indigo print quality.`;
}
