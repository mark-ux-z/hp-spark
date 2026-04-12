import type { CampaignFormData } from "./types";

const strategyDetails: Record<string, string> = {
  VDP: "Variable Data Printing — a generalised marketing campaign using multiple different artwork designs printed across the run (e.g. seasonal variants, limited-edition illustrations, region-specific artworks)",
  QR: "QR Activation — packaging with a scannable QR code that drives customer engagement: competitions, feedback surveys, loyalty rewards, or exclusive digital content unlocks",
  Personalized: "Personalised Packaging — each individual pack is unique, printed with a customer's own name, personal message, or custom data using HP Indigo's variable data capabilities",
};

export function buildConceptGenerationPrompt(form: CampaignFormData): string {
  const colorLine = form.brandColors.length === 1
    ? `- Brand colour: ${form.brandColors[0]}`
    : `- Brand colours: ${form.brandColors.join(", ")} (use these as the gradient palette)`;

  return `Generate exactly 3 HP Indigo digital packaging campaign concepts for the following brand.

BRAND BRIEF:
- Brand: ${form.brandName}
- Product type: ${form.productType}
- Campaign season: ${form.campaignSeason}
- Target audience: ${form.targetAudience}
- Brand personality: ${form.brandPersonality || `${form.brandName} — an FMCG brand`}
- ${colorLine}

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

const strategyVisualHints: Record<string, string> = {
  VDP: "Show 3–4 packs side by side, each with a distinctly different artwork design or colour variant to emphasise the range of designs in the print run.",
  QR: "Show a single pack with a clearly visible, well-designed QR code printed on the label. The QR code should look intentional and premium, integrated into the packaging design.",
  Personalized: "Show 2–3 packs together where each pack has a different person's name or personalised message printed on the label, making the individuality obvious.",
};

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
  const visualHint = strategyVisualHints[strategyType] ?? strategyVisualHints.VDP;
  return `Photorealistic FMCG packaging mockup for "${brandName}". Concept: "${ideaTitle}". ${visualHint} Shot: ${shot}. Mood: ${mood}. Finish: ${finish}. Brand name "${brandName}" clearly visible on pack. HP Indigo print quality.`;
}
