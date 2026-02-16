'use client';

import { Food } from '@/types';
import { getFoodsByIds } from '@/lib/foods';

interface FoodPieChartProps {
  selectedFoodIds: string[];
  className?: string;
}

export default function FoodPieChart({ selectedFoodIds, className = '' }: FoodPieChartProps) {
  const selectedFoods = getFoodsByIds(selectedFoodIds);
  
  // Count foods by category
  const counts = {
    fruit: selectedFoods.filter(f => f.category === 'fruit').length,
    vegetable: selectedFoods.filter(f => f.category === 'vegetable').length,
    grain: selectedFoods.filter(f => f.category === 'grain').length,
    protein: selectedFoods.filter(f => f.category === 'protein').length,
    'healthy-fat': selectedFoods.filter(f => f.category === 'healthy-fat').length,
  };

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return (
      <div className={`bg-gray-100 rounded-2xl p-4 ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          Select foods to see your balance
        </p>
      </div>
    );
  }

  // Calculate percentages
  const percentages = {
    fruit: (counts.fruit / total) * 100,
    vegetable: (counts.vegetable / total) * 100,
    grain: (counts.grain / total) * 100,
    protein: (counts.protein / total) * 100,
    'healthy-fat': (counts['healthy-fat'] / total) * 100,
  };

  // Target percentages
  const targets = {
    fruit: { min: 15, max: 20, label: 'Fruits' },
    vegetable: { min: 30, max: 35, label: 'Veggies' },
    grain: { min: 25, max: 25, label: 'Grains' },
    protein: { min: 25, max: 25, label: 'Protein' },
    'healthy-fat': { min: 5, max: 10, label: 'Healthy Fats' },
  };

  const categories = [
    { key: 'fruit' as const, color: 'bg-red-500', fillColor: '#ef4444', emoji: '🍎' },
    { key: 'vegetable' as const, color: 'bg-green-500', fillColor: '#22c55e', emoji: '🥦' },
    { key: 'grain' as const, color: 'bg-amber-600', fillColor: '#d97706', emoji: '🌾' },
    { key: 'protein' as const, color: 'bg-orange-500', fillColor: '#f97316', emoji: '🍗' },
    { key: 'healthy-fat' as const, color: 'bg-purple-500', fillColor: '#a855f7', emoji: '🥑' },
  ];

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-md ${className}`}>
      <h3 className="text-sm font-bold text-gray-700 mb-3 text-center">
        Your Food Balance
      </h3>
      
      {/* Pie chart visualization */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {(() => {
              let currentAngle = 0;
              return categories.map(({ key, fillColor }) => {
                const percentage = percentages[key];
                const angle = (percentage / 100) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                // Calculate path for pie slice
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = 50 + 45 * Math.cos(startRad);
                const y1 = 50 + 45 * Math.sin(startRad);
                const x2 = 50 + 45 * Math.cos(endRad);
                const y2 = 50 + 45 * Math.sin(endRad);
                
                const largeArc = angle > 180 ? 1 : 0;
                
                const path = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
                
                currentAngle += angle;
                
                return percentage > 0 ? (
                  <path
                    key={key}
                    d={path}
                    fill={fillColor}
                    opacity="0.9"
                  />
                ) : null;
              });
            })()}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {categories.map(({ key, color, emoji }) => {
          const pct = percentages[key];
          const target = targets[key];
          const isGood = pct >= target.min - 5 && pct <= target.max + 5; // 5% margin on each side
          const isTooLow = pct > 0 && pct < target.min - 5;
          
          return pct > 0 ? (
            <div key={key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span>{emoji}</span>
                <span className="text-gray-600">{target.label}</span>
                {total >= 10 && isTooLow && (
                  <span className="text-dem-orange-500 text-xs ml-1">
                    ⚠️ Add more!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className={`font-semibold ${isGood ? 'text-dem-green-600' : 'text-gray-600'}`}>
                  {pct.toFixed(0)}%
                </span>
                {isGood && <span className="text-dem-green-600">✓</span>}
              </div>
            </div>
          ) : null;
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center mb-2">
          {selectedFoodIds.length} foods selected
        </p>
        
        {/* Helpful feedback when 10+ foods selected */}
        {total >= 10 && (() => {
          const missingCategories = categories.filter(({ key }) => {
            const pct = percentages[key];
            const target = targets[key];
            return pct === 0 || pct < target.min - 5;
          });
          
          // Check if ALL categories are perfectly balanced
          const allPerfect = categories.every(({ key }) => {
            const pct = percentages[key];
            const target = targets[key];
            return pct === 0 || (pct >= target.min - 5 && pct <= target.max + 5);
          }) && total >= 15;
          
          if (allPerfect) {
            return (
              <div className="bg-dem-green-50 border border-dem-green-200 rounded-xl p-2 mt-2">
                <p className="text-xs text-dem-green-700 text-center font-medium">
                  ✨ Perfectly balanced, as all meal plans should be! ✨
                </p>
              </div>
            );
          }
          
          if (missingCategories.length > 0) {
            return (
              <div className="bg-dem-yellow-50 border border-dem-yellow-200 rounded-xl p-2 mt-2">
                <p className="text-xs text-dem-yellow-800 text-center font-medium">
                  💡 Try adding more {missingCategories.map(c => targets[c.key].label.toLowerCase()).join(', ')} for better balance!
                </p>
              </div>
            );
          }
          
          return null;
        })()}
      </div>
    </div>
  );
}