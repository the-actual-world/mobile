import Stripe from "stripe";

export const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2022-11-15",
});
