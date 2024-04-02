import { createClient } from "../_shared/clients.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { stripe } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  const supabaseClient = createClient("normal", req);

  const { credits }: {
    credits: number;
  } = await req.json();

  const amountInCents = credits / 100;

  const { data: { user }, error: userError } = await supabaseClient.auth
    .getUser();
  if (userError) {
    console.error("User error", userError);
    return new Response(JSON.stringify({ error: userError.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const paymentIntent = await stripe.createIntents.create({
    amount: amountInCents,
    currency: "eur",
  });

  const res = {
    paymentIntent: paymentIntent.client_secret,
    publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY"),
  };

  return new Response(
    JSON.stringify(res),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
});
