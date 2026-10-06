import { Length, Platform, Result, Tone, scoreText } from "./utils";
import { localRewrite } from "./demo";
/** Single entry point for the UI. Calls the server route; falls back to demo mode. */
export async function generateMessage(input: string, tone: Tone, length: Length, platform: Platform, keepVoice: boolean, variant = 0): Promise<Result> {
  const empty = { message: "", improvements: [], toneScore: 0, clarityScore: 0, politenessScore: 0, concisenessScore: 0 };
  if (input.trim().split(/\s+/).length < 2) return { ...empty, clarification: "Could you add a bit more — who is this for and what do you want to say?" };
  try {
    const r = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ input, tone, length, platform, keepVoice, variant }) });
    const d = await r.json();
    if (!d.demo && (d.message || d.clarification)) return { ...empty, ...scoreText(d.message || "", tone), ...d };
  } catch {}
  await new Promise(r => setTimeout(r, 900));
  return localRewrite(input, tone, length, platform, keepVoice, variant);
}
