# Session Fix Verification — Test Sheet

Run these after deploying. Each section maps to one fix from this session.

---

## Before You Start

Run these SQL statements in the Supabase SQL Editor (one-time migration):

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_ever_subscribed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_waitlisted BOOLEAN DEFAULT FALSE;
```

Then run the full updated `handle_new_user()` trigger from `supabase/schema.sql`
and create the `waitlist_emails` table (also in schema.sql).

---

## Fix 1 — Plan Expired fires on last active day (was Bug 2)

**What changed:** `planExpired` now uses raw calendar diff against `startDate`, not the clamped `activeDayIdx`.

### Test
1. Start a fresh 3-day plan.
2. Complete Day 1 and Day 2 (or use Dev Panel → Complete Day twice).
3. **On Day 3 (last day, not yet complete):**
   - [ ] Plan view shows Day 3 content normally — no "Plan Expired" banner
   - [ ] Mascot streak counter is NOT grayed out
   - [ ] Complete Day 3 — celebration fires, streak increments
4. Use Dev Panel → Next Day once more (past the end of the 3-day window).
   - [ ] **Now** the expired state fires — grayed streak, expired message
   - [ ] Extension/restart options appear

---

## Fix 2 — Display name doesn't sync cross-device (was Bug 3)

**What changed:** `handleSaveName` now calls `syncUserProfile()` after saving locally so `user_profiles.name` updates in the DB.

### Test
1. Sign in on Device A.
2. Go to Settings → Account Settings → edit display name to "TestName123".
3. Save.
   - [ ] Name updates immediately in the Account tab header on Device A
4. Sign out, sign back in on Device B (or same browser, incognito).
   - [ ] Name shown is "TestName123" (loaded from cloud on bootstrap)
5. Check Supabase: `SELECT name FROM user_profiles WHERE id = '<your-user-id>'`
   - [ ] Row shows "TestName123"

---

## Fix 3 — Password change allows 6-char passwords (was Bug 5)

**What changed:** `handleSavePassword` validation raised from 6 → 8 characters.

### Test
1. Settings → Account Settings → Change Password.
2. Enter a 7-character password (e.g. "abc1234").
   - [ ] Toast shows "Password must be at least 8 characters." — save blocked
3. Enter a valid 8+ character password.
   - [ ] Save succeeds, toast shows "Password updated!"
4. Sign out, sign back in with the new password.
   - [ ] Login succeeds

---

## Fix 4 — Manage subscription silently fails (was Bug 6)

**What changed:** `handleManageSubscription` wrapped in try/catch; shows error toast on failure.

### Test (simulating failure)
1. Temporarily point the portal URL to a bad endpoint (or test with a Stripe key that has no customer).
2. Click "Manage subscription" in Settings → Subscription.
   - [ ] Error toast appears: "Could not open billing portal. Please try again."
   - [ ] No silent hang or blank redirect

### Normal path test
1. On a subscribed account, click "Manage subscription".
   - [ ] Stripe billing portal opens in browser
   - [ ] Cancel subscription in portal → tier reverts to basic within minutes

---

## Fix 5 — Account deletion doesn't cancel Stripe subscription (was Bug 4)

**What changed:** `/api/delete-account` now cancels all active Stripe subscriptions before deleting the Supabase user.

### Test
1. On a Plus or Premium account, go to Settings → Danger Zone → Delete Account.
2. Confirm deletion.
   - [ ] Account is deleted (redirected to auth screen)
3. In Stripe Dashboard → Customers, find the customer by email.
   - [ ] Subscription status shows "Canceled" (not "Active")
   - [ ] No future invoice scheduled

---

## Fix 6 — Subscription clothing removed on downgrade (spec confirmed correct)

**What changed:** Previous session confirmed `resetMascot=true` on downgrade is correct per current spec. Webhook now also sets `has_ever_subscribed=true` on upgrade.

### Test
1. On Basic account, go to Settings → Subscription → upgrade to Plus.
2. Complete Stripe Checkout.
   - [ ] Tier badge shows "Plus"
   - [ ] Check Supabase: `SELECT has_ever_subscribed FROM user_profiles WHERE ...`
     - [ ] Value is `true`
3. Equip a Plus-tier mascot item in Settings → Wardrobe.
4. Go to Settings → Subscription → Manage subscription → cancel in portal.
5. Wait for webhook (or use Stripe CLI to trigger `customer.subscription.deleted`).
   - [ ] Tier reverts to "Basic"
   - [ ] Equipped Plus item is **removed** from mascot (mascot_items reset to empty)
   - [ ] Wardrobe shows locked items with 🔒 Sub label

---

## Fix 7 — Waitlist flag (`has_waitlisted`)

**What changed:** `/api/waitlist` now stores emails in a `waitlist_emails` Supabase table. The `handle_new_user()` trigger checks this table at signup and sets `has_waitlisted=true` automatically.

### Test A — Waitlist then sign up
1. In Supabase SQL Editor, insert a test email:
   ```sql
   INSERT INTO waitlist_emails (email) VALUES ('test+waitlist@yourdomain.com')
   ON CONFLICT (email) DO NOTHING;
   ```
2. Create a new account at `https://trydem.app` using exactly `test+waitlist@yourdomain.com`.
3. Complete onboarding.
4. Check Supabase:
   ```sql
   SELECT has_waitlisted FROM user_profiles
   WHERE id = (SELECT id FROM auth.users WHERE email = 'test+waitlist@yourdomain.com');
   ```
   - [ ] Value is `true`

