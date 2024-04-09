import "react-native-url-polyfill/auto";
import { Tables } from "@/supabase/functions/_shared/supabase";
import React, { PropsWithChildren } from "react";
import { sb, useSupabase } from "./SupabaseProvider";
import { useTranslation } from "react-i18next";
import {
  usePathname,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { useCredits } from "./CreditsProvider";

const RedirectsContext = React.createContext({});

export function RedirectsProvider({ children }: PropsWithChildren) {
  const { session, isLoggedIn } = useSupabase();
  const { totalCredits } = useCredits();

  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  const navigationState = useRootNavigationState();
  React.useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[1] === "(auth)";

    console.log("RedirectsProvider", segments, isLoggedIn, totalCredits);

    if (
      isLoggedIn &&
      !inAuthGroup &&
      totalCredits !== null &&
      totalCredits <= 0 &&
      segments[0] !== "credits-up"
    ) {
      console.log("Redirecting to credits-up");
      router.replace("/credits-up");
    } else if (
      isLoggedIn &&
      !inAuthGroup &&
      totalCredits !== null &&
      totalCredits > 0 &&
      segments[0] === "credits-up"
    ) {
      console.log("Redirecting to home");
      router.replace("/home");
    } else if (
      // If the user is not logged in and the initial segment is not anything in the auth group.
      !isLoggedIn &&
      !inAuthGroup &&
      segments[0] !== "onboarding"
    ) {
      // Redirect to the sign-up page.
      router.replace("/sign-up");
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect away from the sign-up page.
      router.replace("/home");
    }
  }, [isLoggedIn, segments, navigationState, totalCredits]);

  return children;
}

export function useRedirects() {
  return React.useContext(RedirectsContext);
}
