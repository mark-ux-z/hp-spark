export function buildIdeaGenerationPrompt(
  brandName: string,
  brandContext: string,
  filenames: string[]
): string {
  return `3 campaign ideas for "${brandName}" (${brandContext})${filenames.length ? `. Assets: ${filenames.join(", ")}` : ""}.

Return JSON array with exactly 3 objects, one per strategy_type (VDP, QR, Personalized):
[{"title":"...","description":"2 sentences.","strategy_type":"VDP"|"QR"|"Personalized"}]`;
}

export function buildIdeaRefinementPrompt(
  title: string,
  description: string,
  strategyType: string,
  feedbackHistory: { text: string; timestamp: string }[],
  newFeedback: string
): string {
  // Only send the last feedback item to save tokens
  const lastFeedback = feedbackHistory.slice(-1);
  return `Refine this HP Indigo campaign idea based on new feedback.

Current: "${title}" — ${description}
${lastFeedback.length ? `Previous feedback: "${lastFeedback[0].text}"` : ""}
New feedback: "${newFeedback}"

Return JSON: {"title":"...","description":"2 sentences.","strategy_type":"${strategyType}"}`;
}

const strategyDetails: Record<string, string> = {
  VDP: "variable data printed packaging with personalised regional content",
  QR: "packaging with a prominent scannable QR code elegantly integrated",
  Personalized: "packaging with the customer's name printed on the label",
};

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
