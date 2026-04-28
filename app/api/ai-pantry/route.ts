import { callClaude } from '@/lib/ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { pantryItems, energyLevel, userName } = await req.json();

    const complexityGuide = energyLevel === 'low'
      ? 'Very simple, minimal prep. Under 10 minutes. No cooking if possible.'
      : energyLevel === 'medium'
      ? 'Moderate prep, 15-20 minutes. Simple cooking allowed.'
      : 'Can be more involved, 20-30 minutes. Optimize for nutrition and macros.';

    const prompt = `You are a culinary expert and nutritionist. ${userName ? `You're cooking for ${userName}.` : ''} Create a practical, delicious meal using ONLY ingredients the user already has at home.

Pantry items available: ${pantryItems.join(', ')}

Energy level today: ${energyLevel} — ${complexityGuide}

You may assume the user has basic pantry staples (salt, pepper, oil, water) even if not listed. Use only what's in the pantry list plus those staples. Do NOT suggest going to the store.

Produce ONLY this JSON, no other text:
{
  "name": "Recipe name (creative, appetizing)",
  "tagline": "One sentence describing the dish",
  "prepTime": "X minutes",
  "ingredients": [
    {"item": "ingredient name", "amount": "realistic quantity with units"}
  ],
  "steps": [
    "Clear, specific step",
    "Next step"
  ],
  "nutrition": {
    "protein": "Xg",
    "carbs": "Xg",
    "fats": "Xg",
    "calories": "~XXX"
  },
  "tip": "A pro technique or substitution tip"
}

Use only ingredients from the pantry list (plus salt/pepper/oil/water). Quantities must be realistic. Steps must be actionable. Make it genuinely good.`;

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
    console.error('AI pantry error:', error);
    return Response.json({ recipe: null, success: false });
  }
}
