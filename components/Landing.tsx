const Card = ({ icon, title, text }: { icon: string; title: string; text: string }) =>
  <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-soft transition hover:-translate-y-0.5"><div className="text-2xl">{icon}</div><h3 className="mt-3 font-display text-lg font-bold">{title}</h3><p className="mt-1 text-sm text-ink/60">{text}</p></div>;
export function Why() {
  return <section className="mx-auto mt-20 max-w-6xl px-5"><h2 className="mb-6 text-center font-display text-3xl font-bold">Why GhostWriter?</h2><div className="grid gap-4 md:grid-cols-3">
    <Card icon="🧠" title="Preserve Your Meaning" text="Improve your writing without changing what you actually want to say." />
    <Card icon="🎭" title="Sound Like Yourself" text="Choose how you want to sound — professional, friendly, confident, or casual." />
    <Card icon="⚡" title="Write in Seconds" text="Turn rough thoughts into polished messages instantly." /></div></section>;
}
export function HowItWorks() {
  const steps = ["Write it badly.", "Choose your tone.", "Let GhostWriter improve it."];
  return <section id="how" className="mx-auto mt-20 max-w-3xl px-5"><h2 className="mb-6 text-center font-display text-3xl font-bold">How It Works</h2>
    <ol className="space-y-3">{steps.map((s, i) => <li key={s} className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-iris font-bold text-white">{i + 1}</span><b>{s}</b></li>)}</ol></section>;
}
export function UseCases() {
  const u = ["💼 Work", "📱 WhatsApp", "📚 University", "💬 Personal", "🤝 Clients", "💻 LinkedIn"];
  return <section className="mx-auto mt-20 max-w-3xl px-5 text-center"><h2 className="font-display text-3xl font-bold">Built for everyday communication.</h2>
    <div className="mt-5 flex flex-wrap justify-center gap-3">{u.map(x => <span key={x} className="rounded-full bg-white px-5 py-2 text-sm font-medium shadow-soft">{x}</span>)}</div></section>;
}
