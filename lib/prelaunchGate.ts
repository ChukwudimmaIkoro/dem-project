// Pre-launch billing gate: subscription checkout/portal and wardrobe customization
// (tier-gated cosmetics) are only visible and usable for allowlisted tester accounts,
// or in local dev, until Dem publicly launches. Remove this gate at launch.

const TESTER_EMAILS = ['chuchuikoro@gmail.com'];

export function isPrelaunchTester(email?: string | null): boolean {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true') return true;
  return !!email && TESTER_EMAILS.includes(email.toLowerCase());
}
