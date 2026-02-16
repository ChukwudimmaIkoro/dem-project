'use client';

import { useState, useEffect } from 'react';
import { ThreeDayPlan, DayPlan, EnergyLevel } from '@/types';
import { loadAppState, updatePlan, clearAppState, saveCurrentPlan, hasShownEnergyModal, saveEnergyModalShown } from '@/lib/storage';
import { isDayComplete, calculateStreak, generateThreeDayPlan } from '@/lib/planGenerator';
import { Button } from './Button';
import { Card } from './Card';
import { Check, Flame, RotateCcw, Utensils, Dumbbell, Brain, Sunrise, Sun, Moon, Coffee, Sparkles } from 'lucide-react';
import BottomNav from './BottomNav';
import PillarTabs from './PillarTabs';
import EnergyModal from './EnergyModal';
import Mascot from './Mascot';

interface PlanViewProps {
  onReset: () => void;
}

export default function PlanView({ onReset }: PlanViewProps) {
  const [plan, setPlan] = useState<ThreeDayPlan | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'plan' | 'account' | 'progress'>('plan');
  const [activePillar, setActivePillar] = useState<'diet' | 'exercise' | 'mentality'>('diet');
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [energySetMessage, setEnergySetMessage] = useState('');
  const [userName, setUserName] = useState<string>('');
  const [lastPillar, setLastPillar] = useState<'diet' | 'exercise' | 'mentality'>('diet');
  const [tabMessage, setTabMessage] = useState('');

  useEffect(() => {
    const state = loadAppState();
    if (state.currentPlan) {
      setPlan(state.currentPlan);
      // Set to first incomplete day
      const firstIncomplete = state.currentPlan.days.findIndex(d => !isDayComplete(d));
      const dayIdx = firstIncomplete === -1 ? 2 : firstIncomplete;
      setCurrentDayIndex(dayIdx);
      
      // Load user name
      if (state.user?.name) {
        setUserName(state.user.name);
      }
      
      // Show energy modal if not shown for this day yet
      const dayNumber = state.currentPlan.days[dayIdx].dayNumber;
      if (!hasShownEnergyModal(dayNumber)) {
        setTimeout(() => setShowEnergyModal(true), 500);
      }
    }
  }, []);

  // Mascot messages based on context
  const getMascotMessage = () => {
    if (activePillar === 'diet') {
      return "Fuel your body with foods you love! 🍎";
    } else if (activePillar === 'exercise') {
      return "Move your body, feel the energy! 💪";
    } else {
      return "Your mind is the foundation. This is the most important! 🧠";
    }
  };

  // Handle pillar changes to show tab-specific message
  useEffect(() => {
    // When pillar changes, show tab-specific message
    if (activePillar !== lastPillar) {
      setTabMessage(getMascotMessage());
      setLastPillar(activePillar);
      
      // Clear tab message after 5 seconds to resume idle
      setTimeout(() => {
        setTabMessage('');
      }, 5000);
    }
  }, [activePillar, lastPillar]);

  if (!plan) {
    return <div className="p-4">Loading...</div>;
  }

  const currentDay = plan.days[currentDayIndex];
  const streak = calculateStreak(plan);
  const isComplete = isDayComplete(currentDay);

  // Energy indicator color
  const getEnergyColor = (energy: EnergyLevel) => {
    return energy === 'high' ? 'bg-dem-green-500' :
           energy === 'medium' ? 'bg-dem-yellow-400' :
           'bg-dem-blue-500';
  };

  const handleEnergySelect = (energy: EnergyLevel) => {
    // Update energy level and regenerate day's content
    const state = loadAppState();
    if (state.user && state.currentPlan) {
      // Regenerate plan with new energy for current day
      const newPlan = { ...state.currentPlan };
      const energyLevels: [EnergyLevel, EnergyLevel, EnergyLevel] = [
        currentDayIndex === 0 ? energy : newPlan.days[0].energyLevel,
        currentDayIndex === 1 ? energy : newPlan.days[1].energyLevel,
        currentDayIndex === 2 ? energy : newPlan.days[2].energyLevel,
      ];
      
      const regenerated = generateThreeDayPlan(state.user, energyLevels);
      
      // Keep completion status from old plan
      regenerated.days.forEach((day, idx) => {
        day.completed = newPlan.days[idx].completed;
      });
      
      saveCurrentPlan(regenerated);
      setPlan(regenerated);
      
      // Mark modal as shown for this day
      const dayNumber = regenerated.days[currentDayIndex].dayNumber;
      saveEnergyModalShown(dayNumber);
      
      // Show confirmation message
      const energyLabel = energy === 'high' ? 'High' : energy === 'medium' ? 'Medium' : 'Low';
      setEnergySetMessage(`${energyLabel} energy set! Tap me if your energy level changes!`);
      setTimeout(() => setEnergySetMessage(''), 8000);
    }
    
    setShowEnergyModal(false);
  };

  const toggleTask = (pillar: 'diet' | 'exercise' | 'mentality') => {
    updatePlan((p) => {
      const newPlan = { ...p };
      newPlan.days[currentDayIndex].completed[pillar] = !newPlan.days[currentDayIndex].completed[pillar];
      
      // Check if day just became complete
      const nowComplete = isDayComplete(newPlan.days[currentDayIndex]);
      if (nowComplete && !isComplete) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      
      return newPlan;
    });
    
    // Refresh from storage
    const state = loadAppState();
    if (state.currentPlan) {
      setPlan(state.currentPlan);
    }
  };

  const handleDayChange = (dayIdx: number) => {
    setCurrentDayIndex(dayIdx);
    // Show energy modal only if not shown for this day before
    const dayNumber = plan!.days[dayIdx].dayNumber;
    if (!hasShownEnergyModal(dayNumber) && !isDayComplete(plan!.days[dayIdx])) {
      setTimeout(() => setShowEnergyModal(true), 300);
    }
  };

  const handleReset = () => {
    if (confirm('Start over? This will clear your current progress.')) {
      clearAppState();
      onReset();
    }
  };

  // Render different bottom tab content
  if (activeBottomTab === 'account') {
    return (
      <div className="min-h-screen pb-20 p-4">
        <div className="text-center mt-8">
          <Mascot 
            message="This is where account settings will go... If Chuchu ever finishes this app..." 
            mood="calm" 
            currentEnergy={currentDay?.energyLevel || 'medium'}
            userName={userName}
            className="mb-6" 
          />
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Account</h2>
            <p className="text-gray-600 mb-4">Coming soon: Profile customization, preferences, and more!</p>
            <Button variant="ghost" onClick={handleReset} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Reset App
            </Button>
          </Card>
        </div>
        <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} />
      </div>
    );
  }

  if (activeBottomTab === 'progress') {
    return (
      <div className="min-h-screen pb-20 p-4">
        <div className="text-center mt-8">
          <Mascot message="Look at you go! Keep crushing it!" mood="excited" className="mb-6" />
          <Card className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="w-12 h-12 text-dem-orange-500" />
              <span className="text-5xl font-bold text-dem-orange-500">{streak}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Day Streak!</h3>
            <p className="text-gray-600">You've completed {streak} day{streak !== 1 ? 's' : ''}</p>
          </Card>

          {streak >= 3 && (
            <Card className="bg-gradient-to-r from-dem-yellow-400 to-dem-orange-500 text-white">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold mb-2">Achievement Unlocked!</h3>
              <p className="text-sm opacity-90">
                You've completed your 3-day journey! Ready for 5 days? (Coming soon!)
              </p>
            </Card>
          )}
        </div>
        <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} />
      </div>
    );
  }

  // Main Plan View
  return (
    <div className="min-h-screen pb-20 p-4">
      {/* Energy Modal */}
      <EnergyModal
        isOpen={showEnergyModal}
        currentEnergy={currentDay.energyLevel}
        onSelect={handleEnergySelect}
        dayNumber={currentDay.dayNumber}
      />

      {/* Header with streak and mascot */}
      <div className="flex justify-between items-start mb-6 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-dem-green-600">Dem</h1>
          <p className="text-sm text-gray-600">Day {currentDay.dayNumber} of 3</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-dem-orange-500 font-bold text-2xl">
            <Flame className="w-6 h-6" />
            <span>{streak}</span>
          </div>
          <p className="text-xs text-gray-600">day streak</p>
        </div>
      </div>

      {/* Day Navigator with energy indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {plan.days.map((day, idx) => {
          const dayComplete = isDayComplete(day);
          const isCurrent = idx === currentDayIndex;
          return (
            <button
              key={idx}
              onClick={() => handleDayChange(idx)}
              className={`
                relative tap-target w-16 h-16 rounded-2xl font-bold transition-all
                ${isCurrent 
                  ? 'bg-dem-green-500 text-white scale-110 shadow-lg' 
                  : dayComplete
                  ? 'bg-dem-yellow-400 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              <div className="text-2xl">{idx + 1}</div>
              
              {/* Energy level indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getEnergyColor(day.energyLevel)} border-2 border-white`} />
            </button>
          );
        })}
      </div>

      {/* Day Complete Celebration */}
      {isComplete && (
        <Card className="mb-6 bg-gradient-to-r from-dem-yellow-400 to-dem-orange-500 text-white border-4 border-dem-yellow-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold">Day {currentDay.dayNumber} Complete!</h3>
            <p className="text-sm opacity-90 mt-1">You're crushing it!</p>
          </div>
        </Card>
      )}

      {/* Mascot with context message */}
      <div className="flex justify-center mb-6">
        <div 
          onClick={() => setShowEnergyModal(true)}
          className="cursor-pointer hover:scale-105 transition-transform"
          title="Click to change energy level"
        >
          <Mascot 
            message={energySetMessage || tabMessage} // Show energy message or tab message, then idle
            mood={activePillar === 'mentality' ? 'encouraging' : 'happy'}
            persistent={false} // Let it cycle through idle messages
            key={`${activePillar}-${energySetMessage}-${tabMessage}`}
            currentEnergy={currentDay.energyLevel}
            userName={userName}
          />
        </div>
      </div>

      {/* Pillar Tabs */}
      <PillarTabs
        activePillar={activePillar}
        onPillarChange={setActivePillar}
        completedPillars={currentDay.completed}
      />

      {/* Pillar Content */}
      <div className="mb-6">
        {activePillar === 'diet' && (
          <DietView day={currentDay} isCompleted={currentDay.completed.diet} onToggle={() => toggleTask('diet')} />
        )}
        {activePillar === 'exercise' && (
          <ExerciseView day={currentDay} isCompleted={currentDay.completed.exercise} onToggle={() => toggleTask('exercise')} />
        )}
        {activePillar === 'mentality' && (
          <MentalityView day={currentDay} isCompleted={currentDay.completed.mentality} onToggle={() => toggleTask('mentality')} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} />

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-dem-green-600">
              Day Complete!
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components for each pillar view
function DietView({ day, isCompleted, onToggle }: { day: DayPlan; isCompleted: boolean; onToggle: () => void }) {
  return (
    <Card className={isCompleted ? 'border-4 border-dem-yellow-400' : ''}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="w-6 h-6 text-dem-green-600" />
            <h3 className="text-2xl font-bold text-gray-800">Today's Meals</h3>
          </div>
          <p className="text-sm text-dem-green-600 font-semibold">{day.diet.focus}</p>
        </div>
        <button
          onClick={onToggle}
          className={`
            tap-target w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${isCompleted 
              ? 'bg-dem-green-500 text-white' 
              : 'border-2 border-gray-300 text-gray-300 hover:border-dem-green-400'
            }
          `}
        >
          {isCompleted && <Check className="w-6 h-6" />}
        </button>
      </div>

      <div className="space-y-4">
        <MealSection title="Breakfast" items={day.diet.meals.breakfast} Icon={Sunrise} />
        <MealSection title="Lunch" items={day.diet.meals.lunch} Icon={Sun} />
        <MealSection title="Dinner" items={day.diet.meals.dinner} Icon={Moon} />
        {day.diet.meals.snack && day.diet.meals.snack.length > 0 && (
          <MealSection title="Snack" items={day.diet.meals.snack} Icon={Coffee} />
        )}
      </div>
    </Card>
  );
}

function ExerciseView({ day, isCompleted, onToggle }: { day: DayPlan; isCompleted: boolean; onToggle: () => void }) {
  return (
    <Card className={isCompleted ? 'border-4 border-dem-yellow-400' : ''}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-6 h-6 text-dem-blue-600" />
            <h3 className="text-2xl font-bold text-gray-800">Today's Movement</h3>
          </div>
          <p className="text-sm text-dem-blue-600 font-semibold">{day.exercise.focus}</p>
        </div>
        <button
          onClick={onToggle}
          className={`
            tap-target w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${isCompleted 
              ? 'bg-dem-green-500 text-white' 
              : 'border-2 border-gray-300 text-gray-300 hover:border-dem-green-400'
            }
          `}
        >
          {isCompleted && <Check className="w-6 h-6" />}
        </button>
      </div>

      <div className="space-y-3">
        {day.exercise.exercises.map((ex) => (
          <div key={ex.id} className="bg-dem-blue-50 p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg text-gray-800">{ex.name}</h4>
              <span className="text-sm bg-dem-blue-500 text-white px-3 py-1 rounded-full font-semibold">
                {ex.duration}
              </span>
            </div>
            <p className="text-gray-700">{ex.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MentalityView({ day, isCompleted, onToggle }: { day: DayPlan; isCompleted: boolean; onToggle: () => void }) {
  return (
    <Card className={isCompleted ? 'border-4 border-dem-yellow-400' : ''}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-6 h-6 text-dem-purple-500" />
            <h3 className="text-2xl font-bold text-gray-800">Mental Check-In</h3>
          </div>
          <p className="text-sm text-dem-purple-500 font-semibold">{day.mentality.check.title}</p>
        </div>
        <button
          onClick={onToggle}
          className={`
            tap-target w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${isCompleted 
              ? 'bg-dem-green-500 text-white' 
              : 'border-2 border-gray-300 text-gray-300 hover:border-dem-green-400'
            }
          `}
        >
          {isCompleted && <Check className="w-6 h-6" />}
        </button>
      </div>

      <div className="bg-dem-purple-50 p-6 rounded-2xl">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-10 h-10 text-dem-purple-500" />
        </div>
        <p className="text-gray-800 leading-relaxed text-lg mb-4">
          {day.mentality.check.content}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>⏱️</span>
          <span>{day.mentality.check.duration}</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-dem-yellow-50 rounded-2xl border-2 border-dem-yellow-200">
        <p className="text-sm text-gray-700 text-center font-medium">
          💡 Remember: Your mentality is the glue that holds diet and exercise together. Without this, consistency fails.
        </p>
      </div>
    </Card>
  );
}

function MealSection({ title, items, Icon }: { title: string; items: string[]; Icon: any }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <h4 className="text-sm font-bold text-gray-700">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span 
            key={idx}
            className="text-sm bg-dem-green-100 text-dem-green-700 px-3 py-1.5 rounded-full font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}