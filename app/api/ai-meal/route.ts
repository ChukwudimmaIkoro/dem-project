import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { foods, mealType, energyLevel, userName } = await req.json();

    const complexityGuide = energyLevel === 'low'
      ? 'Very simple, minimal prep. Under 10 minutes. No cooking if possible.'
      : energyLevel === 'medium'
      ? 'Moderate prep, 15-20 minutes. Simple cooking allowed.'
      : 'Can be more involved, 20-30 minutes. Optimize for nutrition and macros.';

    const prompt = `You are a nutritionist creating a personalized ${mealType} recipe.

Available ingredients (use as many as fit naturally): ${foods.join(', ')}

Energy level: ${energyLevel} - ${complexityGuide}

Create a recipe in this EXACT JSON format, no other text:
{
  "name": "Recipe name (creative, appetizing)",
  "tagline": "One sentence description",
  "prepTime": "X minutes",
  "ingredients": [
    {"item": "ingredient name", "amount": "quantity"},
    {"item": "ingredient name", "amount": "quantity"}
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction",
    "Step 3 instruction"
  ],
  "nutrition": {
    "protein": "Xg",
    "carbs": "Xg", 
    "fats": "Xg",
    "calories": "~XXX"
  },
  "tip": "One quick pro tip"
}

Use 4-7 ingredients max. Keep steps clear and brief. Make it genuinely delicious.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const recipe = JSON.parse(cleaned);

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