import { diffWords } from "@/lib/utils";
export default function BeforeAfter({ before, after }: { before: string; after: string }) {
  return <div><h3 className="mb-3 font-display text-lg font-bold">Before / After</h3><div className="grid gap-3 sm:grid-cols-2">
    <div className="rounded-2xl border border-ink/10 bg-mist p-4"><p className="mb-1 text-xs font-semibold text-ink/50">Before</p><p className="whitespace-pre-wrap text-sm text-ink/70">{before}</p></div>
    <div className="rounded-2xl border border-iris/20 bg-lilac/50 p-4"><p className="mb-1 text-xs font-semibold text-irisDark">After</p>
      <p className="whitespace-pre-wrap text-sm">{diffWords(before, after).map((p, i) => p.changed ? <mark key={i} className="rounded bg-iris/15 px-0.5 text-ink">{p.t}</mark> : <span key={i}>{p.t}</span>)}</p></div>
  </div></div>;
}
