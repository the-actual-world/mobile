import { createContext } from "react";
import { EmailOtpType, Session, SupabaseClient } from "@supabase/supabase-js";

type SupabaseContextProps = {
  isLoggedIn: boolean;
  signUp: (
    email: string,
    password: string,
    extra: { [key: string]: any }
  ) => Promise<void>;
  verifyOtp: (
    email: string,
    token: string,
    type: EmailOtpType
  ) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sb: SupabaseClient<any, "public", any>;
  session: Session | null;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  isLoggedIn: false,
  signUp: async () => {},
  verifyOtp: async () => {},
  signInWithPassword: async () => {},
  signInWithGoogle: async () => {},
  resetPasswordForEmail: async () => {},
  signOut: async () => {},
  sb: {} as SupabaseClient<any, "public", any>,
  session: null,
});
