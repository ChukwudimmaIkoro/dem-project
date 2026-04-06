/**
 * DEV_MODE is true when running `npm run dev` (NODE_ENV === 'development'),
 * or when NEXT_PUBLIC_DEV_MODE=true is set in .env.local (useful for testing
 * the dev panel on a production build without recompiling).
 *
 * Usage in components:
 *   import { DEV_MODE } from '@/lib/devMode';
 *   {DEV_MODE && <DevPanel ... />}
 */
export const DEV_MODE =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEV_MODE === 'true';
