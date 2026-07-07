import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PLUS_PRICE_ID ?? '']: 'plus',
  [process.env.STRIPE_PREMIUM_PRICE_ID ?? '']: 'premium',
};

async function updateTier(
  customerId: string,
  tier: string,
  opts: { resetMascot?: boolean; setEverSubscribed?: boolean } = {},
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const update: Record<string, unknown> = { subscription_tier: tier };
  if (opts.resetMascot) update.mascot_items = ['', '', '', '', '', ''];
  if (opts.setEverSubscribed) update.has_ever_subscribed = true;
  await supabase
    .from('user_profiles')
    .update(update)
    .eq('stripe_customer_id', customerId);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = sub.items.data[0].price.id;
    const tier = PRICE_TO_TIER[priceId] ?? 'basic';
    await updateTier(customerId, tier, { setEverSubscribed: tier !== 'basic' });
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    const priceId = sub.items.data[0].price.id;
    const newTier = PRICE_TO_TIER[priceId] ?? 'basic';
    await updateTier(sub.customer as string, newTier, {
      resetMascot: newTier === 'basic',
      setEverSubscribed: newTier !== 'basic',
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await updateTier(sub.customer as string, 'basic', { resetMascot: true });
  }

  return NextResponse.json({ received: true });
}
