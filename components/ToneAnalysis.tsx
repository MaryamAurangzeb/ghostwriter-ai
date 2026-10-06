import type { Result, Tone } from "@/lib/utils";
export default function ToneAnalysis({ r, tone }: { r: Result; tone: Tone }) {
  const rows: [string, number][] = [[`Tone: ${tone}`, r.toneScore], ["Clarity", r.clarityScore], ["Politeness", r.politenessScore], ["Conciseness", r.concisenessScore]];
  return <div><h3 className="mb-3 font-display text-lg font-bold">Tone Analysis</h3><div className="space-y-3">
    {rows.map(([k, v]) => <div key={k}><div className="mb-1 flex justify-between text-sm"><span>{k}</span><b>{v}%</b></div>
      <div className="h-2 overflow-hidden rounded-full bg-lilac"><div className="h-full rounded-full bg-iris transition-all duration-700" style={{ width: `${v}%` }} /></div></div>)}
  </div></div>;
}
