import { HistoryItem, fmtDate } from "@/lib/utils";
export default function History({ items, onDelete, onClear }: { items: HistoryItem[]; onDelete: (id: string) => void; onClear: () => void }) {
  return <section id="history" className="mx-auto mt-14 max-w-6xl px-5">
    <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl font-bold">Recent messages</h2>
      {items.length > 0 && <button onClick={onClear} className="text-sm text-ink/60 underline hover:text-ink">Clear all</button>}</div>
    {items.length === 0 ? <p className="rounded-2xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink/50">Nothing yet. Messages you improve will show up here, saved only on this device.</p>
      : <div className="grid gap-3 md:grid-cols-2">{items.map(h => <article key={h.id} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-xs text-ink/50"><span>{h.tone} · {fmtDate(h.at)}</span><button onClick={() => onDelete(h.id)} aria-label="Delete history item" className="hover:text-red-600">Delete</button></div>
        <p className="text-sm text-ink/50 line-through decoration-ink/20">{h.original}</p><p className="mt-2 text-sm">{h.improved}</p></article>)}</div>}
  </section>;
}
