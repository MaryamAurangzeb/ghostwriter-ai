import Logo from "./Logo";
export default function Navbar() {
  return <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
    <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold"><Logo />GhostWriter AI</a>
    <nav className="flex items-center gap-5 text-sm text-ink/70">
      <a href="#how" className="hidden hover:text-ink sm:inline">How it works</a>
      <a href="#history" className="hidden hover:text-ink sm:inline">History</a>
      <a href="#writer" className="rounded-full bg-ink px-4 py-2 font-medium text-white transition hover:bg-irisDark">Start writing</a>
    </nav></header>;
}
