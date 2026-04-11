const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

export async function generateMockupImage(prompt: string): Promise<{
  dataUrl: string;
  mimeType: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const mimeType: string = part.inlineData.mimeType;
      const base64: string = part.inlineData.data;
      return { dataUrl: `data:${mimeType};base64,${base64}`, mimeType };
    }
  }

  const textPart = parts.find((p: { text?: string }) => p.text);
  throw new Error(
    textPart?.text || "No image returned from Nano Banana 2 API."
  );
}
