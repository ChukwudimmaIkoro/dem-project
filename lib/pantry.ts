const PANTRY_KEY = 'dem-pantry';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PantryItem {
  id: string;
  name: string;
  mealTypes: MealType[];
  addedAt: string;
}

// ─── Keyword classifier ───────────────────────────────────────────────────────

const MEAL_KEYWORDS: Record<MealType, string[]> = {
  breakfast: ['egg','oat','oatmeal','cereal','toast','waffle','pancake','yogurt','granola','muffin','bagel',
              'bacon','sausage','coffee','juice','milk','smoothie','crepe','biscuit','hash brown','french toast'],
  snack:     ['nut','almond','cashew','walnut','peanut','chip','cracker','popcorn','pretzel','apple','orange',
              'grape','candy','chocolate','hummus','celery','carrot','string cheese','raisin','dried fruit','trail mix'],
  lunch:     ['salad','sandwich','wrap','soup','sushi','taco','burrito','quesadilla','panini','deli',
              'ham','turkey','lettuce','tomato','cucumber','pita','falafel','noodle soup','ramen'],
  dinner:    ['chicken','beef','steak','salmon','fish','shrimp','pork','lamb','tofu','pasta','rice','noodle',
              'broccoli','potato','garlic','onion','curry','roast','grill','bake','casserole','stew','chili',
              'meatball','burger','pizza','lasagna','fillet','loin','chop'],
};

export function classifyMealTypes(name: string): MealType[] {
  const lower = name.toLowerCase();
  const matches = (Object.keys(MEAL_KEYWORDS) as MealType[]).filter(type =>
    MEAL_KEYWORDS[type].some(kw => lower.includes(kw))
  );
  return matches.length > 0 ? matches : [];
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

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

export function addPantryItem(name: string, mealTypes: MealType[]): PantryItem[] {
  const items = loadPantry();
  const trimmed = name.trim();
  if (!trimmed) return items;
  if (items.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) return items;
  const updated = [...items, { id: crypto.randomUUID(), name: trimmed, mealTypes, addedAt: new Date().toISOString() }];
  savePantry(updated);
  return updated;
}

export function removePantryItem(id: string): PantryItem[] {
  const updated = loadPantry().filter(i => i.id !== id);
  savePantry(updated);
  return updated;
}

/** Returns pantry item names that belong to a given meal slot */
export function getPantryForMeal(mealType: MealType): string[] {
  return loadPantry()
    .filter(i => (i.mealTypes ?? []).includes(mealType))
    .map(i => i.name);
}
