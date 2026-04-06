import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ─── Database row types ──────────────────────────────────────────────────────

export interface UserProfileRow {
  id: string;
  name: string;
  goals: string[];
  selected_foods: string[];
  selected_exercises: string[];
  selected_mentality: string[];
  no_food_preference: boolean;
  no_exercise_preference: boolean;
  no_mentality_preference: boolean;
  historical_streak: number;
  dummy_currency: number;
  created_at: string;
}

export interface UserPlanRow {
  id: string;
  user_id: string;
  plan_data: object; // ThreeDayPlan serialized as JSONB
  is_active: boolean;
  created_at: string;
}

export interface AICacheRow {
  id: string;
  user_id: string;
  plan_id: string | null;
  cache_key: string;
  cache_value: object;
  created_at: string;
}
