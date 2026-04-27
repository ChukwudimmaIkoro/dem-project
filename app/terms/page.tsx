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
        <Link href="/" className="text-2xl font-black" style={{ color: '#22c55e' }}>Dem</Link>
        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-700">← Back to app</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20 pt-4 space-y-6 text-sm text-gray-600 leading-relaxed">

        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Terms of Service</h1>
          <p className="text-xs text-gray-400">Last updated: April 27, 2026</p>
        </div>

        <p>
          Please read these Terms of Service carefully before using the Dem app or website at{' '}
          <a href="https://trydem.app" className="font-bold hover:underline" style={{ color: '#22c55e' }}>trydem.app</a>
          {' '}operated by Chukwudimma Ikoro (doing business as <strong>Dem App</strong>).
        </p>
        <p>
          By accessing or using Dem, you agree to be bound by these Terms. If you disagree with any part, you may not use the service.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">1. The Service</h2>
          <p>
            Dem is a personal health companion app that generates daily diet, exercise, and mentality plans based on your self-reported energy level. It is provided for informational and general wellness purposes only.
          </p>
          <p className="font-semibold text-gray-700">
            Dem is not a medical device, does not provide medical advice, and is not a substitute for professional medical, nutritional, or psychological guidance. Always consult a qualified healthcare provider before making health decisions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">2. Accounts</h2>
          <p>
            You may use Dem without an account. If you create an account, you are responsible for maintaining the security of your credentials and for all activity that occurs under your account. You must be at least 13 years old to create an account.
          </p>
          <p>
            We reserve the right to terminate accounts that violate these Terms or that have been inactive for an extended period, with reasonable notice where required by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">3. AI-Generated Content</h2>
          <p>
            Dem uses AI to generate meal recipes, exercise coaching tips, health insights, and companion messages. This content is generated automatically and may not always be accurate, complete, or appropriate for your specific situation. It is provided as-is for general informational purposes.
          </p>
          <p>
            Do not rely on AI-generated content in Dem as medical, nutritional, or fitness advice. If you have a health condition, injury, allergy, or dietary restriction, consult a professional before following any suggestions made by the app.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service or its infrastructure</li>
            <li>Reverse-engineer, decompile, or extract the source code of the app</li>
            <li>Use automated tools to scrape, overload, or abuse the service</li>
            <li>Misrepresent your identity or impersonate others</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">5. Intellectual Property</h2>
          <p>
            The Dem name, logo, mascot, app design, and original content are owned by Chukwudimma Ikoro. You may not use them without permission. Your personal data and self-reported health inputs remain yours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">6. Privacy</h2>
          <p>
            Your use of Dem is also governed by our{' '}
            <Link href="/privacy" className="font-bold hover:underline" style={{ color: '#22c55e' }}>
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">7. Disclaimer of Warranties</h2>
          <p>
            Dem is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or that any generated content will be accurate or suitable for your needs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Chukwudimma Ikoro and Dem App shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the service, including but not limited to health outcomes, data loss, or reliance on AI-generated content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">9. Modifications to the Service and Terms</h2>
          <p>
            We reserve the right to modify or discontinue the service at any time without notice. We may update these Terms periodically. Continued use of Dem after changes are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United States. Any disputes shall be resolved in the appropriate courts of the United States.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-gray-900">11. Contact</h2>
          <p>
            Questions about these Terms?{' '}
            <a href="mailto:hello@trydem.app" className="font-bold hover:underline" style={{ color: '#22c55e' }}>
              hello@trydem.app
            </a>
          </p>
        </section>

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
