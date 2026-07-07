import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
  if (verifyError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Cancel any active Stripe subscriptions before deleting the user
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (profile?.stripe_customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
    });
    await Promise.all(
      subscriptions.data.map(sub => stripe.subscriptions.cancel(sub.id)),
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
