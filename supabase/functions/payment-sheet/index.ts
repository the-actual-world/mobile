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
  } else if (!user) {
    return new Response(
      JSON.stringify({ error: "User not found" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      },
    );
  }

  const { data: userData, error: userDataError } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userDataError) {
    console.error("User data error", userDataError);
    return new Response(
      JSON.stringify({ error: userDataError.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }

  let customerId = userData?.stripe_customer_id;

  if (!userData?.stripe_customer_id) {
    const customer = await stripe.customers.create({
      email: userData.email,
      name: userData.name,
      metadata: {
        user_id: user.id,
      },
    });

    customerId = customer.id;

    await supabaseClient
      .from("users")
      .update({ stripe_customer_id: customer.id })
      .eq("id", user.id);
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customerId },
    { apiVersion: "2022-11-15" },
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "eur",
    customer: customerId,
    payment_method_types: ["card", "paypal"],
  });

  const res = {
    paymentIntent: paymentIntent.client_secret,
    publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY"),
    customerId: customerId,
    ephemeralKey: ephemeralKey.secret,
  };

  return new Response(
    JSON.stringify(res),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
});
