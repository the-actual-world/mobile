import "react-native-url-polyfill/auto";
import * as React from "react";

import { EmailOtpType, Session, createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { useSegments, useRouter, useRootNavigationState } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";

import { SupabaseContext } from "./SupabaseContext";

// We are using Expo Secure Store to persist session info
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// This hook will protect the route access based on user authentication.
function useProtectedRoute(isLoggedIn: boolean) {
  const segments = useSegments();
  const router = useRouter();

  const navigationState = useRootNavigationState();
  React.useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[1] === "(auth)";

    if (
      // If the user is not logged in and the initial segment is not anything in the auth group.
      !isLoggedIn &&
      !inAuthGroup
    ) {
      // Redirect to the sign-up page.
      if (segments[0] !== "onboarding") {
        router.replace("/sign-up");
      }
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect away from the sign-up page.
      router.replace("/settings");
    }
  }, [isLoggedIn, segments, navigationState]);
}

type SupabaseProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const SupabaseProvider = (props: SupabaseProviderProps) => {
  const [isLoggedIn, setLoggedIn] = React.useState<boolean>(false);

  const supabase = createClient(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL as string,
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );

  const signUp = async (
    email: string,
    password: string,
    extra: { [key: string]: any }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: extra,
      },
    });
    if (error) throw error;
  };

  const verifyOtp = async (
    email: string,
    token: string,
    type: EmailOtpType
  ) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (error) throw error;
    setLoggedIn(true);
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setLoggedIn(true);
  };

  const signInWithIdToken = async (provider: string, idToken: string) => {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: provider,
      token: idToken,
    });
    if (error) throw error;
    setLoggedIn(true);
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setLoggedIn(false);
  };

  const getSession = async () => {
    const result = await supabase.auth.getSession();
    setLoggedIn(result.data.session !== null);
  };

  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // React.useEffect(() => {
  //   (async () => {
  //     getSession();
  //     await SplashScreen.hideAsync();
  //   })();
  // }, [isLoggedIn]);

  React.useEffect(() => {
    getSession().then(async () => {
      await SplashScreen.hideAsync();
    });
  }, [isLoggedIn]);

  useProtectedRoute(isLoggedIn);

  return (
    <SupabaseContext.Provider
      value={{
        isLoggedIn,
        signInWithPassword,
        signInWithIdToken,
        verifyOtp,
        signUp,
        resetPasswordForEmail,
        signOut,
        sb: supabase,
        session,
      }}
    >
      {props.children}
    </SupabaseContext.Provider>
  );
};
