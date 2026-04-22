import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Dem',
  description: 'Terms of Service for the Dem health companion app.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
      {/* Nav */}
      <div className="px-4 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/" className="text-2xl font-black text-dem-green-500">Dem</Link>
        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-700">← Back to app</Link>
      </div>

      {/* Placeholder */}
      <div className="max-w-2xl mx-auto px-4 pb-16 text-center pt-20">
        <p className="text-2xl font-black text-gray-700 mb-2">Terms of Service</p>
        <p className="text-gray-400 text-sm">Coming soon. For questions, contact <a href="mailto:hello@trydem.app" className="text-dem-green-600 font-bold">hello@trydem.app</a>.</p>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs text-gray-400 space-x-4">
        <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
      </div>
    </div>
  );
}
