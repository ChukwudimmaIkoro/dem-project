import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PLUS_PRICE_ID ?? '']: 'plus',
  [process.env.STRIPE_PREMIUM_PRICE_ID ?? '']: 'premium',
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ tier: 'basic' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (!subscriptions.data.length) {
      return NextResponse.json({ tier: 'basic' });
    }

    const priceId = subscriptions.data[0].items.data[0].price.id;
    const tier = PRICE_TO_TIER[priceId] ?? 'basic';

    await supabase
      .from('user_profiles')
      .update({ subscription_tier: tier })
      .eq('id', userId);

    return NextResponse.json({ tier });
  } catch (err) {
    console.error('sync-tier error:', err);
    return NextResponse.json({ tier: 'basic' });
  }
}
