import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userName, dayNumber, energyLevel, completedTasks, streak, pillar } = await req.json();

    const displayName = userName || 'Friend';
    const energyDesc = energyLevel === 'high' ? 'high energy and feeling strong'
      : energyLevel === 'medium' ? 'moderate energy'
      : 'low energy and taking it easy';

    const pillarContext = pillar === 'diet' ? 'focusing on nutrition'
      : pillar === 'exercise' ? 'focusing on movement'
      : pillar === 'mentality' ? 'focusing on mental wellness (the most important pillar!)'
      : 'working on their health';

    const prompt = `You are Dem, a warm and encouraging AI health companion. Generate a SHORT, personalized message (max 12 words) for:

Patient name: ${displayName}
Day: ${dayNumber} of their 3-day plan
Energy today: ${energyDesc}
Current focus: ${pillarContext}
Tasks completed today: ${completedTasks?.length ?? 0}
Current streak: ${streak} day(s)

Rules:
- Max 12 words. Be specific to their context.
- Warm, friendly, slightly playful tone
- If low energy: be extra gentle and validating
- If high energy: be enthusiastic
- Occasionally use their name naturally
- No hashtags, no exclamation marks every time
- Vary style: sometimes a question, sometimes a statement, sometimes a fun observation
- Do NOT start with "I" or repeat the same pattern every time`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : "You're doing great!";

    return Response.json({ message: text });
  } catch (error) {
    console.error('AI companion error:', error);
    // Graceful fallback - app still works without AI
    return Response.json({ message: "Keep going, you've got this!" });
  }
}