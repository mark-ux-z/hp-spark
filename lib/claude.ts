const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

function getHeaders(apiKey?: string) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
  };
}

export async function generateConcepts(
  userPrompt: string,
  apiKey?: string
): Promise<object[]> {
  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system:
        "You are an HP Indigo digital printing strategist for FMCG brands. Respond ONLY with a valid JSON array, no markdown, no explanation.",
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  let text: string = data.content[0].text;
  text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(text);
}

// Keep existing functions for campaign/[id] refinement flow
export async function generateIdeas(userPrompt: string, apiKey?: string): Promise<
  { title: string; description: string; strategy_type: string }[]
> {
  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system:
        "You are an HP Indigo digital printing strategist for FMCG brands. Respond ONLY with valid JSON, no markdown.",
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  let text: string = data.content[0].text;
  text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(text);
}

export async function refineIdea(userPrompt: string, apiKey?: string): Promise<{
  title: string;
  description: string;
  strategy_type: string;
}> {
  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "You are an HP Indigo campaign strategist refining ideas based on feedback. Respond ONLY with valid JSON, no markdown.",
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  let text: string = data.content[0].text;
  text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(text);
}
