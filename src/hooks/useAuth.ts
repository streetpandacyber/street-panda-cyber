"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/types";

interface RegisterData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  newsletter_subscribed?: boolean;
}

export function useAuth() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setIsLoading(false);
      return;
    }
    const supabase = createClient();

    const loadProfile = async (u: User | null) => {
      if (!u) {
        setProfile(null);
        return;
      }
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();
        setProfile((data as Profile) ?? null);
      } catch {
        setProfile(null);
      }
    };

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        await loadProfile(data.user);
      } finally {
        setIsLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  const login = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      return data.user;
    },
    []
  );

  const register = useCallback(async (data: RegisterData) => {
    const supabase = createClient();
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          newsletter_subscribed: data.newsletter_subscribed ?? true,
        },
      },
    });
    if (error) throw new Error(error.message);
    return res;
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/login`,
    });
    if (error) throw new Error(error.message);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      setProfile(data as Profile);
      return data as Profile;
    },
    [user]
  );

  return {
    configured,
    user,
    profile,
    isAdmin: Boolean(profile?.is_admin),
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
  };
}
