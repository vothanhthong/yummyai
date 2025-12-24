import { supabase } from "../lib/supabaseClient";
import { User } from "../types";

export const signUp = async (email: string, password: string, name: string) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split("@")[0] || "Người dùng",
    email: user.email || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  };
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        name:
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "Người dùng",
        email: session.user.email || "",
        avatar_url: session.user.user_metadata?.avatar_url || "",
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};
