import { CalendarCheck, CheckCircle2, Database, Search, ShieldCheck } from 'lucide-react';

const API_CARDS = [
  {
    icon: Search,
    method: 'GET',
    path: '/api/v1/lsas/search',
    title: 'Availability search',
    body: 'Filters by support skill and time range in one optimized query, excluding overlapping bookings.',
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    icon: CalendarCheck,
    method: 'POST',
    path: '/api/v1/bookings',
    title: 'Booking request',
    body: 'Validates parent, child, LSA, skill, and time before storing a safe session request.',
    tone: 'bg-teal-50 text-teal-700',
  },
  {
    icon: ShieldCheck,
    method: 'POST',
    path: '/api/v1/payments/webhook',
    title: 'Payment webhook',
    body: 'Accepts success or failure events and transitions booking state without duplicate records.',
    tone: 'bg-amber-50 text-amber-700',
  },
];

export function EngineeringSnapshot() {
  return (
    <section id="api" className="border-y border-slate-200 bg-slate-100/70 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Built for the brief</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A parent-friendly product backed by production-shaped APIs
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              The experience stays simple for families while the Python backend handles search,
              validation, double-booking protection, and payment state changes.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">FastAPI + PostgreSQL</p>
              <p className="text-xs text-slate-500">SQLAlchemy · Supabase · pytest</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {API_CARDS.map((card) => (
            <article key={card.path} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600">
                  {card.method}
                </span>
              </div>
              <p className="mt-5 break-all font-mono text-xs font-semibold text-slate-500">{card.path}</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600" /> 5+ automated tests</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600" /> Idempotent payment events</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600" /> Database overlap constraint</span>
        </div>
      </div>
    </section>
  );
}
