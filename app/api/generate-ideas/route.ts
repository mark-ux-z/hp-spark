import { NextRequest, NextResponse } from "next/server";
import { generateConcepts } from "@/lib/claude";
import { buildConceptGenerationPrompt } from "@/lib/prompts";
import type { CampaignFormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      brandName,
      productType,
      campaignSeason,
      targetAudience,
      brandPersonality,
      selectedColor,
      apiKey,
    } = body;

    if (!brandName) {
      return NextResponse.json({ error: "brandName is required" }, { status: 400 });
    }

    const formData: CampaignFormData = {
      brandName,
      productType: productType ?? "FMCG",
      campaignSeason: campaignSeason ?? "Always-on",
      targetAudience: targetAudience ?? "General",
      brandPersonality: brandPersonality ?? `${brandName} brand`,
      selectedColor: selectedColor ?? "#0096D6",
    };

    const prompt = buildConceptGenerationPrompt(formData);
    const concepts = await generateConcepts(prompt, apiKey);

    return NextResponse.json({ concepts });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
