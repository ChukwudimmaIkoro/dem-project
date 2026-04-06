import { callClaude } from '@/lib/ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { exerciseName, description, intensity, energyLevel } = await req.json();

    const prompt = `You are a certified personal trainer. Give safe, clear coaching for "${exerciseName}".

Exercise details:
- Description: ${description}
- Intensity: ${intensity}
- User's energy today: ${energyLevel}

Respond in this EXACT JSON format, no other text:
{
  "cue": "One energizing coaching cue (max 12 words)",
  "steps": [
    "Step 1: how to do this exercise",
    "Step 2",
    "Step 3"
  ],
  "formTips": [
    "Key form point to keep in mind",
    "Another form tip"
  ],
  "modification": "If this feels too hard or too easy, try this instead",
  "searchQuery": "${exerciseName} proper form tutorial"
}

Keep steps numbered and brief. Adapt tone to energy level: calm for low, encouraging for medium, energetic for high.`;

    const message = await callClaude({
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const coaching = JSON.parse(cleaned);

    return Response.json({ coaching, success: true });
  } catch (error) {
    console.error('AI exercise error:', error);
    return Response.json({ coaching: null, success: false });
  }
}
