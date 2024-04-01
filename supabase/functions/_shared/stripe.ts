import Stripe from "https://esm.sh/stripe@14.23.0?target=deno";

export const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2022-08-01",
});
