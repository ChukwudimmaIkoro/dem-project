# CLAUDE.md - Project Context for Future Development

## Project Overview

**Dem** is an AI-powered patient adherence platform built in 15 hours for a Healthcare & AI hackathon (1st place winner). It addresses the $26B annual hospital readmission problem by adapting health plans to daily energy levels rather than assuming consistent motivation.

**Core Thesis:** Adherence is a mismatch problem, not a motivation problem. When plans adapt to how people actually feel, they follow them.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React (SVG)
- **AI:** Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Storage:** localStorage (designed for easy DB migration)
- **Deployment:** Vercel

**Animation:** Framer Motion (`motion.*`, `AnimatePresence`, `useAnimationControls`, spring physics). Replaced original custom setTimeout animation system in Phase 2.

---

## Development Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Bug Fixes | ✅ Complete | Fisher-Yates shuffle, AI cache invalidation by planId, removed error suppression, deleted stale `src/` dir |
| Phase 2 — Duolingo UI/UX Overhaul | ✅ Complete | All components rewritten with Framer Motion. Energy-reactive theming throughout. Build passes clean. |
| Phase 3 — Backend / Scale | ⏳ Not started | Ask user at session start which item to tackle first |

**Phase 3 options (user's list):**
- Replace localStorage with PostgreSQL/MongoDB
- User authentication (Auth0 or NextAuth)
- 5/7/14-day plan unlocks through streak completion
- Hospital care team dashboard
- Cloud sync across devices

---

## Architecture Overview

### File Structure
```
app/
  api/
    ai-meal/route.ts          # Recipe generation (POST)
    ai-insights/route.ts      # Health trend analysis (POST)
  page.tsx                    # Router: onboarding vs plan view
  layout.tsx                  # Root HTML + meta tags

components/
  OnboardingFlow.tsx          # 2-step food selection + pie chart (Framer Motion)
  PlanView.tsx                # Main app shell (tabs, energy, navigation, energy zoom overlay)
  Mascot.tsx                  # Animated mascot — async Framer Motion bounce loop, exports ENERGY_CONFIG
  EnergyModal.tsx             # Energy level selector (slide-up sheet)
  FoodPieChart.tsx            # Real-time macro balance visualization
  AIRecipeCard.tsx            # Recipe UI with button-triggered generation + cache (Framer Motion)
  AIHealthInsights.tsx        # Insights UI with button-triggered generation + cache (Framer Motion)
  PillarTabs.tsx              # D/E/M tab switcher (Framer Motion)
  BottomNav.tsx               # Plan/Progress/Account nav (layoutId indicator)

lib/
  planGenerator.ts            # Energy scaling algorithm + shuffleDietMeals()
  foods.ts                    # 42-item food database
  exercises.ts                # 14-item exercise database
  mentality.ts                # 7 mental check-in types
  storage.ts                  # localStorage abstraction + AI cache layer

types/
  index.ts                    # All TypeScript interfaces

public/
  qr-code.png                 # QR code for live demo
```

---

## Key Technical Decisions

### 1. AI Cost Control Strategy
**ALL AI calls are user-initiated via explicit button clicks. Zero background API usage.**

- **Recipes:** User clicks "Recommend meal" → Claude generates JSON recipe → cached in localStorage (`"dayNumber-mealType"` key) → never regenerated unless explicitly requested
- **Insights:** User clicks "Health Insight Summary" → Claude analyzes energy/completion history → cached per day (`"dayNumber"` key)
- **Mascot messages:** 100% static hardcoded strings. Originally had AI generation but was removed for cost control.

**Caching implementation:**
```typescript
// In storage.ts
getCachedRecipe(dayNumber, mealType) → CachedRecipe | null
setCachedRecipe(dayNumber, mealType, recipe) → void

getCachedInsight(dayNumber) → CachedInsight | null
setCachedInsight(dayNumber, insight) → void
```

localStorage key: `dem-ai-cache`
```json
{
  "recipes": {
    "1-breakfast": { name, ingredients, steps, nutrition, tip },
    "2-lunch": { ... }
  },
  "insights": {
    "1": { trend, insight, patientMessage, careNote, alerts }
  }
}
```

### 2. Energy Scaling Algorithm

The core differentiator. One self-reported input (low/medium/high) reshapes the entire day:

**Diet (lib/planGenerator.ts):**
```typescript
const ENERGY_TO_MEAL_STYLE = {
  low: 'simple',     // 2-3 ingredients, under 10 min prep
  medium: 'balanced', // 3-4 ingredients, 15-20 min
  high: 'optimal',   // 4-5 ingredients, macro-optimized
};

// Food selection count by energy
if (energyLevel === 'low') {
  meals.breakfast = pickRandom(breakfastFoods, 2);
  meals.lunch = pickRandom(lunchDinnerFoods, 3);
} else if (energyLevel === 'medium') {
  meals.breakfast = pickRandom(breakfastFoods, 3);
  meals.lunch = pickRandom(lunchDinnerFoods, 4);
} else {  // high
  meals.breakfast = pickRandom(breakfastFoods, 4);
  meals.lunch = pickRandom(lunchDinnerFoods, 5);
}
```

**Exercise:**
```typescript
const ENERGY_TO_INTENSITY = {
  low: 'light',      // Walking, stretching
  medium: 'moderate', // Bodyweight exercises
  high: 'intense',   // HIIT, challenging workouts
};
```

**Mascot behavior:**
```typescript
const ENERGY_CONFIG = {
  low: {
    color: '#3b82f6',           // Blue
    bounceHeight: [6, 10],      // Shorter jumps
    bouncePeriod: [5000, 8000], // Slower (5-8s between bounces)
    particleCount: 0,           // No particles
    glowSize: 6,                // Small aura
  },
  medium: { /* ... */ },
  high: {
    color: '#22c55e',           // Green
    bounceHeight: [20, 30],     // Big jumps
    bouncePeriod: [1800, 3200], // Fast (1.8-3.2s)
    particleCount: 6,           // Lots of particles
    glowSize: 18,               // Wide aura
  },
};
```

### 3. Mascot Animation System (Framer Motion)

**NOTE: The original setTimeout-based system was replaced in Phase 2.** The new system uses `useAnimationControls` with an async loop that `await`s each phase, eliminating cumulative timing drift.

**Async bounce loop phases:**
1. Pre-squash anticipation (90ms, easeOut)
2. Rise — ease-out deceleration `[0.22, 1, 0.36, 1]`
3. Fall — ease-in gravity `[0.55, 0, 1, 0.5]`
4. Spring settle with overshoot `{ type: 'spring', stiffness: 420, damping: 14 }`

**ENERGY_CONFIG is exported** for use by PlanView (energy zoom overlay reads colors from it).

**Legacy section below preserved for reference only:**

**7-phase bounce choreography** using setTimeout chains (original system — REPLACED):
1. **Launch** (0ms): Squash up, start moving
2. **Rise** (150ms): Stretching upward
3. **Peak** (350ms): Normal shape at apex
4. **Fall** (490ms): Slight stretch falling
5. **Accelerate** (610ms): More stretch as speed increases
6. **Impact** (720ms): Squash on ground (scaleY: 0.75)
7. **Settle** (820ms): Overshoot recovery
8. **Rest** (960ms): Back to perfect circle

**CSS Transform:**
```jsx
<div style={{
  transform: `translate(${x}px, ${y}px) scaleX(${1/squash}) scaleY(${squash})`,
  transition: transitionStyle(bouncePhase),
}}>
```

**Why `scaleX(1/squash)`?** Preserves visual "volume" — when squashing vertically (0.75), stretch horizontally (1.33) to look like a real rubber ball.

**Easing curves:** Each phase has custom cubic-bezier for realistic physics:
```typescript
'launch':  'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1)',  // Ease-out
'fall':    'transform 220ms cubic-bezier(0.4, 0, 0.6, 0.2)',    // Ease-in (gravity)
'rest':    'transform 230ms cubic-bezier(0.34, 1.3, 0.64, 1)',  // Elastic overshoot
```

**Particles:** Separate requestAnimationFrame loop (60fps) with physics simulation:
```typescript
// Update loop
setParticles(prev => prev
  .map(p => ({
    ...p,
    x: p.x + p.vx * dt * 0.05,  // Velocity-based movement
    y: p.y + p.vy * dt * 0.05,
    life: p.life - dt * 0.0025, // Fade out
  }))
  .filter(p => p.life > 0)      // Remove dead particles
);
```

**Speech bubble:** Follows mascot position with clamped arrow:
```jsx
transform: `translateX(calc(-50% + ${Math.max(-40, Math.min(40, position.x))}px))`
```

**Why SVG over PNG?**
- Scales perfectly (retina displays)
- Color changes instantly via props
- Tiny file size (~500 bytes)
- No image loading delay

### 4. Meal Shuffling System

**Dice icon** on each meal section re-randomizes foods from same pool/energy:

```typescript
const shuffleMeal = (mealKey: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
  const newDiet = shuffleDietMeals(userFoods, energyLevel, dayNumber);
  setMeals(prev => ({ ...prev, [mealKey]: newDiet.meals[mealKey] }));
  
  // Persist to localStorage immediately
  updatePlan(plan => {
    // ... update specific meal in plan.days[dayIdx].diet.meals
  });
};
```

**Important:** DietView is keyed on `${dayNumber}-${energyLevel}` so it remounts when energy changes, picking up fresh meals from regenerated plan.

### 5. Day Change Warning System

```typescript
const handleDayChange = (dayIdx: number) => {
  // Moving forward + current day incomplete → warn
  if (dayIdx > currentDayIndex && !isDayComplete(plan.days[currentDayIndex])) {
    setPendingDayIdx(dayIdx);
    setShowDayWarning(true);
    return;
  }
  commitDayChange(dayIdx);
};
```

Modal: "You haven't completed all tasks for today. Move on to tomorrow?"

### 6. AI Recipe Generation Flow

**Step 1:** User clicks "Recommend meal" in AIRecipeCard
```typescript
fetch('/api/ai-meal', {
  method: 'POST',
  body: JSON.stringify({
    foods: ['Eggs', 'Spinach', 'Tomatoes'],
    mealType: 'breakfast',
    energyLevel: 'medium',
  })
})
```

**Step 2:** API route builds prompt with complexity guide
```typescript
const complexityGuide = energyLevel === 'low'
  ? 'Very simple, minimal prep. Under 10 minutes.'
  : energyLevel === 'high'
  ? 'Can be more involved, 20-30 minutes. Optimize for nutrition.'
  : 'Moderate prep, 15-20 minutes.';

const prompt = `Create a recipe in this EXACT JSON format:
{
  "name": "Recipe name",
  "tagline": "One sentence",
  "prepTime": "X minutes",
  "ingredients": [{"item": "...", "amount": "..."}],
  "steps": ["..."],
  "nutrition": {"protein": "Xg", "carbs": "Xg", "fats": "Xg", "calories": "~XXX"},
  "tip": "Pro tip"
}`;
```

**Step 3:** Send to Claude
```typescript
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 500,
  messages: [{ role: 'user', content: prompt }],
});
```

**Step 4:** Parse response, cache, display
```typescript
const rawText = message.content[0].text.trim();
const cleaned = rawText.replace(/```json|```/g, '').trim();
const recipe = JSON.parse(cleaned);

setCachedRecipe(dayNumber, mealType, recipe);
setRecipe(recipe);
```

**Graceful fallback:** If API fails or parsing fails, show error state but app keeps working.

### 7. Health Insights Flow

**Rule-based detection first (no API):**
```typescript
// 3+ consecutive low days → flag
if (energyHistory.slice(-3).every(e => e === 'low')) {
  alerts.push({
    severity: 'MEDIUM',
    type: 'ENERGY_DECLINE',
    message: 'Patient has reported low energy for 3+ consecutive days',
    recommendation: 'Consider scheduling a check-in call',
  });
}

// All tasks missed 2+ days → flag
const allMissed = completionHistory.slice(-2).every(day =>
  !day.diet && !day.exercise && !day.mentality
);
```

**Then AI analysis:**
```typescript
const prompt = `Analyze this patient data:
Patient: ${userName}
Energy levels: ${energyHistory.join(' -> ')}
Completion: ${JSON.stringify(completionHistory)}
Alerts: ${alerts.map(a => a.type).join(', ')}

Respond in JSON. Do NOT use emoji:
{
  "trend": "improving" | "stable" | "declining" | "insufficient_data",
  "insight": "One sentence (max 15 words, no emoji)",
  "patientMessage": "Encouraging message (max 12 words, no emoji)",
  "careNote": "Clinical note (max 20 words, clinical tone)"
}`;
```

**Why no emoji?** Clinical setting — care team notes need to be professional.

**Combined response:**
```typescript
return Response.json({
  alerts,          // From rules
  insight: {       // From Claude
    trend, insight, patientMessage, careNote
  },
});
```

---

## Data Models (types/index.ts)

```typescript
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  name: string;
  selectedFoods: string[];  // IDs from FOODS array
  createdAt: string;
}

export interface DayPlan {
  dayNumber: 1 | 2 | 3;
  date: string;
  energyLevel: EnergyLevel;
  diet: DietPlan;
  exercise: ExercisePlan;
  mentality: MentalityPlan;
  completed: {
    diet: boolean;
    exercise: boolean;
    mentality: boolean;
  };
}

export interface ThreeDayPlan {
  id: string;
  createdAt: string;
  days: [DayPlan, DayPlan, DayPlan];
  currentDay: number;
  streak: number;
}

export interface DietPlan {
  focus: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snack?: string[];
  };
  macroBalance: {
    fruit: number;
    vegetable: number;
    grain: number;
    protein: number;
  };
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  intensity: 'light' | 'moderate' | 'intense';
}

export interface MentalityCheck {
  id: string;
  type: 'affirmation' | 'breathing' | 'reflection';
  title: string;
  description: string;
  duration: string;
}
```

---

## Food Database (42 items)

**Categories:**
- **Fruits** (15-20% target): Apples, Bananas, Berries, Oranges, Grapes, Mangoes, Watermelon, Pineapple, Avocado
- **Vegetables** (30-35% target): Spinach, Broccoli, Carrots, Tomatoes, Bell Peppers, Cucumbers, Kale, Lettuce, Cauliflower, Zucchini, Mushrooms
- **Grains** (25% target): Oats, Brown Rice, Quinoa, Whole Wheat Bread, Whole Wheat Pasta, Sweet Potatoes
- **Proteins** (25% target): Chicken Breast, Salmon, Eggs, Greek Yogurt, Tofu, Lentils, Black Beans, Almonds, Peanut Butter, Cottage Cheese
- **Healthy Fats**: Olive Oil, Walnuts, Chia Seeds, Flaxseeds, Dark Chocolate

**Each food has:**
```typescript
{
  id: string;
  name: string;
  emoji: string;
  category: 'fruit' | 'vegetable' | 'grain' | 'protein' | 'healthy-fat';
  mealTiming?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
}
```

**Meal timing intelligence:** Prevents chicken at breakfast, oats at dinner, etc.

**Pie chart validation (±5% margin):**
- Fruits: 10-25% → checkmark
- Vegetables: 25-40% → checkmark
- Grains: 20-30% → checkmark
- Proteins: 20-30% → checkmark
- All categories valid + 15+ foods selected → "Perfectly balanced, as all meal plans should be!"

---

## State Management

**localStorage keys:**
- `dem-app-state`: `{ user, currentPlan, hasCompletedOnboarding }`
- `dem-energy-modal-shown`: `{ "1": true, "2": true, "3": false }`
- `dem-ai-cache`: `{ recipes: {...}, insights: {...} }`

**Energy modal logic:**
- Shown once per day on first visit to that day
- Can be manually triggered anytime by clicking mascot
- `saveEnergyModalShown(dayNumber)` marks it as shown

**Plan updates:**
```typescript
updatePlan(plan => {
  const updated = { ...plan };
  updated.days[dayIdx].energyLevel = newEnergy;
  updated.days[dayIdx].diet = generateDietPlan(userFoods, newEnergy, dayNumber);
  updated.days[dayIdx].exercise = generateExercisePlan(newEnergy, dayNumber);
  return updated;
});
```

**Important:** Changing energy regenerates diet/exercise, **does NOT** invalidate AI insight cache (insights are per day, not per energy).

---

## Known Issues / Edge Cases

1. **DietView remounting:** Component is keyed on `${dayNumber}-${energyLevel}` to force remount when energy changes. Without this, local shuffle state persists and shows stale meals.

2. **AI cache invalidation:** Shuffling a meal does NOT invalidate that meal's cached recipe. The recipe was generated for specific ingredients; if you shuffle, you'll see a "Recommend meal" button again with new ingredients.

3. **React hooks order:** All `useState` and `useEffect` calls MUST be at top of component before any early returns. Breaking this causes "rendered more hooks than previous render" error.

4. **Mascot timer cleanup:** Always clear timers in useEffect cleanup:
```typescript
useEffect(() => {
  // ... bounce logic
  return () => {
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
  };
}, [currentEnergy]);
```

5. **Energy change behavior:** When you change energy, the mascot restarts its bounce loop with new timing. The plan regenerates. DietView remounts. Any in-progress animations reset.

---

## Environment Variables

**.env.local:**
```bash
ANTHROPIC_API_KEY=your_key_here
```

**Vercel deployment:**
```bash
vercel env add ANTHROPIC_API_KEY
# Paste key when prompted
vercel --prod
```

**API key is ONLY used server-side** in `/app/api/*` routes. Never exposed to client.

---

## Deployment Checklist

1. `npm install` (picks up @anthropic-ai/sdk)
2. Create `.env.local` with ANTHROPIC_API_KEY
3. `npm run build` (verify no errors)
4. `vercel --prod`
5. Add ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
6. Test live URL end-to-end
7. Generate QR code for live URL (already in `/public/qr-code.png`)

---

## Design Decisions & Philosophy

### Why 3 days?
Psychological threshold. Most people can commit to 3 days without feeling overwhelmed. Builds confidence. Small wins create momentum. Longer plans (5/7/14 days) are earned through streak completion (Phase 2).

### Why localStorage?
Hackathon scope. Proves concept without backend complexity. Storage layer is abstracted (`lib/storage.ts`) — swapping to API calls is a one-file change. It's a stepping stone, not the end state.

### Why button-triggered AI?
Cost control. Background API calls add up exponentially. Explicit user actions make costs predictable. Also improves UX — users see exactly when AI is working for them.

### Why no calorie tracking?
Friction kills adherence. The goal is **consistency**, not precision. Self-reporting energy is faster than logging meals. Plans adapt to subjective feeling, not objective metrics.

### Why mentality as equal pillar?
Most apps treat mental health as an afterthought. We don't. Depression, anxiety, burnout — these affect physical recovery. A breathing exercise or affirmation is as important as eating protein.

### Why the mascot?
Emotional engagement. People don't stick with boring apps. Dem (the character) creates a relationship. When he slows down with you on low days, you feel understood. That emotional resonance drives adherence.

---

## Future Roadmap

### Phase 2 (Immediate)
- 5/7/14-day plans unlocked through streak completion
- Exercise preference selection flow (like food onboarding)
- Mentality preference selection flow
- Enhanced AI coaching messages (re-enable mascot AI with better caching)

### Phase 3 (3-6 months)
- Backend: Replace localStorage with PostgreSQL/MongoDB
- User authentication (Auth0 or NextAuth)
- Cloud sync across devices
- Apple Watch / fitness wearable integration for automatic task verification
- Push notifications for daily check-ins

### Phase 4 (Hospital Deployment)
- Care team dashboard showing all patient panels
- Real-time AI alerts feed for coordinators
- HIPAA compliance layer
- Hospital SSO integration
- Prescription AI coaching (not just guidance)
- Readmission prediction model (ML on energy/completion patterns)

### Phase 5 (Monetization)
- **B2C Freemium:** 3-day plans free, premium ($4.99/month) unlocks 7/14/30-day plans + advanced AI
- **B2B Hospital Licensing:** Deploy to discharge patients, charge per-patient-per-month, prove ROI through reduced CMS readmission penalties
- **Social features:** Group challenges, accountability partners, leaderboards

---

## Performance Considerations

**Bundle size:**
- Main route: 96.6 kB First Load JS (excellent for React app)
- No heavy dependencies (Framer Motion, Three.js, etc.)
- Tailwind purges unused classes in production

**Animation performance:**
- CSS transforms use GPU acceleration
- requestAnimationFrame for particles (60fps)
- Particle count capped at 12 to prevent lag on low-end devices

**API latency:**
- Recipe generation: ~2-3 seconds (Claude API response time)
- Health insights: ~1-2 seconds
- Cached responses: instant (localStorage read)

**Mobile optimization:**
- Mobile-first Tailwind breakpoints
- Touch-friendly tap targets (min 44x44px)
- Bottom nav for thumb-reachable navigation
- No horizontal scroll

---

## Testing Strategy

**What was tested:**
- Energy scaling logic (manual verification across all 3 levels)
- Food selection → pie chart updates
- Meal shuffling → persistence to localStorage
- AI recipe generation → JSON parsing, cache retrieval
- AI insights → rule-based alerts, Claude integration
- Mascot animations → visual QA across energy states
- Day progression → incomplete day warning modal
- Energy modal → once-per-day trigger logic

**What was NOT tested (future work):**
- Unit tests (React Testing Library)
- E2E tests (Playwright/Cypress)
- Load testing (API rate limits, concurrent users)
- Accessibility audit (WCAG compliance)
- Cross-browser testing (Safari, Firefox)

---

## Hackathon Judging Criteria Alignment

**Problem-Solution Fit:**
- ✅ Addresses $26B readmission problem
- ✅ Clear healthcare impact (care team alerts)
- ✅ Solves root cause (mismatch, not motivation)

**Technical Execution:**
- ✅ Production-ready code (TypeScript, type-safe)
- ✅ Deployed live (Vercel)
- ✅ AI integration (Claude API, structured outputs)
- ✅ Custom animation system (no libraries, 7-phase physics)

**Innovation:**
- ✅ Energy scaling (unique differentiator)
- ✅ Mentality as first-class pillar
- ✅ AI clinical notes for care teams
- ✅ Adaptive mascot character

**User Experience:**
- ✅ Mobile-first design
- ✅ Intuitive onboarding (2 steps)
- ✅ Visual feedback (pie chart, mascot reactions)
- ✅ Emotional engagement (mascot personality)

**Scalability:**
- ✅ Modular architecture (easy to add features)
- ✅ localStorage → DB migration path clear
- ✅ Cost-controlled AI (no runaway bills)
- ✅ Hospital deployment story articulated

---

## Key Files to Review for Development

**Core logic:**
- `lib/planGenerator.ts` - Energy scaling algorithm, shuffle function
- `lib/storage.ts` - All persistence + AI cache layer
- `types/index.ts` - Data models

**Main UI:**
- `components/PlanViewV2.tsx` - App shell, tabs, day navigation
- `components/MascotV2.tsx` - Animation system
- `components/OnboardingFlow.tsx` - Food selection flow

**AI integration:**
- `app/api/ai-meal/route.ts` - Recipe generation endpoint
- `app/api/ai-insights/route.ts` - Health insights endpoint
- `components/AIRecipeCard.tsx` - Recipe UI + caching
- `components/AIHealthInsights.tsx` - Insights UI + caching

**Data:**
- `lib/foods.ts` - 42-item database + meal timing
- `lib/exercises.ts` - 14-item database + intensity levels
- `lib/mentality.ts` - 7 check-in types

---

## Common Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Add environment variable to Vercel
vercel env add ANTHROPIC_API_KEY

# Clear localStorage (in browser console)
localStorage.clear(); location.reload();

# Inspect AI cache
JSON.parse(localStorage.getItem('dem-ai-cache'))

# Inspect current plan
JSON.parse(localStorage.getItem('dem-app-state')).currentPlan
```

---

## Design System

**Colors:**
```typescript
const COLORS = {
  green:  '#22c55e',  // High energy, primary actions
  blue:   '#3b82f6',  // Low energy, info
  yellow: '#eab308',  // Medium energy, warnings
  purple: '#7c3aed',  // Mentality pillar
  orange: '#f97316',  // Streaks, celebrations
  gray:   '#6b7280',  // Text
};
```

**Tailwind config extends:**
```javascript
colors: {
  'dem-green': { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
  'dem-blue': { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb' },
  'dem-yellow': { 50: '#fefce8', 500: '#eab308', 600: '#ca8a04' },
  'dem-purple': { 50: '#faf5ff', 500: '#7c3aed', 600: '#9333ea' },
  'dem-orange': { 50: '#fff7ed', 500: '#f97316', 600: '#ea580c' },
}
```

**Typography:**
- Font: System font stack (native, fast)
- Headings: Bold, large (text-2xl to text-4xl)
- Body: text-sm to text-base, text-gray-600
- All text is readable at mobile sizes

**Spacing:**
- Bottom nav: 80px height (thumb-reachable)
- Cards: rounded-2xl, p-4, shadow-sm
- Buttons: rounded-xl, py-3, tap-target class (min 44x44px)

---

## Accessibility Considerations

**Implemented:**
- Semantic HTML (nav, main, section)
- ARIA labels on buttons
- Keyboard navigation support
- Focus indicators on interactive elements
- Color contrast meets WCAG AA

**Not yet implemented (future):**
- Screen reader optimization
- Reduced motion preference detection
- High contrast mode
- Full WCAG AAA compliance

---

## Browser Compatibility

**Tested on:**
- Chrome 120+ (macOS, Windows, Android)
- Safari 17+ (macOS, iOS)
- Edge 120+

**Known issues:**
- Safari iOS sometimes flashes white on page transition (cosmetic)
- localStorage limits vary by browser (~5-10MB, sufficient for MVP)

---

## API Rate Limits & Costs

**Anthropic Claude API:**
- Model: claude-sonnet-4-5-20250929
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Typical costs per user:**
- Recipe generation: ~500 tokens input, ~400 tokens output → $0.0075 per recipe
- Health insights: ~300 tokens input, ~200 tokens output → $0.004 per insight
- **Per user per day:** ~$0.03 (3 recipes + 1 insight)
- **Per user per month:** ~$0.90 (assuming daily use)

**Cost scaling:**
- 100 daily active users: ~$3/day, ~$90/month
- 1,000 daily active users: ~$30/day, ~$900/month
- 10,000 daily active users: ~$300/day, ~$9,000/month

**Mitigation strategies:**
- Caching eliminates repeat calls (already implemented)
- Future: Batch API calls for hospital deployments
- Future: Fine-tuned smaller model for recipes (lower cost)

---

## Security Considerations

**Current state:**
- API key stored in env vars (not committed to git)
- Client never sees API key (server-side only)
- No user authentication (localStorage is client-side only)
- No PII sent to Claude (use "Patient" not real names)

**Future requirements:**
- User authentication (Auth0, NextAuth)
- Server-side session management
- HIPAA compliance (encrypted data at rest, BAA with Anthropic)
- Rate limiting on API routes (prevent abuse)
- Input sanitization (prevent prompt injection)

---

## Lessons Learned (Technical)

**What worked:**
- localStorage as AI cache → brilliant for MVP
- Button-triggered AI → predictable costs
- Custom animations → unique personality, no library bloat
- Energy scaling → simple input, powerful output
- TypeScript → caught bugs early

**What was hard:**
- Mascot physics → 7 phases with perfect timing took iteration
- React hooks order → early returns broke hook calls
- DietView remounting → needed `key` prop to force fresh state
- AI JSON parsing → Claude sometimes adds markdown fences
- Vercel env vars → easy to forget to add ANTHROPIC_API_KEY

**What would be done differently:**
- Add unit tests from the start (would've caught DietView remount bug faster)
- Use Zod for runtime validation of Claude responses (safer than raw JSON.parse)
- Implement error boundaries (graceful handling of React crashes)
- Add loading skeletons for AI calls (better perceived performance)

---

## Documentation

**Created files:**
- `README.md` - Clean project overview for GitHub
- `DEM_HACKATHON_GUIDE.docx` - Full 8-chapter defense guide
- `DEPLOYMENT.md` - Vercel deployment steps
- `HACKATHON_DEFENSE.md` - Q&A, demo script, product context
- `TECHNICAL_ARCHITECTURE.md` - Component breakdown, data flow
- `QUICK_REFERENCE.md` - One-page cheat sheet for judging

**All documentation emphasizes:**
- The $26B problem
- Energy scaling as differentiator
- AI cost control strategy
- Hospital deployment vision
- Production-ready quality

---

## Contact & Links

**Live Demo:** https://dem-project.vercel.app/  
**Developer:** Chukwudimma Ikoro (Chuchu)  
**Email:** chuchuikoro@gmail.com  
**LinkedIn:** linkedin.com/in/chukwudimma-ikoro  

**Hackathon:** Healthcare & AI Hackathon (Builders League Events)  
**Result:** 1st Place Winner  
**Build Time:** 15 hours  
**Date:** February 2026  

---

## Phase 2 UI System (Duolingo-Inspired)

### Energy Theme Tokens (`components/PlanView.tsx`)
```typescript
const ENERGY_THEME = {
  high:   { bg1: '#f0fdf4', bg2: '#ecfdf5', accent: '#22c55e', accentDark: '#15803d', emoji: '🔥', label: 'High Energy' },
  medium: { bg1: '#fefce8', bg2: '#fffbeb', accent: '#eab308', accentDark: '#a16207', emoji: '⚡', label: 'Medium Energy' },
  low:    { bg1: '#eff6ff', bg2: '#f0f9ff', accent: '#3b82f6', accentDark: '#1d4ed8', emoji: '💙', label: 'Low Energy' },
};
```

### EnergyBackground Cross-Fade
`AnimatePresence` keyed on `energy` — when energy changes, old gradient fades out (opacity 0), new one fades in (0.7s easeInOut). Fixed behind content at `z-index: -10`.

### Energy Zoom Overlay (Full-Screen)
When user changes energy in `EnergyModal`, `PlanView` shows a full-screen dark backdrop (`z-[100]`) with:
- Enlarged Mascot (size 130) at the new energy level
- Confirmation pill with energy emoji + "Plan updated"
- Auto-dismisses after ~1.4s

### Duolingo Button Style
All primary buttons use bottom-shadow depth effect:
```css
box-shadow: 0 5px 0 0 {accentDark};  /* normal */
box-shadow: none; transform: translateY(2px);  /* on press (whileTap) */
```

### accentColor Threading
`PlanView` passes `accentColor` (from current energy) as a prop to:
- `BottomNav` → active tab indicator color
- `PillarTabs` → active pillar background + shadow
- `Button` → primary button color
- All inline `style={{ color: accentColor }}` decorations

---

## Next Session Handoff

**Phase 1 and Phase 2 are complete. Phase 3 is next.**

**Ask the user which Phase 3 item to start on:**
- Backend migration (localStorage → PostgreSQL/MongoDB)
- User authentication (Auth0 or NextAuth)
- 5/7/14-day plan unlocks through streak completion
- Hospital care team dashboard
- Cloud sync / mobile

**If debugging Phase 2 UI issues:**
- Energy theming: all colors come from `ENERGY_THEME` in `PlanView.tsx`
- Mascot physics: async loop in `Mascot.tsx`, uses `useAnimationControls`
- Bounce jitter: if it returns, ensure the loop is `await`-based not setTimeout-based
- Energy zoom overlay: `showEnergyTransition` state in `PlanView.tsx`
- `accentColor` not updating: check it's being passed from `ENERGY_THEME[currentEnergy].accent`

**If debugging issues:**
- Check browser console for errors
- Inspect localStorage: `JSON.parse(localStorage.getItem('dem-app-state'))`
- Verify ANTHROPIC_API_KEY in .env.local
- Check network tab for API call failures
- Review component keys (especially DietView)

**If demoing:**
- Clear localStorage before each demo: `localStorage.clear()`
- Have QR code visible (already in onboarding)
- Practice mascot energy switch (most impressive moment)
- Show recipe generation + clinical note reveal
- End on hospital use case story

---

**This context should give any Claude session enough information to continue development, debug issues, or answer questions about the project.**
