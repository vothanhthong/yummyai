
export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cooking_time: number;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  meal_type: string;
  ingredients: Ingredient[];
  instructions: string[];
  tips: string[];
  image_url?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recipe?: Recipe;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface QuickSuggestion {
  id: string;
  user_id: string;
  label: string;
  prompt: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealPlan {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  recipe_data: Recipe;
  notes?: string;
  created_at?: string;
}

export enum Tab {
  CHAT = 'chat',
  COOKBOOK = 'cookbook',
  SUGGESTIONS = 'suggestions',
  MEAL_PLAN = 'meal_plan'
}
