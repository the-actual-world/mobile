import "react-native-url-polyfill/auto";
import * as React from "react";

import {
  EmailOtpType,
  Session,
  User,
  createClient,
} from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import * as aesjs from "aes-js";
import "react-native-get-random-values";
import { useSegments, useRouter, useRootNavigationState } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { SupabaseContext } from "./SupabaseContext";
import { useAlert } from "./AlertContext";
import { useTranslation } from "react-i18next";
import { Database } from "@/supabase/functions/_shared/supabase";

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();

class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(
      key,
      aesjs.utils.hex.fromBytes(encryptionKey)
    );

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return encryptionKeyHex;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return encrypted;
    }

    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);

    await AsyncStorage.setItem(key, encrypted);
  }
}

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

  const router = useRouter();

  const supabase = createClient<Database>(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL as string,
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        storage: new LargeSecureStore(),
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
    console.log("REDIRECT TO", redirectTo);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

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

  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    // Listen for changes to authentication state
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session ? session.user : null);
      setLoggedIn(session !== null);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [isLoggedIn]);

  React.useEffect(() => {
    getSession().then(async () => {
      await SplashScreen.hideAsync();
    });
  }, [isLoggedIn]);

  useProtectedRoute(isLoggedIn);

  const alertRef = useAlert();
  const { t } = useTranslation();

  const url = Linking.useURL();
  React.useEffect(() => {
    async function handleRedirect() {
      if (url) {
        const { params, errorCode } = QueryParams.getQueryParams(url);

        if (errorCode) {
          alertRef.current?.showAlert({
            variant: "destructive",
            title: t("common:error"),
            message: errorCode,
          });

          return;
        }

        console.log("PARAMS: " + JSON.stringify(params));

        const { access_token, refresh_token, type } = params;

        if (access_token && refresh_token && type) {
          if (type === "recovery") {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              alertRef.current?.showAlert({
                variant: "destructive",
                title: t("common:error"),
                message: error.message,
              });

              return;
            }

            router.replace("/reset-password");
          }
        } else if (params.error) {
          alertRef.current?.showAlert({
            variant: "destructive",
            title: t("common:error"),
            message: params.error_description,
          });
        }
      }
    }
    handleRedirect();
  }, [url]);

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
        user,
        session,
      }}
    >
      {props.children}
    </SupabaseContext.Provider>
  );
};