### Test B — Sign up without waitlist
1. Create a new account with a fresh email that was NOT in `waitlist_emails`.
4. Check Supabase — `has_waitlisted` should be `false`.

### Test C — Waitlist form flow (landing page)
1. In `app/page.tsx`, temporarily change `if (false && ...)` to `if (!localStorage.getItem('dem-skip-landing'))` and deploy/run locally.
2. Open the app in a fresh private window.
3. Submit your email on the waitlist form.
   - [ ] "You're on the list!" success state shown
   - [ ] Email appears in Supabase `waitlist_emails` table
   - [ ] Email appears in Resend audience
   - [ ] Welcome email received
4. Create an account with that email.
   - [ ] `has_waitlisted = true` in Supabase

---

## Fix 8 — Server-side AI rate limiting

**What changed:** Both `/api/ai-meal` and `/api/ai-exercise` now verify the user's JWT and check treat usage in Supabase `ai_cache`. Limits cannot be bypassed by clearing localStorage or calling the API directly.

### Test A — Normal authenticated flow
1. Sign in as a Basic user (2 treats/day).
2. Use Dev Panel to reset treats if needed.
3. Generate an AI meal recipe.
   - [ ] Succeeds. Treat counter decrements from 2 → 1.
4. Generate a second AI recipe.
   - [ ] Succeeds. Treat counter decrements to 0.
5. Try to generate a third.
   - [ ] Button shows "Out of Treats! Resets tomorrow." — no API call made (client gate).
   - [ ] If you bypass client and call API manually (curl/Postman with valid token):
     ```bash
     curl -X POST https://trydem.app/api/ai-meal \
       -H "Authorization: Bearer <your-access-token>" \
       -H "Content-Type: application/json" \
       -d '{"foods":["chicken","rice"],"mealType":"lunch","energyLevel":"medium"}'
     ```
   - [ ] Returns `{"success":false,"error":"Out of Treats! Resets tomorrow."}` with HTTP 429

### Test B — Bypass attempt without auth token
1. Call the API with NO Authorization header:
   ```bash
   curl -X POST https://trydem.app/api/ai-meal \
     -H "Content-Type: application/json" \
     -d '{"foods":["chicken"],"mealType":"lunch","energyLevel":"medium"}'
   ```
   - [ ] Returns `{"success":false,"error":"Sign in to use AI features."}` with HTTP 401

### Test C — Plus tier (4 treats)
1. Sign in as a Plus subscriber.
2. Generate 4 AI recipes/coach tips in any combination.
   - [ ] All 4 succeed.
3. 5th attempt:
   - [ ] Blocked server-side with 429.

### Test D — Premium tier (unlimited)
1. Sign in as Premium subscriber.
2. Generate 5+ AI items in a row.
   - [ ] All succeed — no 429.
   - [ ] Treat counter shows ∞.

### Test E — Treat count stays in sync cross-device
1. Sign in on Device A (Basic). Generate 1 recipe. (Cloud: used=1)
2. Sign in on Device B with same account.
3. Generate 1 more recipe on Device B.
   - [ ] Succeeds (used=2, at limit now).
4. Try a 3rd on Device B.
   - [ ] Blocked. Counter correctly shows 0.
5. Go back to Device A.
   - [ ] Counter syncs from cloud on next sign-in or page refresh — shows 0.

---

## Quick Regression Check

After running the above, do a quick smoke test of unrelated features to confirm nothing broke:

- [ ] Day completion fires celebration animation
- [ ] Streak increments correctly
- [ ] Mascot items load in wardrobe
- [ ] Plan generates on onboarding completion
- [ ] Dev Panel still works (Konami code)
