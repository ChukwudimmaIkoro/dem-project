# Dem — Stage 1 Pre-Launch Testing Guide

## Setup Before You Start

### Run these SQL migrations in Supabase SQL Editor (one-time)
```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_ever_subscribed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_waitlisted BOOLEAN DEFAULT FALSE;
```
Also run the `waitlist_emails` table creation and updated `handle_new_user()` trigger from `supabase/schema.sql`.

### Test Accounts
| Account | Purpose |
|---------|---------|
| `test+basic@trydem.app` | Free-tier user |
| `test+plus@trydem.app` | Plus subscriber |
| Your real account | Personal regression |

Create these in the live app at `https://trydem.app`. Use strong passwords (8+ chars, upper, lower, number, special).

### Stripe Test Cards
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined |
| `4000 0025 0000 3155` | 3D Secure required |

Use any future expiry date and any 3-digit CVC.

### Dev Panel
Unlock: type `↑ ↑ ↓ ↓ ← → ← → B A` on the plan view (arrow keys / taps).
Buttons: **Next Day**, **Complete Day**, **Reset Plan**, and tier switchers.

---

## 1. Core User Flows

### 1.1 New User — Full Onboarding
- [ ] Open `https://trydem.app` on a fresh device or incognito
- [ ] Sign up with a new email — confirm email if prompted
- [ ] Complete onboarding: enter name, select goals, pick foods/exercises/mentality
- [ ] **Expected:** plan generates with Day 1 active, energy modal appears
- [ ] Set energy to **high** — plan content should look intense
- [ ] Set energy to **low** — plan should look easier
- [ ] **Expected:** mascot reacts with color change (green=high, yellow=medium, blue=low)

### 1.2 "No Preference" Onboarding
- [ ] Sign up fresh, select **No preference** for all 3 categories
- [ ] **Expected:** plan generates without crashing; uses full food/exercise/mentality database

