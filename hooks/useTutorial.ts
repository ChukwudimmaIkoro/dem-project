'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dem-tutorial-seen';

function getSeenSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function markSeen(pageKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const seen = getSeenSet();
    seen.add(pageKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch { /* ignore */ }
}

export function useTutorial(pageKey: string): { shouldShow: boolean; dismiss: () => void } {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const seen = getSeenSet();
    if (!seen.has(pageKey)) setShouldShow(true);
  }, [pageKey]);

  const dismiss = () => {
    markSeen(pageKey);
    setShouldShow(false);
  };

  return { shouldShow, dismiss };
}
