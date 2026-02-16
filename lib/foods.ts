import { Food } from '@/types';

export const FOODS: Food[] = [
  // Fruits (15-20% target)
  { id: 'f1', name: 'Apple', category: 'fruit', emoji: '🍎', mealTiming: ['breakfast', 'snack'] },
  { id: 'f2', name: 'Banana', category: 'fruit', emoji: '🍌', mealTiming: ['breakfast', 'snack'] },
  { id: 'f3', name: 'Berries', category: 'fruit', emoji: '🫐', mealTiming: ['breakfast', 'snack'] },
  { id: 'f4', name: 'Orange', category: 'fruit', emoji: '🍊', mealTiming: ['breakfast', 'snack'] },
  { id: 'f5', name: 'Grapes', category: 'fruit', emoji: '🍇', mealTiming: ['snack'] },
  { id: 'f6', name: 'Mango', category: 'fruit', emoji: '🥭', mealTiming: ['breakfast', 'snack'] },
  { id: 'f7', name: 'Pear', category: 'fruit', emoji: '🍐', mealTiming: ['snack'] },
  { id: 'f8', name: 'Watermelon', category: 'fruit', emoji: '🍉', mealTiming: ['snack'] },

  // Vegetables (30-35% target)
  { id: 'v1', name: 'Broccoli', category: 'vegetable', emoji: '🥦', mealTiming: ['lunch', 'dinner'] },
  { id: 'v2', name: 'Spinach', category: 'vegetable', emoji: '🥬', mealTiming: ['breakfast', 'lunch', 'dinner'] },
  { id: 'v3', name: 'Carrots', category: 'vegetable', emoji: '🥕', mealTiming: ['lunch', 'dinner', 'snack'] },
  { id: 'v4', name: 'Bell Peppers', category: 'vegetable', emoji: '🫑', mealTiming: ['breakfast', 'lunch', 'dinner'] },
  { id: 'v5', name: 'Tomatoes', category: 'vegetable', emoji: '🍅', mealTiming: ['breakfast', 'lunch', 'dinner'] },
  { id: 'v6', name: 'Cucumber', category: 'vegetable', emoji: '🥒', mealTiming: ['lunch', 'snack'] },
  { id: 'v7', name: 'Sweet Potato', category: 'vegetable', emoji: '🍠', mealTiming: ['breakfast', 'lunch', 'dinner'] },
  { id: 'v8', name: 'Kale', category: 'vegetable', emoji: '🥬', mealTiming: ['lunch', 'dinner'] },
  { id: 'v9', name: 'Cauliflower', category: 'vegetable', emoji: '🥦', mealTiming: ['lunch', 'dinner'] },
  { id: 'v10', name: 'Zucchini', category: 'vegetable', emoji: '🥒', mealTiming: ['lunch', 'dinner'] },
  { id: 'v11', name: 'Mushrooms', category: 'vegetable', emoji: '🍄', mealTiming: ['breakfast', 'lunch', 'dinner'] },
  { id: 'v12', name: 'Asparagus', category: 'vegetable', emoji: '🌿', mealTiming: ['dinner'] },

  // Grains (25% target)
  { id: 'g1', name: 'Brown Rice', category: 'grain', emoji: '🍚', mealTiming: ['lunch', 'dinner'] },
  { id: 'g2', name: 'Quinoa', category: 'grain', emoji: '🌾', mealTiming: ['breakfast', 'lunch', 'dinner'] },
  { id: 'g3', name: 'Oatmeal', category: 'grain', emoji: '🥣', mealTiming: ['breakfast'] },
  { id: 'g4', name: 'Whole Wheat Bread', category: 'grain', emoji: '🍞', mealTiming: ['breakfast', 'lunch'] },
  { id: 'g5', name: 'Whole Grain Pasta', category: 'grain', emoji: '🍝', mealTiming: ['lunch', 'dinner'] },
  { id: 'g6', name: 'Barley', category: 'grain', emoji: '🌾', mealTiming: ['lunch', 'dinner'] },
  { id: 'g7', name: 'Buckwheat', category: 'grain', emoji: '🌾', mealTiming: ['breakfast', 'lunch', 'dinner'] },

  // Proteins (25% target)
  { id: 'p1', name: 'Chicken Breast', category: 'protein', emoji: '🍗', mealTiming: ['lunch', 'dinner'] },
  { id: 'p2', name: 'Salmon', category: 'protein', emoji: '🐟', mealTiming: ['breakfast', 'lunch', 'dinner'] },
  { id: 'p3', name: 'Eggs', category: 'protein', emoji: '🥚', mealTiming: ['breakfast', 'lunch'] },
  { id: 'p4', name: 'Turkey', category: 'protein', emoji: '🦃', mealTiming: ['lunch', 'dinner'] },
  { id: 'p5', name: 'Tofu', category: 'protein', emoji: '🥡', mealTiming: ['lunch', 'dinner'] },
  { id: 'p6', name: 'Greek Yogurt', category: 'protein', emoji: '🥛', mealTiming: ['breakfast', 'snack'] },
  { id: 'p7', name: 'Lentils', category: 'protein', emoji: '🫘', mealTiming: ['lunch', 'dinner'] },
  { id: 'p8', name: 'Chickpeas', category: 'protein', emoji: '🫘', mealTiming: ['lunch', 'dinner'] },
  { id: 'p9', name: 'Black Beans', category: 'protein', emoji: '🫘', mealTiming: ['lunch', 'dinner'] },
  { id: 'p10', name: 'Tuna', category: 'protein', emoji: '🐟', mealTiming: ['lunch', 'dinner'] },

  // Healthy Fats
  { id: 'h1', name: 'Avocado', category: 'healthy-fat', emoji: '🥑', mealTiming: ['breakfast', 'lunch', 'snack'] },
  { id: 'h2', name: 'Almonds', category: 'healthy-fat', emoji: '🌰', mealTiming: ['snack'] },
  { id: 'h3', name: 'Walnuts', category: 'healthy-fat', emoji: '🌰', mealTiming: ['breakfast', 'snack'] },
  { id: 'h4', name: 'Olive Oil', category: 'healthy-fat', emoji: '🫒', mealTiming: ['lunch', 'dinner'] },
  { id: 'h5', name: 'Peanut Butter', category: 'healthy-fat', emoji: '🥜', mealTiming: ['breakfast', 'snack'] },
];

// Helper to get foods by category
export const getFoodsByCategory = (category: Food['category']): Food[] => {
  return FOODS.filter(food => food.category === category);
};

// Helper to get foods by IDs
export const getFoodsByIds = (ids: string[]): Food[] => {
  return FOODS.filter(food => ids.includes(food.id));
};