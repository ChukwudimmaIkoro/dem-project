'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Clock, Zap, ChevronDown, ChevronUp, Loader, Sparkles } from 'lucide-react';
import { getCachedRecipe, setCachedRecipe, CachedRecipe } from '@/lib/storage';

interface AIRecipeCardProps {
  foods: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  energyLevel: 'low' | 'medium' | 'high';
  dayNumber: number;
  userName?: string;
}

const MEAL_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  breakfast: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', label: 'Breakfast' },
  lunch:     { bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-800',  label: 'Lunch'     },
  dinner:    { bg: 'bg-purple-50',border: 'border-purple-200',text: 'text-purple-800',label: 'Dinner'    },
  snack:     { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', label: 'Snack'     },
};

export default function AIRecipeCard({ foods, mealType, energyLevel, dayNumber, userName }: AIRecipeCardProps) {
  const [recipe, setRecipe] = useState<CachedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  // Load from cache on mount - NO auto-fetch
  useEffect(() => {
    const cached = getCachedRecipe(dayNumber, mealType);
    if (cached) setRecipe(cached);
  }, [dayNumber, mealType]);

  const handleGenerate = async () => {
    if (foods.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foods, mealType, energyLevel, userName }),
      });
      const data = await res.json();
      if (data.success && data.recipe) {
        setRecipe(data.recipe);
        setCachedRecipe(dayNumber, mealType, data.recipe); // persist forever
        setExpanded(true);
      } else {
        setError('Could not generate recipe. Try again.');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const style = MEAL_STYLES[mealType];

  // Not yet generated — show button
  if (!recipe) {
    return (
      <div className={`rounded-2xl border-2 p-3 mb-3 ${style.bg} ${style.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className={`w-4 h-4 ${style.text}`} />
            <span className={`text-xs font-semibold ${style.text}`}>
              AI {style.label} Recipe
            </span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || foods.length === 0}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
              transition-all active:scale-95
              ${loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : `bg-white ${style.text} border ${style.border} hover:shadow-sm`
              }
            `}
          >
            {loading ? (
              <><Loader className="w-3 h-3 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Recommend meal</>
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  // Recipe exists — show card (collapsible)
  return (
    <div className={`rounded-2xl border-2 mb-3 overflow-hidden ${style.bg} ${style.border}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className={`w-4 h-4 ${style.text}`} />
              <span className={`text-xs font-bold uppercase tracking-wide opacity-70 ${style.text}`}>
                AI Recipe · {style.label}
              </span>
            </div>
            <h3 className={`text-base font-bold ${style.text}`}>{recipe.name}</h3>
            <p className={`text-xs opacity-80 mt-0.5 ${style.text}`}>{recipe.tagline}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`flex items-center gap-1 text-xs ${style.text}`}>
                <Clock className="w-3 h-3" /> {recipe.prepTime}
              </span>
              <span className={`flex items-center gap-1 text-xs ${style.text}`}>
                <Zap className="w-3 h-3" /> {recipe.nutrition.calories} cal
              </span>
            </div>
          </div>
          <div className="ml-2 mt-1">
            {expanded
              ? <ChevronUp className={`w-5 h-5 opacity-60 ${style.text}`} />
              : <ChevronDown className={`w-5 h-5 opacity-60 ${style.text}`} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className={`px-4 pb-4 border-t ${style.border} pt-3`}>
          <h4 className={`font-bold text-sm mb-2 ${style.text}`}>Ingredients</h4>
          <div className="grid grid-cols-2 gap-1 mb-4">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="text-xs bg-white bg-opacity-60 rounded-lg px-2 py-1">
                <span className="font-semibold">{ing.amount}</span> {ing.item}
              </div>
            ))}
          </div>

          <h4 className={`font-bold text-sm mb-2 ${style.text}`}>Instructions</h4>
          <div className="space-y-2 mb-4">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-80 flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1 mb-3">
            {(['protein', 'carbs', 'fats', 'calories'] as const).map(key => (
              <div key={key} className="bg-white bg-opacity-60 rounded-lg p-1.5 text-center">
                <div className="text-xs font-bold">{recipe.nutrition[key]}</div>
                <div className="text-xs opacity-70 capitalize">{key}</div>
              </div>
            ))}
          </div>

          {recipe.tip && (
            <div className="bg-white bg-opacity-50 rounded-xl p-3">
              <p className="text-xs"><span className="font-bold">💡 Tip:</span> {recipe.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}