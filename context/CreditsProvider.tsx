import { Tables } from "@/supabase/functions/_shared/supabase";
import React, { PropsWithChildren } from "react";
import { sb, useSupabase } from "./SupabaseProvider";

const CreditsContext = React.createContext<{
  transactions: Tables<"user_credits">[];
  totalCredits: number | null;
  estimatedDailyCreditsSpent: number | null;
  loadMore: (pages: number) => void;
}>({
  transactions: [],
  totalCredits: null,
  estimatedDailyCreditsSpent: null,
  loadMore: () => {},
});

export function CreditsProvider({ children }: PropsWithChildren) {
  const [transactions, setTransactions] = React.useState<
    Tables<"user_credits">[]
  >([]);
  const [totalCredits, setTotalCredits] = React.useState<number | null>(null);
  const [estimatedDailyCreditsSpent, setEstimatedDailyCreditsSpent] =
    React.useState<number | null>(null);
  const { session } = useSupabase();

  const [offset, setOffset] = React.useState(0);
  const PAGE_SIZE = 20;

  // const [fetchedInitialTotalCredits, setFetchedInitialTotalCredits] =
  //   React.useState(false);

  // const router = useRouter();
  // const pathname = usePathname();

  // React.useEffect(() => {
  //   console.log("PATHNAME: " + pathname);
  //   if (
  //     session &&
  //     fetchedInitialTotalCredits &&
  //     totalCredits <= 0 &&
  //     pathname.includes("(credits)")
  //   ) {
  //     router.replace("/settings/manage-credits");
  //   }
  // }, [totalCredits]);

  async function loadMore(pages: number) {
    for (let i = 0; i < pages; i++) {
      await getTransactions();
    }
  }

  async function getTransactions() {
    if (!session) return;
    const { data, error } = await sb
      .from("user_credits")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching credits", error);
      return;
    }

    if (data.length === 0) return;

    setTransactions((credits) => [
      ...credits,
      ...data.filter(
        (newCredit) => !credits.some((credit) => credit.id === newCredit.id)
      ),
    ]);
    setOffset(offset + data.length);
  }

  async function getTotalCredits() {
    if (!session) return;
    const { data } = await sb.rpc("get_total_user_credits", {
      optional_user_id: session.user.id,
    });
    setTotalCredits(data ?? 0);
    // setFetchedInitialTotalCredits(true);
  }

  async function getEstimatedDailyCreditsSpent() {
    if (!session) return;
    const { data } = await sb.rpc("calculate_daily_credit_charge", {
      user_id: session.user.id,
    });
    setEstimatedDailyCreditsSpent(data ?? 0);
  }

  function setupRealtimeUpdates() {
    console.log("Setting up realtime updates");
    return sb
      .channel(`user_credits_inserts`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_credits",
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("New credit", payload.new);
            const newRow = payload.new as Tables<"user_credits">;
            setTransactions((credits) => [newRow, ...credits]);
            setTotalCredits((totalCredits) => totalCredits! + newRow.amount);
            setOffset((offset) => offset + 1);
          }
        }
      )
      .subscribe();
  }

  React.useEffect(() => {
    if (!session) return;
    getTransactions();
    getTotalCredits();
    getEstimatedDailyCreditsSpent();

    const subscription = setupRealtimeUpdates();

    return () => {
      console.log("Unsubscribing from realtime updates");
      subscription.unsubscribe();
    };
  }, [session]);

  return (
    <CreditsContext.Provider
      value={{
        transactions,
        totalCredits,
        estimatedDailyCreditsSpent,
        loadMore,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return React.useContext(CreditsContext);
}
