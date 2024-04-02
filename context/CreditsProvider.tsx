import { Tables } from "@/supabase/functions/_shared/supabase";
import React from "react";
import { sb, useSupabase } from "./SupabaseProvider";

const CreditsContext = React.createContext<{
  credits: Tables<"user_credits">[];
  totalCredits: number;
  loadMore: (pages: number) => void;
}>({
  credits: [],
  totalCredits: 0,
  loadMore: () => {},
});

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = React.useState<Tables<"user_credits">[]>([]);
  const [totalCredits, setTotalCredits] = React.useState(0);
  const { session } = useSupabase();

  const [offset, setOffset] = React.useState(0);
  const PAGE_SIZE = 20;

  async function loadMore(pages: number) {
    for (let i = 0; i < pages; i++) {
      await getCredits();
    }
  }

  async function getCredits() {
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

    setCredits((credits) => [
      ...credits,
      ...data.filter(
        (newCredit) => !credits.some((credit) => credit.id === newCredit.id)
      ),
    ]);
    setOffset(offset + data.length);
  }

  async function getTotalCredits() {
    if (!session) return;
    const { data } = await sb.rpc("get_total_user_credits");
    setTotalCredits(data ?? 0);
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
          console.log("New credit", payload.new);
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as Tables<"user_credits">;
            setCredits((credits) => [newRow, ...credits]);
            setTotalCredits(totalCredits + newRow.amount);
            setOffset(offset + 1);
          }
        }
      )
      .subscribe();
  }

  React.useEffect(() => {
    if (!session) return;
    getCredits();
    getTotalCredits();

    const subscription = setupRealtimeUpdates();

    return () => {
      console.log("Unsubscribing from realtime updates");
      subscription.unsubscribe();
    };
  }, [session]);

  return (
    <CreditsContext.Provider value={{ credits, totalCredits, loadMore }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return React.useContext(CreditsContext);
}
