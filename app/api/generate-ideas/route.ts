import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/claude";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const {
      brandName,
      productType,
      campaignSeason,
      targetAudience,
      brandPersonality,
      brandColors,
      filenames,
    } = await req.json();

    if (!brandName) {
      return NextResponse.json({ error: "brandName is required" }, { status: 400 });
    }

    // Build a rich brand context from the new form fields
    const contextParts: string[] = [];
    if (productType)       contextParts.push(`Product: ${productType}`);
    if (campaignSeason)    contextParts.push(`Campaign season: ${campaignSeason}`);
    if (targetAudience)    contextParts.push(`Target audience: ${targetAudience}`);
    if (brandPersonality)  contextParts.push(`Brand personality: ${brandPersonality}`);
    if (brandColors?.length) contextParts.push(`Brand colours: ${(brandColors as string[]).join(", ")}`);

    const brandContext = contextParts.length
      ? contextParts.join("\n")
      : `${brandName} FMCG brand`;

    // Build Claude prompt — richer brief than the original
    const prompt = `Generate exactly 3 HP Indigo digital packaging campaign ideas for ${brandName}.

Brand brief:
${brandContext}
${filenames?.length ? `\nUploaded brand assets: ${(filenames as string[]).join(", ")}` : ""}

IMPORTANT — use each strategy type exactly once, one idea per type:
- VDP: A generalised marketing campaign using multiple different artwork designs printed across the run (seasonal variants, limited-edition illustrations, region-specific artworks). The description must focus on the variety of designs across the print run.
- QR: A campaign where the packaging includes a scannable QR code that drives customer engagement — competitions, feedback surveys, loyalty rewards, or exclusive digital content. The description must focus on what the QR code unlocks for the customer.
- Personalized: A campaign where each individual pack is printed with a unique customer name, personal message, or custom data. The description must focus on the one-to-one personal connection with the end consumer.

Return a JSON array of exactly 3 objects in this order [VDP, QR, Personalized] — no markdown, no explanation:
[{"title":"3-6 word concept name","description":"2 sentences that clearly describe the campaign and exactly how this strategy type is used.","strategy_type":"VDP"|"QR"|"Personalized"}]`;

    const ideas = await generateIdeas(prompt);

    // Create campaign in Supabase
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        user_id: "demo-user",
        status: "active",
        brand_name: brandName,
        brand_context: brandContext,
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
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object"
        ? JSON.stringify(err)
        : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
