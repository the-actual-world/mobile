import { createClient } from "../_shared/clients.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";

const hf = new HfInference(Deno.env.get("HUGGINGFACE_ACCESS_TOKEN"));

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

  const {
    day,
    month,
    year,
    userLanguage,
  } = await req.json();

  try {
    const user_id = user?.id ?? "";
    const supabaseAdmin = createClient("admin");

    // get all data from the user
    const { data: posts } = await supabaseClient
      .from(
        "posts, attachments:post_attachments(*), tagged_friends:post_tagged_friends(*), comments:post_comments(*), user:users(*)",
      )
      .select("*")
      .gte("created_at", `${year}-${month}-${day}T00:00:00.000Z`)
      .lte("created_at", `${year}-${month}-${day}T23:59:59.999Z`);

    const { data: messages } = await supabaseClient
      .from("chat_messages")
      .select("*, chat:chats(*), user:users(*)")
      .gte("created_at", `${year}-${month}-${day}T00:00:00.000Z`)
      .lte("created_at", `${year}-${month}-${day}T23:59:59.999Z`);

    // generate summary
    const roughSummary = await hf.textGeneration({
      inputs:
        `<|system|>Based on the data from the user below, generate a quick summary of the things that happened during the day. I want you to tell me what was discussed and when, as well as what the user's friends did. Be concise and just list out what happened during the day.<|user|>Posts: ${
          JSON.stringify(posts)
        } Messages: ${JSON.stringify(messages)}<|assistant|>`,
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      parameters: {
        return_full_text: false,
      },
    }).then((res) => res.generated_text);

    let summary = roughSummary;

    // translate the summary
    if (userLanguage !== "en") {
      summary = await hf.textGeneration({
        inputs:
          `<|system|>You are a professional translation with knowledge of every single language. Reply to the user SOLY with the final translation from English into the language he choses (with the language code), followed by whatever he writes. Reply ONLY with the translated text (without the language code or the quotation marks demarking the text you have to translate).<|user|>${userLanguage} - "${roughSummary}"<|assistant|>`,
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        parameters: {
          return_full_text: false,
        },
      }).then((res) => res.generated_text);
    }

    // save the summary
    await supabaseClient.from("summaries").upsert([
      {
        ai_summary: true,
        user_id: user_id,
        date: `${year}-${month}-${day}`,
        content: summary,
      },
    ]);

    // remove credits
    await supabaseAdmin
      .from("user_credits").insert([
        {
          amount: -100,
          user_id: user_id,
          sender: "SYSTEM",
        },
      ]);

    return new Response(
      JSON.stringify({
        message: "Generated summary successfully",
        content: summary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Caught error", error);
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
  // Return a success response to the client
});
