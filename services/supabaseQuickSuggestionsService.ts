import { supabase } from "../lib/supabaseClient";
import { QuickSuggestion } from "../types";

// Default suggestions cho user chưa có custom
export const DEFAULT_SUGGESTIONS = [
  { label: "🍳 Ăn sáng", prompt: "Gợi ý cho mình món ăn sáng đơn giản" },
  { label: "🍱 Ăn trưa", prompt: "Trưa nay ăn gì ngon nhỉ?" },
  { label: "🍲 Ăn tối", prompt: "Gợi ý món tối cho 2 người" },
  { label: "⚡ Món nhanh", prompt: "Món gì nấu nhanh dưới 15 phút?" },
  { label: "🥗 Thanh đạm", prompt: "Gợi ý món ăn thanh đạm, nhiều rau" },
  { label: "🍜 Món nước", prompt: "Mình muốn ăn món gì đó có nước dùng" },
];

export const getQuickSuggestions = async (): Promise<QuickSuggestion[]> => {
  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await (supabase.from("quick_suggestions") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("order_index", { ascending: true });

  if (error) throw error;

  return data || [];
};

export const createQuickSuggestion = async (
  suggestion: Pick<QuickSuggestion, "label" | "prompt">
): Promise<QuickSuggestion> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Lấy order_index cao nhất hiện tại
  const { data: existing } = await (supabase.from("quick_suggestions") as any)
    .select("order_index")
    .eq("user_id", user.id)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

  const { data, error } = await (supabase.from("quick_suggestions") as any)
    .insert({
      user_id: user.id,
      label: suggestion.label,
      prompt: suggestion.prompt,
      order_index: nextOrderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateQuickSuggestion = async (
  id: string,
  updates: Partial<Pick<QuickSuggestion, "label" | "prompt">>
): Promise<QuickSuggestion> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await (supabase.from("quick_suggestions") as any)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQuickSuggestion = async (id: string): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await (supabase.from("quick_suggestions") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
};

export const reorderQuickSuggestions = async (
  orderedIds: string[]
): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Update từng item với order_index mới
  const updates = orderedIds.map((id, index) =>
    (supabase.from("quick_suggestions") as any)
      .update({ order_index: index, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
  );

  await Promise.all(updates);
};

// Khởi tạo suggestions mặc định cho user mới
export const initializeDefaultSuggestions = async (): Promise<QuickSuggestion[]> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Kiểm tra xem user đã có suggestions chưa
  const { data: existing } = await (supabase.from("quick_suggestions") as any)
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    // Đã có suggestions, trả về list hiện tại
    return getQuickSuggestions();
  }

  // Tạo default suggestions
  const insertData = DEFAULT_SUGGESTIONS.map((s, index) => ({
    user_id: user.id,
    label: s.label,
    prompt: s.prompt,
    order_index: index,
  }));

  const { data, error } = await (supabase.from("quick_suggestions") as any)
    .insert(insertData)
    .select();

  if (error) throw error;
  return data || [];
};
