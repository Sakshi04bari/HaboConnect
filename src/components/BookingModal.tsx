import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { LSA } from '@/lib/types';

type Props = {
  lsa: LSA | null;
  onClose: () => void;
  onConfirmed: (lsa: LSA) => void;
};

const SKILL_OPTIONS = [
  'Dyslexia support',
  'Autism support',
  'ADHD coaching',
  'Dyscalculia support',
  'Speech & language',
  'Early literacy',
];

export function BookingModal({ lsa, onClose, onConfirmed }: Props) {
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [skill, setSkill] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lsa) {
      setSkill(lsa.skills[0] ?? '');
      setError(null);
    }
  }, [lsa]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (lsa) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lsa, onClose]);

  if (!lsa) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lsa) return;
    setSubmitting(true);
    setError(null);

    const startsAt = new Date(`${date}T${time}:00`);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

    try {
      if (supabase) {
        let parentId: string | null = null;
        const { data: existing } = await supabase
          .from('parents')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (existing) {
          parentId = existing.id;
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('parents')
            .insert({ name: parentName, email, phone: null })
            .select('id')
            .single();
          if (insertErr || !inserted) throw new Error(insertErr?.message ?? 'Unable to create parent');
          parentId = inserted.id;
        }

        const { error: bookingErr } = await supabase.from('bookings').insert({
          parent_id: parentId,
          lsa_id: lsa.id,
          child_name: childName,
          skill,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: 'pending',
          payment_status: 'pending',
        });
        if (bookingErr) {
          if (bookingErr.code === '23P01') {
            throw new Error('That time slot is already booked. Please choose another time.');
          }
          throw new Error(bookingErr.message);
        }
      }
      onConfirmed(lsa);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Request a session</p>
            <h2 id="booking-title" className="mt-1 text-2xl font-bold text-slate-900">
              Book with {lsa.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">${lsa.hourly_rate}/hour · {lsa.timezone}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking form"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name">
              <input
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className={inputClass}
                placeholder="Amina Doe"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </Field>
          </div>

          <Field label="Child's name">
            <input
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className={inputClass}
              placeholder="Sam Doe"
            />
          </Field>

          <Field label="Support area">
            <select
              required
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className={inputClass}
            >
              {SKILL_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>
            <Field label="Start time">
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-sm text-teal-800 ring-1 ring-teal-100">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            No payment is taken now. The specialist confirms the session first.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-teal-600 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending request…' : 'Request session'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
