import { supabase } from "../lib/supabaseClient";
import { Message } from "../types";

const PAGE_SIZE = 25;

export interface ChatHistoryResult {
  messages: Message[];
  hasMore: boolean;
  oldestTimestamp: number | null;
}

export const saveMessage = async (message: Message) => {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Don't save for unauthenticated users
  }

  const { data, error } = await (supabase.from("chat_history") as any)
    .insert({
      user_id: user.id,
      role: message.role,
      content: message.content,
      recipe_data: message.recipe || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving message:", error);
    return null;
  }
  return data;
};

// Lấy tin nhắn mới nhất (cho lần load đầu tiên)
export const getChatHistory = async (limit = PAGE_SIZE): Promise<ChatHistoryResult> => {
  if (!supabase) {
    return { messages: [], hasMore: false, oldestTimestamp: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { messages: [], hasMore: false, oldestTimestamp: null };
  }

  // Lấy limit + 1 để biết còn tin nhắn cũ hơn không
  const { data, error } = await (supabase.from("chat_history") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (error) {
    console.error("Error fetching chat history:", error);
    return { messages: [], hasMore: false, oldestTimestamp: null };
  }

  const hasMore = data && data.length > limit;
  const messagesData = hasMore ? data.slice(0, limit) : data || [];
  
  // Đảo ngược lại để tin nhắn cũ ở trên, mới ở dưới
  const messages: Message[] = messagesData
    .map((item: any) => ({
      id: item.id,
      role: item.role as "user" | "assistant",
      content: item.content,
      recipe: item.recipe_data as Message["recipe"],
      timestamp: new Date(item.created_at).getTime(),
    }))
    .reverse();

  const oldestTimestamp = messages.length > 0 ? messages[0].timestamp : null;

  return { messages, hasMore, oldestTimestamp };
};

// Lấy thêm tin nhắn cũ hơn (infinite scroll)
export const getOlderMessages = async (
  beforeTimestamp: number,
  limit = PAGE_SIZE
): Promise<ChatHistoryResult> => {
  if (!supabase) {
    return { messages: [], hasMore: false, oldestTimestamp: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { messages: [], hasMore: false, oldestTimestamp: null };
  }

  const beforeDate = new Date(beforeTimestamp).toISOString();

  const { data, error } = await (supabase.from("chat_history") as any)
    .select("*")
    .eq("user_id", user.id)
    .lt("created_at", beforeDate)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (error) {
    console.error("Error fetching older messages:", error);
    return { messages: [], hasMore: false, oldestTimestamp: null };
  }

  const hasMore = data && data.length > limit;
  const messagesData = hasMore ? data.slice(0, limit) : data || [];
  
  const messages: Message[] = messagesData
    .map((item: any) => ({
      id: item.id,
      role: item.role as "user" | "assistant",
      content: item.content,
      recipe: item.recipe_data as Message["recipe"],
      timestamp: new Date(item.created_at).getTime(),
    }))
    .reverse();

  const oldestTimestamp = messages.length > 0 ? messages[0].timestamp : null;

  return { messages, hasMore, oldestTimestamp };
};

export const clearChatHistory = async () => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await (supabase.from("chat_history") as any)
    .delete()
    .eq("user_id", user.id);

  if (error) throw error;
};
