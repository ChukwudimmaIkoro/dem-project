import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY   = process.env.RESEND_FULL_ACCESS_API_KEY!;
const AUDIENCE_ID      = 'ce4f090e-6752-42d7-9d97-005b6898c72b';
const FROM_ADDRESS     = 'Dem <noreply@trydem.app>';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Add contact to Resend audience
  const contactRes = await fetch(
    `https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    }
  );

  if (!contactRes.ok && contactRes.status !== 409) {
    // 409 = already on list, treat as success
    return NextResponse.json({ error: 'Could not add to waitlist' }, { status: 500 });
  }

  // Send welcome email
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: email,
      subject: "You're on the Dem waitlist 🌱",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f0fdf4;border-radius:16px;">
          <img src="https://trydem.app/mascot-email.svg" alt="Dem mascot" width="80" height="80" style="display:block;margin:0 auto 16px;" />
          <h1 style="font-size:32px;font-weight:900;color:#111827;margin:0 0 4px;">Dem</h1>
          <p style="font-size:13px;color:#6b7280;margin:0 0 24px;">Diet · Exercise · Mentality</p>
          <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 12px;">You're on the list. 🎉</p>
          <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 16px;">
            Thanks for signing up for early access to Dem, the health companion app that adapts to how you actually feel every day, not how you're supposed to feel.
          </p>
          <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 24px;">
            We'll reach out as soon as your early access spot is ready. In the meantime, we're building, and we'll share updates along the way.
          </p>
          <div style="background:#dcfce7;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
            <p style="font-size:13px;font-weight:700;color:#15803d;margin:0 0 6px;">Early access includes:</p>
            <ul style="font-size:13px;color:#166534;margin:0;padding-left:18px;line-height:1.8;">
              <li>First access before public launch</li>
              <li>Bonus Thinky Treats on day one</li>
              <li>Early Energizer badge on your profile</li>
              <li>Be a part of every step of the journey</li>
            </ul>
          </div>
          <p style="font-size:12px;color:#9ca3af;margin:0;">
            Questions? Reply to this email or reach us at <a href="mailto:hello@trydem.app" style="color:#16a34a;">hello@trydem.app</a>
          </p>
        </div>
      `,
    }),
  });

  return NextResponse.json({ success: true });
}
