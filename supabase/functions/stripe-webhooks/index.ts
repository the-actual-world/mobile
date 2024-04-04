import Stripe from "stripe";
import { createClient } from "../_shared/clients.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");

  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
  console.log(`🔔 Event received: ${receivedEvent.id}`);

  const supabaseAdmin = createClient("admin");

  switch (receivedEvent.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = receivedEvent.data.object as Stripe.PaymentIntent;
      console.log(`💰 PaymentIntent status: ${paymentIntent.status}`);

      const amount = paymentIntent.amount / 100;

      // Update user's credits
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("stripe_customer_id", paymentIntent.customer)
        .single();

      if (userError) {
        console.error("User error", userError);
        return new Response(JSON.stringify({ error: userError.message }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        });
      } else if (!user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { headers: { "Content-Type": "application/json" }, status: 404 },
        );
      }

      const creditsToAdd = amount * 10000;

      const { data: updatedUser, error: updateUserError } = await supabaseAdmin
        .from("user_credits")
        .insert({
          user_id: user.id,
          amount: creditsToAdd,
          sender: "BOUGHT",
        });

      if (updateUserError) {
        console.error("User credits error", updateUserError);
        return new Response(
          JSON.stringify({ error: updateUserError.message }),
          { headers: { "Content-Type": "application/json" }, status: 500 },
        );
      }
      break;
    }
    default: {
      console.log(`❌ Unhandled event type: ${receivedEvent.type}`);
      break;
    }
  }

  return new Response("ok");
});
