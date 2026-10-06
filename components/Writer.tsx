"use client";
import { useEffect, useRef, useState } from "react";
import { generateMessage } from "@/lib/ai";
import { HistoryItem, LENGTHS, Length, PLATFORMS, Platform, Result, TONES, Tone } from "@/lib/utils";
import ToneSelector from "./ToneSelector";
import OutputCard from "./OutputCard";
import ToneAnalysis from "./ToneAnalysis";
import BeforeAfter from "./BeforeAfter";
import History from "./History";

const QUICK: Record<string, string> = {
  "Message my teacher": "sir i will be late to class tomorrow bus problem",
  "Ask for a deadline extension": "can i get few more days for the report",
  "Reply to a client": "got ur mail will send the revised quote by friday",
  "Say sorry professionally": "sorry i missed the meeting yesterday",
  "Write a friendly WhatsApp reply": "yes i can come tonight what time",
};
const DEMOS: { input: string; tone: Tone }[] = [
  { input: "can you send me the file whenever you can", tone: "Professional" },
  { input: "sorry i cant come today", tone: "Friendly" },
  { input: "sir give me more time for assignment", tone: "Polite" },
];
const KEY = "ghostwriter-history";

export default function Writer() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [length, setLength] = useState<Length>("Balanced");
  const [platform, setPlatform] = useState<Platform>("General");
  const [keepVoice, setKeepVoice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [original, setOriginal] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState("");
  const variant = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { try { setHistory(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} }, []);
  const saveHistory = (h: HistoryItem[]) => { setHistory(h); try { localStorage.setItem(KEY, JSON.stringify(h)); } catch {} };
  const flash = (m: string) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2000); };

  async function run(text = input, t = tone, regen = false) {
    if (!text.trim() || busy) return flash("Type a message first");
    setBusy(true); setResult(null);
    variant.current = regen ? variant.current + 1 : 0;
    const r = await generateMessage(text, t, length, platform, keepVoice, variant.current);
    setBusy(false); setResult(r); setMessage(r.message); setOriginal(text);
    if (r.message) saveHistory([{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, original: text, improved: r.message, tone: t, at: Date.now() }, ...history].slice(0, 20));
  }
  async function copy() {
    try { await navigator.clipboard.writeText(message); flash("Copied to clipboard ✓"); } catch { flash("Couldn't copy — select the text manually"); }
  }
  function demo(d: { input: string; tone: Tone }) { setInput(d.input); setTone(d.tone); run(d.input, d.tone); }

  return <>
    <section id="writer" className="mx-auto max-w-6xl px-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold">Your Draft</h2>
          <textarea value={input} onChange={e => setInput(e.target.value.slice(0, 1000))} placeholder="Type or paste your messy message here…" aria-label="Your draft"
            className="mt-3 min-h-[160px] w-full resize-y rounded-2xl bg-mist p-4 outline-none ring-iris/40 transition focus:ring-2" />
          <div className={`mt-1 text-right text-xs transition-colors ${input.length > 900 ? "text-red-600" : "text-ink/40"}`}>{input.length} / 1000</div>
          <div className="mt-2 flex flex-wrap gap-2">{Object.entries(QUICK).map(([k, v]) =>
            <button key={k} onClick={() => setInput(v)} className="rounded-full bg-lilac px-3 py-1 text-xs font-medium text-irisDark transition hover:bg-iris hover:text-white">{k}</button>)}</div>
          <div className="mt-6 space-y-5">
            <ToneSelector label="Tone" options={TONES} value={tone} onChange={setTone} />
            <ToneSelector label="Length" options={LENGTHS} value={length} onChange={setLength} />
            <ToneSelector label="Platform" options={PLATFORMS} value={platform} onChange={setPlatform} />
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-lilac/60 p-4">
              <span><b className="block text-sm">Keep My Voice</b><span className="text-xs text-ink/60">Keeps your personality and natural wording. No corporate-speak.</span></span>
              <button role="switch" aria-checked={keepVoice} onClick={() => setKeepVoice(v => !v)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${keepVoice ? "bg-iris" : "bg-ink/20"}`}>
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${keepVoice ? "left-5" : "left-0.5"}`} /></button>
            </label>
          </div>
          <button onClick={() => run()} disabled={busy} className="mt-6 w-full rounded-2xl bg-iris py-3.5 font-semibold text-white shadow-soft transition hover:bg-irisDark active:scale-[.99] disabled:opacity-60">✨ Improve My Message</button>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold">Your Improved Message</h2>
            <div className="mt-3" aria-live="polite">
              {busy ? <div className="grid place-items-center rounded-2xl bg-mist py-14 text-center"><div className="bob text-4xl">👻</div><p className="mt-3 font-medium text-irisDark">✨ GhostWriter is rewriting your message…</p></div>
                : result?.clarification ? <div className="rise rounded-2xl bg-amber-50 p-5 text-sm"><b>Quick question first:</b> {result.clarification}</div>
                : result ? <OutputCard message={message} onChange={setMessage} onCopy={copy} onRegenerate={() => run(original, tone, true)} busy={busy} />
                : <div className="rounded-2xl border border-dashed border-ink/15 p-8 text-center"><div className="text-5xl">👻</div><p className="mt-2 text-ink/50">Your improved message will appear here.</p>
                    <p className="mt-4 text-sm font-semibold">Not sure how to say it? Try:</p>
                    <button onClick={() => setInput("Ask my manager for one more day.")} className="mt-2 rounded-full bg-lilac px-4 py-1.5 text-sm text-irisDark transition hover:bg-iris hover:text-white">“Ask my manager for one more day.”</button></div>}
            </div>
            {result?.demo && !busy && <p className="mt-3 text-xs text-ink/40">Demo mode: add an API key in .env.local for full AI rewrites.</p>}
          </div>
          {result && !busy && result.message && <div className="rise space-y-6 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
            <ToneAnalysis r={result} tone={tone} />
            <div><h3 className="mb-2 font-display text-lg font-bold">What I improved</h3><ul className="space-y-1 text-sm">{result.improvements.map(i => <li key={i}><span className="text-mint">✓</span> {i}</li>)}</ul></div>
            <BeforeAfter before={original} after={message} />
          </div>}
        </div>
      </div>
    </section>

    <section className="mx-auto mt-14 max-w-6xl px-5"><h2 className="mb-4 font-display text-2xl font-bold">See it in action</h2>
      <div className="grid gap-3 md:grid-cols-3">{DEMOS.map(d => <button key={d.input} onClick={() => demo(d)} className="rounded-2xl border border-ink/10 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-iris">
        <p className="text-sm text-ink/50">“{d.input}”</p><p className="mt-2 text-sm font-semibold text-irisDark">Try as {d.tone} ↗</p></button>)}</div></section>

    <History items={history} onDelete={id => saveHistory(history.filter(h => h.id !== id))} onClear={() => saveHistory([])} />
    <div role="status" className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm text-white shadow-soft transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>{toast}</div>
  </>;
}
