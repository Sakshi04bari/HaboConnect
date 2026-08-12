import { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { LSA } from '@/lib/types';
import { BookingModal } from '@/components/BookingModal';
import { Hero } from '@/components/Hero';
import { TrustBar } from '@/components/TrustBar';
import { EngineeringSnapshot } from '@/components/EngineeringSnapshot';

export default function App() {
  const [lsas, setLsas] = useState<LSA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [selectedLsa, setSelectedLsa] = useState<LSA | null>(null);
  const [confirmed, setConfirmed] = useState<LSA | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setError('Database is not configured.');
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('lsas')
        .select('id, name, skills, hourly_rate, timezone, active')
        .eq('active', true)
        .order('name');
      if (fetchError) {
        setError(fetchError.message);
      } else {
        await seedDemoLsas();
        const { data: refreshed } = await supabase
          .from('lsas')
          .select('id, name, skills, hourly_rate, timezone, active')
          .eq('active', true)
          .order('name');
        setLsas((refreshed ?? []) as LSA[]);
      }
      setLoading(false);
    }
    load();
  }, []);


  const skills = useMemo(() => {
    const set = new Set<string>();
    lsas.forEach((lsa) => lsa.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [lsas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lsas.filter((lsa) => {
      const matchesQuery =
        !q ||
        lsa.name.toLowerCase().includes(q) ||
        lsa.skills.some((s) => s.toLowerCase().includes(q));
      const matchesSkill = !activeSkill || lsa.skills.includes(activeSkill);
      return matchesQuery && matchesSkill;
    });
  }, [lsas, query, activeSkill]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Hero onSearch={setQuery} query={query} />

      <TrustBar />
      <EngineeringSnapshot />

      <main id="browse" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              Meet our specialists
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learning Support Assistants ready to help
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              Every specialist is background-checked and matched by expertise, so your child learns
              from someone who understands how they learn best.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or support area"
              aria-label="Search learning support assistants"
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSkill(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeSkill === null
                ? 'bg-teal-600 text-white shadow'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            All specialties
          </button>
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill === activeSkill ? null : skill)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeSkill === skill
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-12 rounded-2xl bg-amber-50 p-6 text-amber-800 ring-1 ring-amber-200">
            We couldn't load live specialist data, so we're showing a preview instead.
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center text-slate-500 ring-1 ring-slate-100">
            No specialists match that search. Try a different specialty or clear the filters.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lsa) => (
              <LSACard key={lsa.id} lsa={lsa} onBook={() => setSelectedLsa(lsa)} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-slate-700">HaboConnect</span>
            <span className="hidden sm:inline">· Learning support, matched thoughtfully</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-600" /> Background-checked
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-teal-600" /> Parent-rated
            </span>
          </div>
        </div>
      </footer>

      <BookingModal
        lsa={selectedLsa}
        onClose={() => setSelectedLsa(null)}
        onConfirmed={(lsa) => {
          setSelectedLsa(null);
          setConfirmed(lsa);
        }}
      />

      {confirmed && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setConfirmed(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <CheckCircle2 className="h-9 w-9 text-teal-600" />
            </div>
            <h3 className="mt-5 text-center text-2xl font-bold text-slate-900">Request received</h3>
            <p className="mt-2 text-center text-slate-600">
              We've sent your request to {confirmed.name}. You'll get a confirmation email once the
              session is finalized.
            </p>
            <button
              onClick={() => setConfirmed(null)}
              className="mt-6 w-full rounded-full bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LSACard({ lsa, onBook }: { lsa: LSA; onBook: () => void }) {
  return (
    <article className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="h-4 w-4 fill-amber-400" />
          <span className="text-sm font-semibold text-slate-700">4.9</span>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{lsa.name}</h3>
      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <MapPin className="h-4 w-4" /> {lsa.timezone}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lsa.skills.map((s) => (
          <span
            key={s}
            className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <span className="text-2xl font-bold text-slate-900">${lsa.hourly_rate}</span>
          <span className="text-sm text-slate-500"> / hour</span>
        </div>
        <button
          onClick={onBook}
          className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
        >
          Request session
        </button>
      </div>
    </article>
  );
}

const SEED_LSAS: Omit<LSA, 'active'>[] = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Dr. Amara Okonkwo', skills: ['Dyslexia support', 'Early literacy', 'Phonics'], hourly_rate: 55, timezone: 'London / GMT' },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Mr. Liam Bennett', skills: ['Autism support', 'Sensory regulation', 'Communication'], hourly_rate: 50, timezone: 'Manchester / GMT' },
  { id: '11111111-1111-1111-1111-111111111103', name: 'Ms. Sofia Reyes', skills: ['ADHD coaching', 'Study skills', 'Executive function'], hourly_rate: 48, timezone: 'Dublin / GMT' },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Dr. Noah Patel', skills: ['Dyscalculia support', 'Maths confidence', 'Numeracy'], hourly_rate: 52, timezone: 'Birmingham / GMT' },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Ms. Grace Whitfield', skills: ['Speech & language', 'Early literacy', 'Phonics'], hourly_rate: 46, timezone: 'Edinburgh / GMT' },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Mr. Ethan Brooks', skills: ['Autism support', 'Social skills', 'Emotional regulation'], hourly_rate: 49, timezone: 'Cardiff / GMT' },
];

async function seedDemoLsas() {
  if (!supabase) return;
  await supabase.from('lsas').upsert(
    SEED_LSAS.map((lsa) => ({ ...lsa, email: `${lsa.name.split(' ').slice(-1)[0].toLowerCase()}@haboconnect.example`, active: true })),
    { onConflict: 'id' },
  );
}
