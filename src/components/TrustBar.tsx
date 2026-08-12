import { CalendarCheck, MessagesSquare, Search } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Find the right match',
    body: 'Filter by specialty, availability, and budget. Every specialist is background-checked.',
  },
  {
    icon: CalendarCheck,
    title: 'Request a session',
    body: 'Pick a time that suits your family. We hold the slot and notify the specialist instantly.',
  },
  {
    icon: MessagesSquare,
    title: 'Meet and learn',
    body: 'Once the specialist confirms, you receive a session link and a written learning plan.',
  },
];

export function TrustBar() {
  return (
    <section id="how" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Three simple steps to the right support
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl bg-slate-50 p-7 ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="absolute right-6 top-6 text-5xl font-bold text-slate-200">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
