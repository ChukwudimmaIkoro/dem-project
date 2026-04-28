import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Dem Press Kit',
  description: 'Press resources for Dem, the app that adapts.',
};

export default function PressPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>

      {/* Nav */}
      <div className="px-4 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/" className="text-2xl font-black" style={{ color: '#22c55e' }}>Dem</Link>
        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-700">← Back to app</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-12 pt-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Press Kit
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">Dem</h1>
          <p className="text-xl text-gray-500 font-medium">The app that adapts. Today. Tomorrow. Every day.</p>
          <p className="text-sm text-gray-400">
            Contact:{' '}
            <a href="mailto:hello@trydem.app" className="font-bold hover:underline" style={{ color: '#22c55e' }}>
              hello@trydem.app
            </a>
          </p>
        </div>

        {/* One-liner + description */}
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900">About Dem</h2>
          <p className="text-gray-600 text-sm leading-relaxed font-bold">
            Dem is an energy-adaptive health companion that builds daily Diet, Exercise, and Mentality plans around how you ACTUALLY feel, rather than just a fixed routine. It’s designed to meet you where you are each day, making healthy habits more sustainable and less intimidating, whether you’re having a great day or a really tough one.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Every morning, you set your energy level: low, medium, or high. Dem reshapes your entire day around that, giving you simpler meals when you're drained, and more involved workouts when you're fired up. The AI-assisted mascot (also named Dem!) handles meal recipes, exercise form, and mental health check-ins. The goal is to develop a health habit that actually sticks.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Dem tracks streaks across multi-day plans (3, 5, 7, 14, or 30 days) and adapts the streak goal as you grow. After making an account, you can check in anytime, anywhere.
          </p>
        </section>

        {/* Key facts */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">Key Facts</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Category', value: 'Health & Fitness' },
              { label: 'Platform', value: 'Web (iOS & Android coming soon!)' },
              { label: 'Status', value: 'Alpha: live at trydem.app' },
              { label: 'Launch', value: 'May 2026' },
              { label: 'Founder', value: 'Chuchu Ikoro' },
              { label: 'Built with', value: 'Next.js, Supabase, Claude AI' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-gray-700 font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The three pillars */}
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900">The Three Pillars</h2>
          <div className="space-y-3">
            {[
              {
                emoji: '🥗',
                name: 'Diet',
                desc: 'Daily meal plans built from your preferred foods. Users can optionally use AI to generate a full recipe, with ingredients, steps, and macros, all matched to your energy level. Lower energy days get short no-cook meals, While high energy days get full on multi-step recipes!',
              },
              {
                emoji: '🏋️',
                name: 'Exercise',
                desc: 'Workouts chosen from your preferred exercises, scaled to your energy. Users can optionally use AI to get form cues, step-by-step instructions, and modifications for any difficulty level.',
              },
              {
                emoji: '🧠',
                name: 'Mentality',
                desc: 'Daily mental health check-ins: breathing exercises, affirmations, grounding techniques, and journaling prompts, chosen from categories you set. After all, without the right mentaility, everything falls apart.',
              },
            ].map(({ emoji, name, desc }) => (
              <div key={name} className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{name}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What makes it different */}
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-black text-gray-900">What Makes It Different</h2>
          <ul className="space-y-2 text-sm text-gray-500">
            {[
              'Energy-adaptive: the app behaves differently on your best and worst days',
              'No rigid routine: the streak system reward showing up, not perfection',
              'Transparent AI Integration: all AI features are optional and transparent, providing additional support without being intrusive.',
              'Clinical framing: health summaries formatted for care providers',
              'Dem, the Mascot!: A lively creature that lives in the UI and helps you understand plans, gives you tips, and provides encouragement. It’s like having a health buddy who’s always there to support you!',
            ].map(item => (
              <li key={item} className="flex gap-2">
                <span className="text-green-500 font-black flex-shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Screenshot */}
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900">Screenshots & Media</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <Image
                src="/DemScreenshot.png"
                alt="Dem app screenshot"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <Image
                src="/DemDemo.gif"
                alt="Dem app demo"
                width={600}
                height={400}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Need higher-resolution assets or additional screenshots?{' '}
            <a href="mailto:hello@trydem.app" className="font-bold hover:underline" style={{ color: '#22c55e' }}>
              Email us
            </a>
            .
          </p>
        </section>

        {/* Brand */}
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900">Brand</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#22c55e' }}
              >
                <svg width="48" height="48" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="#22c55e" />
                  <ellipse cx="35" cy="28" rx="13" ry="9" fill="rgba(255,255,255,0.28)" />
                  <ellipse cx="32" cy="26" rx="5" ry="3" fill="rgba(255,255,255,0.18)" />
                  <ellipse cx="34" cy="44" rx="5.5" ry="6.5" fill="white" />
                  <ellipse cx="66" cy="44" rx="5.5" ry="6.5" fill="white" />
                  <circle cx="35.5" cy="45.5" r="3.8" fill="#1a1a2e" />
                  <circle cx="67.5" cy="45.5" r="3.8" fill="#1a1a2e" />
                  <circle cx="37.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
                  <circle cx="69.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
                  <path d="M 37 57 Q 50 70 63 57" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <ellipse cx="25" cy="56" rx="7" ry="4.5" fill="rgba(255,150,150,0.35)" />
                  <ellipse cx="75" cy="56" rx="7" ry="4.5" fill="rgba(255,150,150,0.35)" />
                </svg>
              </div>
              <span className="text-xs text-gray-400">App icon</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full inline-block flex-shrink-0" style={{ background: '#22c55e' }} />
                <span className="text-gray-600">Brand green: <code className="text-xs bg-gray-100 px-1 rounded">#22c55e</code></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full inline-block flex-shrink-0" style={{ background: '#16a34a' }} />
                <span className="text-gray-600">Dark green: <code className="text-xs bg-gray-100 px-1 rounded">#16a34a</code></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full inline-block flex-shrink-0 border border-gray-200" style={{ background: '#f0fdf4' }} />
                <span className="text-gray-600">Background: <code className="text-xs bg-gray-100 px-1 rounded">#f0fdf4</code></span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Please do not modify the logo, alter the brand colors, or represent Dem in a misleading context.
          </p>
        </section>

        {/* Founder */}
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-black text-gray-900">Founder</h2>
          <div className="text-sm text-gray-500 leading-relaxed space-y-2">
            <p>
              <span className="font-bold text-gray-800">Chuchu Ikoro</span>: Solo founder and developer of Dem. Built the initial version during a hackathon in February 2026 and has been developing it into a full consumer health product since. Background in software engineering, focused on health-tech and mobile-first products.
            </p>
            <p>
              Available for interviews, demos, and press inquiries at{' '}
              <a href="mailto:hello@trydem.app" className="font-bold hover:underline" style={{ color: '#22c55e' }}>
                hello@trydem.app
              </a>
              .
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-3">
          <a
            href="https://trydem.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white font-black px-8 py-3 rounded-2xl text-sm"
            style={{ background: '#22c55e' }}
          >
            Try the app →
          </a>
          <p className="text-xs text-gray-400">
            Questions?{' '}
            <a href="mailto:hello@trydem.app" className="hover:underline font-bold" style={{ color: '#22c55e' }}>
              hello@trydem.app
            </a>
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs text-gray-400 space-x-4">
        <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
        <Link href="/press" className="hover:text-gray-600">Press Kit</Link>
      </div>

    </div>
  );
}
