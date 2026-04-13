'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const LS_KEY = 'dem-tutorial-seen';

// ── Local helpers ────────────────────────────────────────────────────────────

function getSeenLocal(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(LS_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch { return new Set(); }
}

function saveSeenLocal(seen: Set<string>): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify([...seen])); }
  catch { /* ignore */ }
}

// ── Cloud sync ───────────────────────────────────────────────────────────────

async function syncSeenToCloud(key: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // Append to the cloud array (PostgreSQL array_append via RPC would be ideal,
  // but a simple upsert merging the full local set is safer and idempotent)
  const seen = [...getSeenLocal()];
  await supabase
    .from('user_profiles')
    .update({ tutorials_seen: seen })
    .eq('id', user.id);
}

// ── Public: clear all seen tutorials (on plan reset) ────────────────────────

export async function clearTutorialsSeen(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_KEY);
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('user_profiles')
    .update({ tutorials_seen: [] })
    .eq('id', user.id);
}

// ── Public: pull cloud seen-set into localStorage on login ───────────────────

export async function restoreTutorialsSeen(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase
    .from('user_profiles')
    .select('tutorials_seen')
    .eq('id', user.id)
    .single();
  if (!data?.tutorials_seen?.length) return;
  // Merge cloud set with any local keys (union — never remove)
  const merged = new Set([...getSeenLocal(), ...(data.tutorials_seen as string[])]);
  saveSeenLocal(merged);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTutorial(pageKey: string): { shouldShow: boolean; dismiss: () => void } {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const seen = getSeenLocal();
    if (!seen.has(pageKey)) setShouldShow(true);
  }, [pageKey]);

  const dismiss = () => {
    // Mark locally first (instant)
    const seen = getSeenLocal();
    seen.add(pageKey);
    saveSeenLocal(seen);
    setShouldShow(false);
    // Sync to cloud (fire and forget)
    syncSeenToCloud(pageKey).catch(() => {});
  };

  return { shouldShow, dismiss };
}
