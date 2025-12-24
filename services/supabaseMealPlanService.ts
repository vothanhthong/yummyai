import { supabase } from "../lib/supabaseClient";
import { Recipe, MealPlan, MealType } from "../types";

interface MealPlanRow {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  recipe_data: any;
  notes: string | null;
  created_at: string;
}

// Get meal plans for a date range
export const getMealPlans = async (startDate: string, endDate: string): Promise<MealPlan[]> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await (supabase.from("meal_plans") as any)
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching meal plans:", error);
    return [];
  }

  return (data as MealPlanRow[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    date: row.date,
    meal_type: row.meal_type as MealType,
    recipe_data: row.recipe_data as Recipe,
    notes: row.notes || undefined,
    created_at: row.created_at,
  }));
};

// Add a meal to a slot
export const addMealToSlot = async (
  date: string,
  mealType: MealType,
  recipe: Recipe,
  notes?: string
): Promise<MealPlan> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Upsert - update if exists, insert if not
  const { data, error } = await (supabase.from("meal_plans") as any)
    .upsert(
      {
        user_id: user.id,
        date: date,
        meal_type: mealType,
        recipe_data: recipe,
        notes: notes || null,
      },
      {
        onConflict: "user_id,date,meal_type",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    user_id: data.user_id,
    date: data.date,
    meal_type: data.meal_type as MealType,
    recipe_data: data.recipe_data as Recipe,
    notes: data.notes || undefined,
    created_at: data.created_at,
  };
};

// Remove a meal from a slot
export const removeMealFromSlot = async (id: string): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await (supabase.from("meal_plans") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
};

// Update notes for a meal
export const updateMealNotes = async (id: string, notes: string): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await (supabase.from("meal_plans") as any)
    .update({ notes })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
};

// Clear all meals for a week
export const clearWeekMealPlan = async (startDate: string, endDate: string): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await (supabase.from("meal_plans") as any)
    .delete()
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;
};

// Helper: Get week range
export const getWeekRange = (date: Date): { start: string; end: string } => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
};

// Helper: Format date for display
export const formatDateVN = (dateStr: string): string => {
  const date = new Date(dateStr);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dayName = days[date.getDay()];
  return `${dayName}, ${date.getDate()}/${date.getMonth() + 1}`;
};
