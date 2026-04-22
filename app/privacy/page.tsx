import Script from 'next/script';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Dem',
  description: 'How Dem collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
      {/* Nav */}
      <div className="px-4 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/" className="text-2xl font-black text-dem-green-500">Dem</Link>
        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-700">← Back to app</Link>
      </div>

      {/* Termly embed */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div
          // @ts-ignore
          name="termly-embed"
          data-id="REPLACE_WITH_YOUR_TERMLY_POLICY_ID"
          data-type="iframe"
        />
        <Script
          id="termly-jssdk"
          strategy="afterInteractive"
          src="https://app.termly.io/embed-policy.min.js"
        />
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs text-gray-400 space-x-4">
        <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
      </div>
    </div>
  );
}
