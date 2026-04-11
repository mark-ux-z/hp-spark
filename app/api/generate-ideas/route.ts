import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/claude";
import { buildIdeaGenerationPrompt } from "@/lib/prompts";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { brandName, brandContext, filenames } = await req.json();

    if (!brandName) {
      return NextResponse.json({ error: "brandName is required" }, { status: 400 });
    }

    const context = brandContext || `${brandName} FMCG brand`;
    const prompt = buildIdeaGenerationPrompt(brandName, context, filenames ?? []);
    const ideas = await generateIdeas(prompt);

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        user_id: "demo-user",
        status: "draft",
        brand_name: brandName,
        brand_context: context,
        asset_filenames: filenames ?? [],
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    // Insert ideas
    const ideaRows = ideas.map((idea) => ({
      campaign_id: campaign.id,
      title: idea.title,
      description: idea.description,
      strategy_type: idea.strategy_type,
    }));

    const { error: ideasError } = await supabase.from("ideas").insert(ideaRows);
    if (ideasError) throw ideasError;

    return NextResponse.json({ campaignId: campaign.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : (typeof err === "object" ? JSON.stringify(err) : String(err));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
