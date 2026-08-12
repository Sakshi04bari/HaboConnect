import { CalendarDays, HeartHandshake, Sparkles, Users } from 'lucide-react';

export function Hero({ query, onSearch }: { query: string; onSearch: (v: string) => void }) {
  return (
    <header className="relative overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(45, 212, 191, 0.4) 0, transparent 40%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.3) 0, transparent 35%)',
        }}
      />
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-400/40">
            <HeartHandshake className="h-5 w-5 text-teal-300" />
          </div>
          <span className="text-lg font-bold tracking-tight">HaboConnect</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-slate-300 sm:flex">
          <a href="#browse" className="transition hover:text-white">Find support</a>
          <a href="#how" className="transition hover:text-white">How it works</a>
          <a href="#api" className="transition hover:text-white">How it works inside</a>
        </div>
        <a
          href="#browse"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-teal-50"
        >
          Get started
        </a>
      </nav>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-300 ring-1 ring-teal-400/30">
            <Sparkles className="h-3.5 w-3.5" /> Matching parents with trusted specialists
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The right learning support,{' '}
            <span className="bg-gradient-to-r from-teal-300 to-sky-400 bg-clip-text text-transparent">
              matched thoughtfully
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            HaboConnect pairs your child with vetted Learning Support Assistants for dyslexia,
            autism, ADHD, and more. Browse specialists, request a session, and get confirmation in
            minutes.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="search"
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="What support does your child need?"
                aria-label="Search for learning support"
                className="w-full rounded-full border border-white/10 bg-white/95 py-3.5 pl-5 pr-4 text-slate-900 shadow-lg outline-none transition focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <a
              href="#browse"
              className="rounded-full bg-teal-500 px-6 py-3.5 text-center font-semibold text-slate-900 shadow-lg transition hover:bg-teal-400"
            >
              Browse specialists
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-teal-300" /> 1,200+ sessions booked</span>
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-teal-300" /> Same-week availability</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-teal-300" /> Free initial consultation</span>
          </div>
        </div>
      </div>
    </header>
  );
}
