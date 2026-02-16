import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { energyHistory, completionHistory, userName, streak } = await req.json();

    // Rule-based detection first (fast, no API needed)
    const alerts = [];
    const displayName = userName || 'Patient';

    // 3+ consecutive low energy days = clinical flag
    if (energyHistory.length >= 3 && energyHistory.slice(-3).every((e: string) => e === 'low')) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'ENERGY_DECLINE',
        message: `${displayName} has reported low energy for 3+ consecutive days`,
        recommendation: 'Consider scheduling a check-in call',
      });
    }

    // All tasks missed for 2+ days
    const recentCompletion = completionHistory.slice(-2);
    const allMissed = recentCompletion.every((day: any) =>
      !day.diet && !day.exercise && !day.mentality
    );
    if (allMissed && completionHistory.length >= 2) {
      alerts.push({
        severity: 'HIGH',
        type: 'ENGAGEMENT_DROP',
        message: `${displayName} has not completed any tasks in 2+ days`,
        recommendation: 'Patient may need additional support or plan adjustment',
      });
    }

    // Generate AI narrative insight
    const prompt = `You are an AI health analyst for a hospital care team. Analyze this patient data and provide a brief clinical observation.

Patient: ${displayName}
Energy levels (most recent last): ${energyHistory.join(' -> ')}
Streak: ${streak} days
Recent completion: ${JSON.stringify(completionHistory)}
Alerts detected: ${alerts.map(a => a.type).join(', ') || 'none'}

Respond in this EXACT JSON format. Do NOT use any emoji characters anywhere in your response:
{
  "trend": "improving" | "stable" | "declining" | "insufficient_data",
  "insight": "One clear sentence about their pattern (max 15 words, no emoji)",
  "patientMessage": "Encouraging message for the patient (max 12 words, no emoji)",
  "careNote": "Brief clinical note for care team (max 20 words, no emoji, clinical tone)"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const aiInsight = JSON.parse(cleaned);

    return Response.json({
      alerts,
      insight: aiInsight,
      success: true,
    });
  } catch (error) {
    console.error('AI insights error:', error);
    return Response.json({
      alerts: [],
      insight: {
        trend: 'stable',
        insight: 'Keep up the great work on your recovery journey.',
        patientMessage: 'Every small step counts toward your recovery.',
        careNote: 'Patient engagement within normal parameters.',
      },
      success: false,
    });
  }
}