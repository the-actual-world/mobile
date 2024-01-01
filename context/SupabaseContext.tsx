import { createContext } from "react";
import {
  EmailOtpType,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

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
  signInWithIdToken: (provider: string, idToken: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sb: SupabaseClient<any, "public", any>;
  user: User | null;
  session: Session | null;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  isLoggedIn: false,
  signUp: async () => {},
  verifyOtp: async () => {},
  signInWithPassword: async () => {},
  signInWithIdToken: async () => {},
  resetPasswordForEmail: async () => {},
  signOut: async () => {},
  sb: {} as SupabaseClient<any, "public", any>,
  user: null,
  session: null,
});