### 1.3 Complete a Full Day
- [ ] Check off diet pillar (mark as done)
- [ ] Check off exercise pillar
- [ ] Check off mentality pillar
- [ ] **Expected:** celebration animation fires, streak increments by 1
- [ ] **Expected:** energy is now locked (can't re-open energy modal)
- [ ] **Expected:** habit pillar (if set) checkbox appears alongside the 3 pillars

### 1.4 Complete a Full Plan Cycle
1. Start a 3-day plan
2. Complete Day 1, use Dev Panel "Next Day" to advance to Day 2
3. Complete Day 2, advance to Day 3
4. Complete Day 3
- [ ] **Expected:** streak complete tutorial message fires
- [ ] **Expected:** extension modal appears with options to extend to 5, 7, 14, 30 days
- [ ] Select 7 days → new plan starts with `carryOverStreak = 3`
- [ ] **Expected:** displayed streak shows 3, new Day 1 starts fresh

### 1.5 Miss a Day (Broken Streak)
1. Start a 3-day plan
2. Complete Day 1
3. Use Dev Panel "Next Day" twice (skip Day 2)
- [ ] **Expected:** Day 2 shows "Day Has Passed" banner
- [ ] **Expected:** streak on Day 3 shows 0 (not 1)
- [ ] Complete Day 3
- [ ] **Expected:** streak still shows 0 (broken streak)

### 1.6 Plan Expired — FIXED
- [ ] Start a 3-day plan, complete Day 1 and Day 2 only
- [ ] On Day 3 (not yet completed): **Expected:** no "Plan Expired" banner — Day 3 is still active
- [ ] Use Dev Panel → Next Day (goes past the 3-day window)
- [ ] **Expected:** expired state fires NOW (grayed streak, expired message, restart option)

### 1.7 Pillar Dice Shuffle
- [ ] On the diet tab, tap the dice icon next to a meal
- [ ] **Expected:** meal swaps to a different item from the selected food pool
- [ ] Shuffle multiple times — meals rotate through available options

### 1.8 Dem Habit
- [ ] Go to Settings tab → Dem Habit section
- [ ] Enter a habit (e.g., "Drink 8 glasses of water")
- [ ] **Expected:** a 4th "Habit" pillar appears in the plan view
- [ ] Check habit off — all 4 pillars complete
- [ ] Clear habit → **Expected:** habit pillar disappears from plan view

---

## 2. Auth & Sync

### 2.1 Session Restore (Same Device)
- [ ] Sign in, complete Day 1
- [ ] Close tab, reopen `https://trydem.app`
- [ ] **Expected:** app loads directly to plan view (no loading screen flash)
- [ ] **Expected:** streak and completed state are intact

### 2.2 Cross-Device Sync
- [ ] Sign in on Device A, complete Day 1
- [ ] Sign in on Device B with the same account
- [ ] **Expected:** plan, streak, mascot items all match Device A
- [ ] Generate an AI recipe on Device A
- [ ] Reload Device B
- [ ] **Expected:** AI recipe appears on Device B (cloud cache sync)

### 2.3 Sign Out / Sign In
- [ ] Sign out (Account tab → Sign Out)
- [ ] **Expected:** redirected to auth screen, localStorage cleared
- [ ] Sign back in
- [ ] **Expected:** plan and streak restored from cloud

### 2.4 Duplicate Email Sign-Up
- [ ] Try signing up with an already-registered email
- [ ] **Expected:** friendly error "An account with this email already exists"
- [ ] No crash, user can switch to Sign In

### 2.5 Password Reset
- [ ] On sign-in screen, trigger "Forgot password" flow (if present) or test via Supabase dashboard
- [ ] **Expected:** reset email arrives at `hello@trydem.app` sender

### 2.6 Account Deletion — FIXED
- [ ] Go to Settings → Danger Zone → Delete Account
- [ ] **Expected:** confirmation prompt before deletion
- [ ] Confirm delete
- [ ] **Expected:** Supabase user deleted, localStorage cleared, redirected to auth
- [ ] **Expected (new):** Stripe subscription also canceled — verify in Stripe Dashboard

### 2.7 Display Name Edit — FIXED
- [ ] Settings → Account Settings → Edit display name
- [ ] Save new name
- [ ] **Expected:** name updates immediately in the Account tab header
- [ ] Sign out and back in on a different device
- [ ] **Expected:** new name persists (synced to `user_profiles.name` in DB)

### 2.8 Password Change — FIXED
- [ ] Settings → Account Settings → Change Password
- [ ] Try a 7-character password → **Expected:** "Password must be at least 8 characters."
- [ ] Enter a valid 8+ character password + confirm
- [ ] **Expected:** success toast
- [ ] Sign out, sign back in with new password
- [ ] **Expected:** successful login

---

## 3. Thinky Treats & AI — SERVER-ENFORCED

### 3.1 Treat Limits by Tier
| Tier | Daily limit | Test |
|------|-------------|------|
| Basic | 2 | 3rd AI call shows "Out of Treats! Resets tomorrow." |
| Plus | 4 | 5th AI call blocked |
| Premium | ∞ | Never blocked |

- [ ] On Basic account: generate 2 AI recipes → 3rd attempt blocked client-side
- [ ] **Bypass test (direct API call without token):**
  ```bash
  curl -X POST https://trydem.app/api/ai-meal \
    -H "Content-Type: application/json" \
    -d '{"foods":["chicken"],"mealType":"lunch","energyLevel":"medium"}'
  ```
  **Expected:** HTTP 401 `{"success":false,"error":"Sign in to use AI features."}`
- [ ] **Bypass test (valid token, but limit exceeded):**
  ```bash
  curl -X POST https://trydem.app/api/ai-meal \
    -H "Authorization: Bearer <access-token>" \
    -H "Content-Type: application/json" \
    -d '{"foods":["chicken"],"mealType":"lunch","energyLevel":"medium"}'
  ```
  **Expected:** HTTP 429 `{"success":false,"error":"Out of Treats! Resets tomorrow."}`

### 3.2 AI Recipe Generation
- [ ] On an active day (not past), tap "Suggest meal" on breakfast card
- [ ] **Expected:** loading spinner, then recipe card expands with name, tagline, prep time, calories
- [ ] Expand full recipe → ingredients, steps, tip all present
- [ ] Tap "New suggestion" → new recipe generates (costs 1 treat)
- [ ] **Expected:** recipe card on a PAST day shows no generate button (view-only)

### 3.3 AI Recipe Cache
- [ ] Generate recipe for breakfast on Day 1
- [ ] Reload page
- [ ] **Expected:** recipe still visible (loaded from local cache)
- [ ] Open same account on different device
- [ ] **Expected:** recipe loads from cloud cache without regenerating

### 3.4 AI Exercise Coach
- [ ] Tap "Coach" on an exercise card
- [ ] **Expected:** coaching cue, steps, form tips, and YouTube link load
- [ ] **Expected:** locked on past days (no Coach button shown)

### 3.5 AI Health Insights (Progress Tab)
- [ ] Go to Progress tab → "Get Insights" (if available based on streak data)
- [ ] **Expected:** insight card shows trend, patient message, alerts section

### 3.6 Treat Reset at Midnight
- [ ] Use all treats, note the reset time
- [ ] After midnight, reopen app
- [ ] **Expected:** treat counter resets to daily limit

---

## 4. Stripe & Subscriptions

### 4.1 Upgrade to Plus
- [ ] Go to Settings → Subscription → tap **Plus $0.99/mo**
- [ ] **Expected:** Stripe Checkout opens in browser
- [ ] Enter test card `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] **Expected:** checkout completes, redirects back to app
- [ ] **Expected:** tier badge shows "Plus", treat limit becomes 4/day
- [ ] **Expected (new):** Supabase `has_ever_subscribed = true`

### 4.2 Upgrade to Premium
- [ ] Same flow with **Premium $2.99/mo**
- [ ] **Expected:** tier badge shows "Premium", treat counter shows ∞

### 4.3 Declined Card
- [ ] In Stripe Checkout, use `4000 0000 0000 9995`
- [ ] **Expected:** Stripe shows decline message
- [ ] **Expected:** user remains on Basic tier after closing checkout

### 4.4 Manage Subscription — FIXED
- [ ] On a subscribed account, go to Settings → Subscription → "Manage subscription"
- [ ] **Expected:** opens Stripe billing portal (no silent failure)
- [ ] If portal call fails: **Expected:** error toast "Could not open billing portal. Please try again."
- [ ] Cancel subscription in portal
- [ ] **Expected:** on next login or within minutes, tier reverts to Basic
- [ ] **Expected:** mascot items reset (clothing removed on downgrade — current spec)

### 4.5 Mascot Item Removal on Downgrade (current spec)
- [ ] On Premium, equip a premium-only wardrobe item
- [ ] Downgrade subscription to Basic
- [ ] **Expected:** equipped item is removed (mascot_items reset to empty on downgrade)
- [ ] **Expected:** locked items in wardrobe show 🔒 Sub label

---

## 5. Waitlist Flag

### 5.1 Waitlist → Account Linking
1. Insert test email into `waitlist_emails` in Supabase SQL Editor:
   ```sql
   INSERT INTO waitlist_emails (email) VALUES ('test+wl@yourdomain.com')
   ON CONFLICT (email) DO NOTHING;
   ```
2. Create a new account with `test+wl@yourdomain.com`
3. Complete onboarding
- [ ] Check Supabase: `SELECT has_waitlisted FROM user_profiles WHERE id = ...`
  - **Expected:** `true`

### 5.2 Non-Waitlisted Account
- [ ] Create account with an email NOT in `waitlist_emails`
- [ ] **Expected:** `has_waitlisted = false`

### 5.3 Waitlist Form (when landing enabled)
- [ ] Submit email via the waitlist form
- [ ] **Expected:** email appears in Supabase `waitlist_emails` table
- [ ] **Expected:** welcome email received (from `noreply@trydem.app`)
- [ ] **Expected:** email appears in Resend audience

---

## 6. Mascot & Wardrobe

### 6.1 Equip Multiple Items
- [ ] Open Settings → Wardrobe
- [ ] Equip eyewear + badge + shoes simultaneously
- [ ] **Expected:** all 3 render correctly on the mascot preview in wardrobe
- [ ] Navigate to plan view
- [ ] **Expected:** full mascot with all 3 items equipped

### 6.2 Mascot Preview Energy Color
- [ ] Set energy to high (green), open wardrobe → preview circle is green
- [ ] Set energy to medium (yellow) → preview is yellow
- [ ] Set energy to low (blue) → preview is blue

### 6.3 Tier Gate
- [ ] On Basic account, try tapping a "🔒 Sub" item
- [ ] **Expected:** nothing happens (can't equip locked items)
- [ ] **Expected:** Sub badge visible on locked items

### 6.4 Mascot Animation
- [ ] On plan view, switch between Diet/Exercise/Mentality tabs
- [ ] **Expected:** mascot does NOT reset animation on tab switch
- [ ] Tap the mascot
- [ ] **Expected:** tickle message on completed day, energy modal on incomplete day

### 6.5 Wardrobe Remove
- [ ] Equip an item, tap "Remove" text link below the item grid
- [ ] **Expected:** item unequipped, mascot preview updates

---

## 7. Progress Tab

### 7.1 Streak Display
- [ ] Complete Day 1 → streak shows 1
- [ ] Extend plan and carry over → displayed streak = `carryOverStreak + currentStreak`
- [ ] **Expected:** longest streak in Account tab updates if new high reached

### 7.2 Streak Goal Selector
- [ ] After completing first plan (or via Dev Panel), streak goal selector should appear
- [ ] Change goal from 3 to 7 days
- [ ] Refresh page
- [ ] **Expected:** 7-day goal persists

### 7.3 Plan Expired (Missed All Days)
- [ ] Let a plan expire without completing any days (use Dev Panel to advance past all days)
- [ ] **Expected:** "Plan Expired" tutorial message fires
- [ ] **Expected:** option to start fresh plan, no streak credit

---

## 8. Settings Tab

### 8.1 Preferences Modal
- [ ] Tap "Change preferences" — food/exercise/mentality selection modal opens
- [ ] Change selections, save
- [ ] **Expected:** current day's plan updates to reflect new preferences
- [ ] **Expected:** completed tasks on current day are NOT wiped

### 8.2 Reset All Progress
- [ ] Settings → Danger Zone → Reset All Progress
- [ ] **Expected:** confirmation prompt
- [ ] Confirm
- [ ] **Expected:** redirected to onboarding, localStorage cleared, cloud plan deactivated

---

## 9. Device & Browser Matrix

Test each critical path on:

| Device | Browser | Min screen | Notes |
|--------|---------|-----------|-------|
| iPhone SE | Safari | 375px | Smallest common iOS |
| iPhone 15 Pro Max | Safari | 430px | Largest common iOS |
| Android (360px) | Chrome | 360px | Common small Android |
| Desktop | Chrome | 1440px | Wide layout centered at 448px |
| Desktop | Firefox | 1440px | |
| Desktop | Safari | 1440px | |

For each device check:
- [ ] No horizontal overflow (nothing clipped)
- [ ] Bottom nav not blocking content
- [ ] All text readable (no truncation)
- [ ] AI card recipe text doesn't overflow
- [ ] Long email/name doesn't break profile card layout
- [ ] Tab switching always scrolls to top (no leftover scroll position)

---

## 10. Offline & Edge Cases

### 10.1 Offline Load
- [ ] Open app with network disabled
- [ ] **Expected:** app loads with local data (no white screen, no crash)
- [ ] **Expected:** AI generate buttons show but requests gracefully fail with "Sign in to use AI features." or "Network error"

### 10.2 Very Long Username
- [ ] Create account with name "Alexandernamington Longfellowsworth III"
- [ ] **Expected:** profile card truncates cleanly (`truncate` class)
- [ ] **Expected:** mascot speech bubble doesn't overflow

### 10.3 30-Day Plan
- [ ] Start a 30-day plan (extend after completing first cycle)
- [ ] **Expected:** day navigator scrolls horizontally
- [ ] **Expected:** Day 30 is accessible

### 10.4 Refresh Mid-Plan
- [ ] Be on Day 2 of a plan, hard-refresh the page
- [ ] **Expected:** app loads on the correct active day

### 10.5 Supabase Pause Recovery
- [ ] If Supabase has been paused (free tier goes inactive after 7 days):
- [ ] **Expected:** app loads from local data without wiping progress
- [ ] **Expected:** treats are not reset
- [ ] After Supabase resumes, data syncs correctly on next interaction

---

## 11. Security Spot Checks

- [ ] **RLS**: Sign in as User A. Manually try to query User B's plan via browser console:
  ```js
  const { data } = await supabase.from('user_plans').select('*').eq('user_id', '<user_b_id>')
  ```
  **Expected:** empty result (Row Level Security blocks cross-user access)

- [ ] **Stripe webhook signature**: Tampered signature should return 400 — check Stripe dashboard webhook logs

- [ ] **AI rate limiting — no token:**
  ```bash
  curl -X POST https://trydem.app/api/ai-meal \
    -H "Content-Type: application/json" \
    -d '{"foods":["chicken"],"mealType":"lunch","energyLevel":"medium"}'
  ```
  **Expected:** HTTP 401

- [ ] **AI rate limiting — token but limit exceeded:**
  ```bash
  curl -X POST https://trydem.app/api/ai-meal \
    -H "Authorization: Bearer <valid-token>" \
    -H "Content-Type: application/json" \
    -d '{"foods":["chicken"],"mealType":"lunch","energyLevel":"medium"}'
  ```
  **Expected:** HTTP 429 after daily limit reached

- [ ] **API key exposure**: open DevTools → Network → inspect AI route requests — response should not include the Anthropic API key or full model name in any client-visible field

---

## 12. Real-User Alpha Pass

Give access to **3–5 people** on different devices, with **zero instructions**. Just say: "try this health app."

Watch for (or ask them to note):
- [ ] Where did they get stuck or confused?
- [ ] Did onboarding feel too long? Too short?
- [ ] Did they understand what "Thinky Treats" are?
- [ ] Did the energy level concept click?
- [ ] Did they find the wardrobe?
- [ ] Any feature they expected but couldn't find?

Collect feedback and bucket into: **blocker** / **annoyance** / **nice-to-have**

---

## Pre-Launch Checklist Summary

| # | Check | Status |
|---|-------|--------|
| 1 | All core user flows pass | ⬜ |
| 2 | Auth + sync across 2 devices verified | ⬜ |
| 3 | Stripe checkout works with test cards | ⬜ |
| 4 | Treat limits enforced per tier (server-side) | ⬜ |
| 5 | Direct API calls without token return 401 | ⬜ |
| 6 | AI cache syncs cross-device | ⬜ |
| 7 | Mascot items reset on downgrade (current spec) | ⬜ |
| 8 | `has_ever_subscribed` set on upgrade | ⬜ |
| 9 | `has_waitlisted` set correctly at signup | ⬜ |
| 10 | No horizontal overflow on 360px screens | ⬜ |
| 11 | Tab switching scrolls to top | ⬜ |
| 12 | Offline load doesn't white-screen | ⬜ |
| 13 | RLS blocks cross-user data access | ⬜ |
| 14 | Plan expired fires AFTER last day (not on it) | ⬜ |
| 15 | Display name syncs cross-device | ⬜ |
| 16 | Password change requires 8+ chars | ⬜ |
| 17 | Manage subscription shows error on failure | ⬜ |
| 18 | Account deletion cancels Stripe subscription | ⬜ |
| 19 | Privacy Policy + ToS linked on auth screen | ✅ |
| 20 | `hello@trydem.app` email configured | ⬜ |
| 21 | 3–5 real-user alpha testers completed | ⬜ |
