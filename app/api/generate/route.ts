import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
// The API key stays on the server (.env.local) and never reaches the browser.
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ demo: true }); }
  const { input, tone, length, platform, keepVoice } = body ?? {};
  if (typeof input !== "string" || !input.trim() || input.length > 1000) return NextResponse.json({ demo: true });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ demo: true });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-5-5", max_tokens: 800, system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(input, tone, length, platform, keepVoice) }] }),
    });
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    const text: string = data.content?.[0]?.text ?? "";
    return NextResponse.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch {
    return NextResponse.json({ demo: true });
  }
}
