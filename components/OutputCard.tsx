"use client";
import { useState } from "react";
export default function OutputCard({ message, onCopy, onRegenerate, onChange, busy }: { message: string; onCopy: () => void; onRegenerate: () => void; onChange: (v: string) => void; busy: boolean }) {
  const [edit, setEdit] = useState(false);
  const btn = "rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-sm font-medium transition hover:border-iris hover:text-irisDark disabled:opacity-50";
  return <div className="rise rounded-2xl border border-iris/20 bg-white p-5 shadow-soft">
    {edit ? <textarea autoFocus value={message} onChange={e => onChange(e.target.value)} className="min-h-[140px] w-full resize-y rounded-xl bg-mist p-3 text-lg leading-relaxed outline-none" aria-label="Edit improved message" />
      : <p className="whitespace-pre-wrap text-lg leading-relaxed">{message}</p>}
    <div className="mt-4 flex flex-wrap gap-2">
      <button className={btn} onClick={onCopy}>📋 Copy</button>
      <button className={btn} onClick={onRegenerate} disabled={busy}>🔄 Regenerate</button>
      <button className={btn} onClick={() => setEdit(e => !e)}>{edit ? "✓ Done" : "✏️ Edit"}</button>
    </div></div>;
}
