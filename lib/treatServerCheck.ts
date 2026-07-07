// Server-side treat gate — used by AI API routes.
// Verifies the user's JWT, checks their tier limit against the cloud treat count,
// increments on success. Cannot be bypassed by clearing localStorage.

import { createClient } from '@supabase/supabase-js';

const TIER_LIMITS: Record<string, number> = { basic: 2, plus: 4, premium: 999 };
const TREATS_CLOUD_KEY = 'thinky-treats';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export type TreatCheckOk  = { ok: true;  userId: string; newUsed: number };
export type TreatCheckFail = { ok: false; status: number; error: string };
export type TreatCheckResult = TreatCheckOk | TreatCheckFail;

export async function checkAndUseTreat(token: string): Promise<TreatCheckResult> {
  if (!token) {
    return { ok: false, status: 401, error: 'Sign in to use AI features.' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { ok: false, status: 401, error: 'Sign in to use AI features.' };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const tier  = (profile?.subscription_tier as string) ?? 'basic';
  const limit = TIER_LIMITS[tier] ?? 2;

  // Premium users are unlimited — skip cloud read/write
  if (limit >= 999) return { ok: true, userId: user.id, newUsed: 0 };

  const { data: cached } = await supabase
    .from('ai_cache')
    .select('cache_value')
    .eq('user_id', user.id)
    .eq('cache_key', TREATS_CLOUD_KEY)
    .single();

  const payload = cached?.cache_value as { date: string; used: number } | null;
  const today   = todayDateString();
  const used    = payload?.date === today ? (payload?.used ?? 0) : 0;

  if (used >= limit) {
    return { ok: false, status: 429, error: 'Out of Treats! Resets tomorrow.' };
  }

  const newUsed = used + 1;
  await supabase.from('ai_cache').upsert(
    { user_id: user.id, plan_id: null, cache_key: TREATS_CLOUD_KEY, cache_value: { date: today, used: newUsed } },
    { onConflict: 'user_id,cache_key' },
  );

  return { ok: true, userId: user.id, newUsed };
}
