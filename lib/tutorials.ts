export interface TutorialSlide {
  message: string;
}

export const TUTORIALS: Record<string, TutorialSlide[]> = {
  home: [
    { message: "Hi! I'm Dem. I adapt your plan to how you feel each day." },
    { message: "Tap me anytime to change your energy level. Your plan adjusts instantly!" },
  ],
  diet: [
    { message: "Here's your meal plan for today! Tap the dice to shuffle any meal." },
    { message: "Tap 'Recommend meal' for an AI-generated recipe using your chosen foods." },
  ],
  exercise: [
    { message: "These exercises match your energy level today. Check them off as you go!" },
    { message: "Tap 'Get coaching tips' for step-by-step form guidance on any exercise." },
  ],
  mentality: [
    { message: "Mental health is as important as physical. Take your time with this one." },
    { message: "Check this off when you're done. All three pillars together build your streak." },
  ],
  progress: [
    { message: "Track your streak and get an AI health insight summary here." },
    { message: "Complete all three pillars each day to grow your streak!" },
  ],
  streakComplete: [
    { message: "You finished your streak! That's a huge deal." },
    { message: "Ready to level up? Head to the Progress tab and set a longer streak goal. Try for 5, 7, 14, or even 30 days!" },
    { message: "The longer the streak, the deeper the habit. You've got this!" },
  ],
  planExpired: [
    { message: "It's okay to be inconsistent at the start — showing up is the first step." },
    { message: "Head to the Progress tab to start a fresh plan. You can go for the same 3 days, or level up to something longer!" },
    { message: "Every attempt builds the habit. Don't give up — Dem will be here when you're ready." },
  ],
};
