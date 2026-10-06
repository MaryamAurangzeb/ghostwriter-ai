export type Tone = "Professional"|"Friendly"|"Casual"|"Confident"|"Polite"|"Direct"|"Apologetic"|"Persuasive";
export type Length = "Short"|"Balanced"|"Detailed";
export type Platform = "WhatsApp"|"Email"|"LinkedIn"|"SMS"|"General";
export const TONES: Tone[] = ["Professional","Friendly","Casual","Confident","Polite","Direct","Apologetic","Persuasive"];
export const LENGTHS: Length[] = ["Short","Balanced","Detailed"];
export const PLATFORMS: Platform[] = ["WhatsApp","Email","LinkedIn","SMS","General"];
export interface Result { message: string; improvements: string[]; toneScore: number; clarityScore: number; politenessScore: number; concisenessScore: number; clarification?: string; demo?: boolean }
export interface HistoryItem { id: string; original: string; improved: string; tone: Tone; at: number }
export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
/** Marks words in `after` that don't appear in `before` (subtle highlighting). */
export function diffWords(before: string, after: string) {
  const seen = new Set(words(before));
  return after.split(/(\s+)/).map(t => ({ t, changed: /\S/.test(t) && !seen.has(words(t)[0] ?? "") }));
}
/** Heuristic scores computed from the actual text. */
export function scoreText(text: string, tone: Tone) {
  const w = words(text), n = w.length || 1;
  const polite = w.filter(x => ["please","thank","thanks","appreciate","sorry","apologize","kindly","would","could","hope","understanding"].includes(x)).length;
  const casual = w.filter(x => ["hey","yeah","gonna","wanna","lol"].includes(x)).length;
  const sentences = Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length);
  const avg = n / sentences;
  const formal = ["Professional","Polite","Apologetic"].includes(tone);
  return {
    toneScore: clamp(70 + (formal ? polite * 5 - casual * 6 : casual * 3 + 6) + (n > 6 ? 6 : 0)),
    clarityScore: clamp(98 - Math.max(0, avg - 16) * 2),
    politenessScore: clamp(62 + polite * 9 - (tone === "Direct" ? 4 : 0)),
    concisenessScore: clamp(100 - Math.max(0, n - 22) * 0.8),
  };
}
export const fmtDate = (t: number) => new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
