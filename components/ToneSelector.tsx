export default function ToneSelector<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return <div><p className="mb-2 text-sm font-semibold">{label}</p><div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
    {options.map(o => <button key={o} role="radio" aria-checked={o === value} onClick={() => onChange(o)}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${o === value ? "border-iris bg-iris text-white shadow-soft" : "border-ink/10 bg-white text-ink/70 hover:border-iris/50 hover:text-ink"}`}>{o}</button>)}
  </div></div>;
}
