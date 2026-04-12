import { NextRequest, NextResponse } from "next/server";
import type { Concept } from "@/lib/types";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

function getHeaders() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      concept,
      brandName,
      productType,
      brandPersonality,
      feedback,
      history = [],
    }: {
      concept: Concept;
      brandName: string;
      productType: string;
      brandPersonality: string;
      feedback: string;
      history: { role: string; text: string }[];
    } = body;

    if (!concept || !feedback) {
      return NextResponse.json({ error: "concept and feedback are required" }, { status: 400 });
    }

    const historyText = history.length
      ? `\nPrevious chat:\n${history.filter((m) => m.role === "user").map((m) => `- "${m.text}"`).join("\n")}`
      : "";

    const prompt = `You are refining an HP Indigo digital packaging campaign concept based on user feedback.

Brand: ${brandName}
Product: ${productType}
${brandPersonality ? `Brand personality: ${brandPersonality}` : ""}

Current concept:
- Name: ${concept.name}
- Tagline: ${concept.tagline}
- Description: ${concept.description}
${historyText}

New feedback: "${feedback}"

Apply the feedback and return ONLY valid JSON (no markdown, no explanation):
{
  "name": "3-5 word concept name",
  "tagline": "under 10 words",
  "description": "2-3 sentences about the updated concept",
  "imagePrompt": "60-80 word photorealistic product photography prompt, white background, no text on packaging"
}`;

    const res = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        system: "You are an HP Indigo campaign strategist. Respond ONLY with valid JSON, no markdown.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error: ${res.status} — ${err}`);
    }

    const data = await res.json();
    let text: string = data.content[0].text;
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    const updates = JSON.parse(text) as Partial<Concept>;
    return NextResponse.json({ concept: updates });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
