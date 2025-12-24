import { supabase } from "../lib/supabaseClient";
import { Recipe } from "../types";
import { Json } from "../lib/supabaseTypes";

interface CookbookRow {
  id: string;
  user_id: string;
  recipe_id: string;
  recipe_name: string;
  recipe_data: Json;
  saved_at: string;
}

export const saveRecipe = async (recipe: Recipe) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Check if recipe already exists - properly escape special characters in filter
  const recipeId = recipe.id?.replace(/[,"()]/g, (char) => `\\${char}`) || '';
  const recipeName = recipe.name?.replace(/[,"()]/g, (char) => `\\${char}`) || '';
  
  const { data: existing } = await (supabase.from("cookbook") as any)
    .select("id")
    .eq("user_id", user.id)
    .or(`recipe_id.eq."${recipeId}",recipe_name.eq."${recipeName}"`)
    .maybeSingle();

  if (existing) {
    throw new Error("Recipe already saved");
  }

  const { data, error } = await (supabase.from("cookbook") as any)
    .insert({
      user_id: user.id,
      recipe_id: recipe.id || `rcp_${Date.now()}`,
      recipe_data: recipe as unknown as Json,
      recipe_name: recipe.name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSavedRecipes = async (): Promise<Recipe[]> => {
  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await (supabase.from("cookbook") as any)
    .select("recipe_data")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (error) throw error;

  return data?.map((item: any) => item.recipe_data as Recipe) || [];
};

export const removeRecipe = async (recipeId: string) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await (supabase.from("cookbook") as any)
    .delete()
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId);

  if (error) throw error;
};

export const isRecipeSaved = async (recipe: Recipe): Promise<boolean> => {
  if (!supabase) {
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const recipeId = recipe.id?.replace(/[,"()]/g, (char) => `\\${char}`) || '';
  const recipeName = recipe.name?.replace(/[,"()]/g, (char) => `\\${char}`) || '';

  const { data } = await (supabase.from("cookbook") as any)
    .select("id")
    .eq("user_id", user.id)
    .or(`recipe_id.eq."${recipeId}",recipe_name.eq."${recipeName}"`)
    .maybeSingle();

  return !!data;
};

