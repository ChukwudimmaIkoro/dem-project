import { callClaude } from '@/lib/ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { foods, mealType, energyLevel, userName } = await req.json();

    const complexityGuide = energyLevel === 'low'
      ? 'Very simple, minimal prep. Under 10 minutes. No cooking if possible.'
      : energyLevel === 'medium'
      ? 'Moderate prep, 15-20 minutes. Simple cooking allowed.'
      : 'Can be more involved, 20-30 minutes. Optimize for nutrition and macros.';

    const prompt = `You are a culinary expert and nutritionist. Your task is to create a high-quality ${mealType} recipe.

Before generating, think about what a well-tested, professional cookbook-quality recipe using these ingredients looks like — authentic techniques, realistic quantities, and clear actionable steps — then produce a recipe of equivalent quality and reliability.

Available ingredients (use as many as fit naturally): ${foods.join(', ')}

Energy level: ${energyLevel} — ${complexityGuide}

Produce ONLY this JSON, no other text:
{
  "name": "Recipe name (creative, appetizing — like a real cookbook title)",
  "tagline": "One evocative sentence describing the dish",
  "prepTime": "X minutes",
  "ingredients": [
    {"item": "ingredient name", "amount": "realistic quantity with units"},
    {"item": "ingredient name", "amount": "realistic quantity with units"}
  ],
  "steps": [
    "Clear, specific step",
    "Next step",
    "Final step"
  ],
  "nutrition": {
    "protein": "Xg",
    "carbs": "Xg",
    "fats": "Xg",
    "calories": "~XXX"
  },
  "tip": "A pro technique tip from a professional kitchen"
}

Use 4-7 ingredients. Quantities must be realistic (e.g. '2 cups', '1 tbsp', '3 oz'). Steps must be actionable and specific. Make it genuinely delicious and practical to cook at home.`;

    const message = await callClaude({
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const start = rawText.indexOf('{');
    const end   = rawText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON in response');
    const recipe = JSON.parse(rawText.slice(start, end + 1));

    return Response.json({ recipe, success: true });
  } catch (error) {
    console.error('AI meal error:', error);
    return Response.json({
      recipe: null,
      success: false,
      fallback: true,
    });
  }
}
