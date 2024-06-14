import { createClient } from "../_shared/clients.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseClient = createClient("normal", req);

  const { data: { user }, error: userError } = await supabaseClient.auth
    .getUser();
  if (userError) {
    console.error("User error", userError);
    return new Response(JSON.stringify({ error: userError.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const { password } = await req.json();

  const { data: isValidOldPassword, error: passwordError } =
    await supabaseClient.rpc("verify_user_password", {
      password: password,
    });
  console.log("Old password verified", isValidOldPassword);
  if (passwordError || !isValidOldPassword) {
    console.error("Invalid old password", passwordError);
    return new Response(JSON.stringify({ error: "Invalid old password" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    // Fetch the user's profile data
    const user_id = user?.id ?? "";
    // Update the user's password using the Supabase Admin API
    const supabaseAdmin = createClient("admin");
    console.log("Admin client created");
    // Return a success response to the client
    const { error: updateError } = await supabaseAdmin
      .auth.admin.deleteUser(user_id);
    console.log("User deleted");
    if (updateError) {
      console.error("Update error", updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Caught error", error);
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
  console.log("User deleted successfully");
  // Return a success response to the client
  return new Response(
    JSON.stringify({ message: "User deleted successfully" }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
});
