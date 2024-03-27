import { createClient } from "../_shared/clients.ts";

Deno.serve(async (req) => {
  const { email } = await req.json();

  const supabaseAdmin = createClient("admin");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    return new Response(JSON.stringify({ exists: false }), {
      status: 200,
    });
  }

  return new Response(JSON.stringify({ exists: true }), {
    status: 200,
  });
});
