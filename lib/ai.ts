import Anthropic from '@anthropic-ai/sdk';

// Primary model with automatic fallback on 404/400
const MODEL_PREFERENCE = [
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
] as const;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface MessageParams {
  max_tokens: number;
  messages: Anthropic.MessageParam[];
  system?: string;
}

export async function callClaude(params: MessageParams): Promise<Anthropic.Message> {
  let lastError: unknown;

  for (const model of MODEL_PREFERENCE) {
    try {
      const msg = await anthropic.messages.create({ ...params, model });
      return msg as Anthropic.Message;
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const isModelUnavailable = status === 404 || status === 400;

      if (isModelUnavailable && model !== MODEL_PREFERENCE[MODEL_PREFERENCE.length - 1]) {
        console.warn(`[ai] Model "${model}" unavailable (${status}), trying fallback.`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
