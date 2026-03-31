/**
 * DEV_MODE is true when running `npm run dev` (NODE_ENV === 'development').
 * In production builds, this is always false — dev tools are never shown to users.
 *
 * Usage in components:
 *   import { DEV_MODE } from '@/lib/devMode';
 *   {DEV_MODE && <DevPanel ... />}
 */
export const DEV_MODE = process.env.NODE_ENV === 'development';
