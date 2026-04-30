import { callClaude } from '@/lib/ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, protocol, energyLevel } = await req.json();

    const prompt = `You are a licensed mental health clinician. Guide the user through the "${title}" technique, which is drawn from ${protocol} protocols.

User's energy level today: ${energyLevel}

Give a step-by-step guided walkthrough. Keep language warm but grounded — no toxic positivity, no vague affirmations. Be specific and clinically accurate.

Respond in this EXACT JSON format, no other text:
{
  "rationale": "One sentence explaining the clinical basis of this technique (what it targets, why it works)",
  "steps": [
    "Step 1 with specific instruction",
    "Step 2",
    "Step 3"
  ],
  "noticePrompt": "One question to ask yourself after completing this (e.g. 'Notice: did your heart rate shift?')",
  "whenToUse": "Brief note on when this technique is most helpful"
}

Adapt pacing to energy level: slower and gentler for low, moderate for medium, more active for high. Keep each step concrete and actionable.`;

    const message = await callClaude({
      max_tokens: 450,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const guide = JSON.parse(cleaned);

    return Response.json({ guide, success: true });
  } catch (error) {
    console.error('AI mentality error:', error);
    return Response.json({ guide: null, success: false });
  }
}
