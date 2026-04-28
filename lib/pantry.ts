const PANTRY_KEY = 'dem-pantry';

export interface PantryItem {
  id: string;
  name: string;
  addedAt: string;
}

export function loadPantry(): PantryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PANTRY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function savePantry(items: PantryItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
}

export function addPantryItem(name: string): PantryItem[] {
  const items = loadPantry();
  const trimmed = name.trim();
  if (!trimmed) return items;
  if (items.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) return items;
  const updated = [...items, { id: crypto.randomUUID(), name: trimmed, addedAt: new Date().toISOString() }];
  savePantry(updated);
  return updated;
}

export function removePantryItem(id: string): PantryItem[] {
  const updated = loadPantry().filter(i => i.id !== id);
  savePantry(updated);
  return updated;
}
