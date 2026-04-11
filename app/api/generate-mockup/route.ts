import { NextRequest, NextResponse } from "next/server";
import { generateMockupImage } from "@/lib/nano-banana";
import { buildMockupPrompt, MockupStyle } from "@/lib/prompts";
import { updateIdea } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { ideaId, brandName, ideaTitle, ideaDescription, strategyType, mockupStyle } =
      await req.json();

    if (!ideaId || !brandName || !ideaTitle) {
      return NextResponse.json(
        { error: "ideaId, brandName, and ideaTitle are required" },
        { status: 400 }
      );
    }

    const style: MockupStyle | undefined = mockupStyle ?? undefined;

    const prompt = buildMockupPrompt(brandName, ideaTitle, ideaDescription, strategyType, style);
    const { dataUrl } = await generateMockupImage(prompt);

    await updateIdea(ideaId, {
      mockup_url: dataUrl,
      ...(style ? { mockup_style: style } : {}),
    });

    return NextResponse.json({ mockupUrl: dataUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
