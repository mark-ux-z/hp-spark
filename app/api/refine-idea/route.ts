import { NextRequest, NextResponse } from "next/server";
import { refineIdea } from "@/lib/claude";
import { buildIdeaRefinementPrompt } from "@/lib/prompts";
import { updateIdea } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { ideaId, title, description, strategyType, feedbackHistory, feedback } =
      await req.json();

    if (!ideaId || !feedback) {
      return NextResponse.json(
        { error: "ideaId and feedback are required" },
        { status: 400 }
      );
    }

    const prompt = buildIdeaRefinementPrompt(
      title,
      description,
      strategyType,
      feedbackHistory ?? [],
      feedback
    );

    const refined = await refineIdea(prompt);

    await updateIdea(
      ideaId,
      {
        title: refined.title,
        description: refined.description,
        strategy_type: refined.strategy_type,
      },
      feedback
    );

    return NextResponse.json({ idea: refined });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
