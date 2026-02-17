## 1st Place Talent Tank Hackathon Project, February 16, 2026 

# Dem - AI-Powered Patient Adherence Platform

**Deployment Link: https://dem-project.vercel.app/**

**Diet · Exercise · Mentality**

A 3-day health planner that adapts to how you actually feel, not how you should feel.

![Demo](public/DemDemo.gif).

---

Dem scales daily tasks to your self-reported energy level:
- **Low energy:** Light walk, simple meals, quick affirmation
- **Medium energy:** Balanced workout, standard nutrition  
- **High energy:** HIIT, macro-optimized meals

Plans adapt to reality, so patients actually follow them.

---

## Key Features

### Energy Scaling 
Every morning, rate your energy (low/medium/high). Your entire day adjusts:
- Workout intensity  
- Meal complexity  
- Even the mascot's behavior

### AI Recipe Generation
Click "Recommend meal" → Claude generates a full recipe from your selected foods:
- Ingredients with amounts
- Step-by-step instructions
- Nutrition breakdown
- Pro tips

Cached in localStorage, and never regenerated unless you request it.

### AI Health Insights
Click "Health Insight Summary" → Claude analyzes your trends:
- Energy pattern detection
- Clinical note for care teams
- Early warning alerts (3 low days = flag for check-in)

### Animated Mascot (Dem)
A bouncing circle character that reacts to your energy:
- **Low:** Slow, blue, calm messages
- **Medium:** Normal yellow bounce
- **High:** Fast green with particles and high-energy quotes

### Smart Food System
- 42 curated healthy foods across 5 categories
- Real-time pie chart shows macro balance
- Meal timing intelligence (no chicken at breakfast!)
- Dice shuffle button to re-randomize any meal

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 | API routes + SSR |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Rapid mobile-first |
| AI | Claude Sonnet 4.5 | Recipe + insight generation |
| Storage | localStorage | Zero backend MVP |
| Deployment | Vercel | One-click deploy |

## How AI Works

### Recipes
1. User clicks "Recommend meal" button
2. Send `{ foods: ['Eggs', 'Spinach'], mealType: 'breakfast', energyLevel: 'medium' }`
3. Claude returns structured JSON recipe
4. Cached in localStorage (key: `"dayNumber-mealType"`)

### Insights
1. User clicks "Health Insight Summary" button  
2. Send `{ energyHistory: ['low','low','low'], completionHistory: [...] }`
3. Rule-based alerts detect patterns (3 low days, missed tasks)
4. Claude generates clinical trend analysis
5. Cached in localStorage (key: `"dayNumber"`)

**All AI calls are user-initiated button clicks.**
---

## Key Differentiators

1. **Only app that adapts to daily energy**
2. **Mentality is a first-class pillar**
3. **AI generates real clinical value**
4. **Built for healthcare scale**

---


### Current SVP
- Energy-scaled 3-day plans
- AI recipe generation (button-triggered, cached)
- AI health insights (button-triggered, cached)
- Food selection with real-time pie chart
- Animated mascot with energy-reactive physics
- Dice shuffle for meal randomization
- Task completion + streak tracking
- Mobile-first responsive UI

### Future
- **Phase 2:** 5/7/14-day plans, exercise/mentality selection flows
- **Phase 3:** Backend + cloud sync, care team dashboard, HIPAA compliance

---

## File Structure

```
app/
  api/
    ai-meal/route.ts          # Recipe generation endpoint
    ai-insights/route.ts      # Health insights endpoint
  page.tsx                    # Router (onboarding vs plan)
  layout.tsx                  # Root HTML + meta
components/
  OnboardingFlow.tsx          # Food selection + pie chart
  PlanViewV2.tsx              # Main app (tabs, energy, navigation)
  MascotV2.tsx                # Animated character
  AIRecipeCard.tsx            # Recipe UI with caching
  AIHealthInsights.tsx        # Insights UI with caching
lib/
  planGenerator.ts            # Energy scaling algorithm
  foods.ts                    # 42-item database
  exercises.ts                # 14-item database
  mentality.ts                # 7 check-in types
  storage.ts                  # localStorage + AI cache
```

## Built With

15 hours of focused development.

---
