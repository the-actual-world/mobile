import "react-native-url-polyfill/auto";
import * as React from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

export const useSupabase = () => React.useContext(SupabaseContext);

import {
  EmailOtpType,
  Session,
  SupabaseClient,
  User,
  createClient,
} from "@supabase/supabase-js";
import "react-native-get-random-values";
import {
  useSegments,
  useRouter,
  useRootNavigationState,
  usePathname,
} from "expo-router";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAlert } from "./AlertProvider";
import { useTranslation } from "react-i18next";
import { Database, Tables } from "@/supabase/functions/_shared/supabase";
import { LargeSecureStore } from "@/lib/large-secure-store";

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
  user: Tables<"users"> | null;
  session: Session | null;
};

export const SupabaseContext = React.createContext<SupabaseContextProps>({
  isLoggedIn: false,
  signUp: async () => {},
  verifyOtp: async () => {},
  signInWithPassword: async () => {},
  signInWithIdToken: async () => {},
  resetPasswordForEmail: async () => {},
  signOut: async () => {},
  user: null,
  session: null,
});

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();

export const sb = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      storage: new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

type SupabaseProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const SupabaseProvider = (props: SupabaseProviderProps) => {
  const [isLoggedIn, setLoggedIn] = React.useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const signUp = async (
    email: string,
    password: string,
    extra: { [key: string]: any }
  ) => {
    const { error } = await sb.auth.signUp({
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
    const { data, error } = await sb.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (error) throw error;
    console.log("OTP verified successfully with data: " + JSON.stringify(data));
    setLoggedIn(true);
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setLoggedIn(true);
  };

  const signInWithIdToken = async (provider: string, idToken: string) => {
    const { data, error } = await sb.auth.signInWithIdToken({
      provider: provider,
      token: idToken,
    });
    if (error) throw error;
    setLoggedIn(true);
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    setLoggedIn(false);

    // GoogleSignin.revokeAccess();
    // GoogleSignin.signOut();
  };

  const getSession = async () => {
    const result = await sb.auth.getSession();
    setLoggedIn(result.data.session !== null);
    return result;
  };

  const [user, setUser] = React.useState<Tables<"users"> | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    // Listen for changes to authentication state
    const { data } = sb.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        const { data, error } = await sb
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (error) {
          throw error;
        }
        setUser(data);
      }
      setLoggedIn(session !== null);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [isLoggedIn]);

  React.useEffect(() => {
    if (pathname !== "/") {
      // hide splash screen
      getSession()
        .then(() => {
          // SplashScreen.hideAsync();
        })
        .finally(() => {
          setTimeout(() => {
            SplashScreen.hideAsync();
          }, 100);
        });
    }
  }, [pathname]);

  const alertRef = useAlert();
  const { t } = useTranslation();

  // useProtectedRoute(isLoggedIn);

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
            const { data, error } = await sb.auth.setSession({
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
        user,
        session,
      }}
    >
      {props.children}
    </SupabaseContext.Provider>
  );
};
