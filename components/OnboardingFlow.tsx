'use client';

import { useState } from 'react';
import { UserProfile } from '@/types';
import { FOODS } from '@/lib/foods';
import { generateThreeDayPlan } from '@/lib/planGenerator';
import { saveUserProfile, saveCurrentPlan } from '@/lib/storage';
import { Button } from './Button';
import { Card } from './Card';
import { Check } from 'lucide-react';
import FoodPieChart from './FoodPieChart';
import Mascot from './Mascot';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedMentality, setSelectedMentality] = useState<string[]>([]);

  const toggleFood = (foodId: string) => {
    setSelectedFoods(prev => 
      prev.includes(foodId) 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  const handleComplete = () => {
    // Create user profile
    const user: UserProfile = {
      name: name || 'Friend',
      selectedFoods,
      createdAt: new Date().toISOString(),
    };

    // Generate plan
    const plan = generateThreeDayPlan(user);

    // Save to localStorage
    saveUserProfile(user);
    saveCurrentPlan(plan);

    // Navigate to plan view
    onComplete();
  };

  // Group foods by category
  const foodsByCategory = {
    fruit: FOODS.filter(f => f.category === 'fruit'),
    vegetable: FOODS.filter(f => f.category === 'vegetable'),
    grain: FOODS.filter(f => f.category === 'grain'),
    protein: FOODS.filter(f => f.category === 'protein'),
    'healthy-fat': FOODS.filter(f => f.category === 'healthy-fat'),
  };

  const categoryNames = {
    fruit: '🍎 Fruits (15-20%)',
    vegetable: '🥦 Vegetables (30-35%)',
    grain: '🌾 Grains (25%)',
    protein: '🍗 Proteins (25%)',
    'healthy-fat': '🥑 Healthy Fats',
  };

  // Validation
  const hasEnoughFoods = selectedFoods.length >= 10;

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8 mt-8">
        <div className="text-6xl mb-4">💪</div>
        <h1 className="text-4xl font-bold text-dem-green-600 mb-2">Dem</h1>
        <p className="text-gray-600">Diet · Exercise · Mentality</p>
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Mascot introduction */}
          <div className="flex justify-center mb-6">
            <Mascot 
              message="Hi! My name is Dem and I'll be your guide! 👋" 
              mood="excited"
              persistent={true}
            />
          </div>
          
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome! 👋
            </h2>
            <p className="text-gray-600 mb-4">
              Let's start your health journey with a simple 3-day plan. 
              Small commitments lead to big changes.
            </p>
            <p className="text-gray-600">
              What should we call you?
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full mt-4 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-dem-green-400 focus:outline-none"
            />
          </Card>

          <Button onClick={() => setStep(2)} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Food Selection */}
      {step === 2 && (
        <div className="flex-1 flex flex-col">
          {/* Sticky pie chart at top */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-dem-green-50 to-dem-blue-50 pb-4 -mt-4 pt-4">
            <FoodPieChart selectedFoodIds={selectedFoods} />
          </div>

          <div className="mb-4 flex items-center justify-center gap-4">
            <Mascot 
              message="Pick foods you love! We'll build your meals from these 🍎" 
              mood="happy"
            />
          </div>

          <Card className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Pick Foods You Like
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select at least 10 foods. The more variety, the better!
            </p>
            <div className="text-sm font-semibold text-dem-green-600">
              {selectedFoods.length} selected {hasEnoughFoods && '✓'}
            </div>
          </Card>

          {/* Food Categories */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {Object.entries(foodsByCategory).map(([category, foods]) => (
              <Card key={category}>
                <h3 className="font-bold text-gray-700 mb-3">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {foods.map(food => {
                    const isSelected = selectedFoods.includes(food.id);
                    return (
                      <button
                        key={food.id}
                        onClick={() => toggleFood(food.id)}
                        className={`
                          tap-target px-4 py-3 rounded-xl border-2 transition-all text-left
                          ${isSelected 
                            ? 'border-dem-green-500 bg-dem-green-50' 
                            : 'border-gray-200 bg-white hover:border-dem-green-300'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            <span className="text-xl mr-2">{food.emoji}</span>
                            <span className="text-sm font-medium">{food.name}</span>
                          </span>
                          {isSelected && (
                            <Check className="w-5 h-5 text-dem-green-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={!hasEnoughFoods}
              className="flex-1"
            >
              Create My Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}