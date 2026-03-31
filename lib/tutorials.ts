export interface TutorialSlide {
  message: string;
}

export const TUTORIALS: Record<string, TutorialSlide[]> = {
  home: [
    { message: "Hi! I'm Dem. I adapt your plan to how you feel each day." },
    { message: "Tap me anytime to change your energy level — your plan adjusts instantly!" },
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
    { message: "Check this off when you're done — all three pillars together build your streak." },
  ],
  progress: [
    { message: "Track your streak and get an AI health insight summary here." },
    { message: "Complete all three pillars each day to grow your streak!" },
  ],
};
