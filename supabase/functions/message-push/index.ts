import { createClient } from "../_shared/clients.ts";
import { Tables } from "../_shared/supabase.ts";

interface WebhookPayload {
  type: "INSERT";
  table: "chat_messages";
  record: Tables<"chat_messages">;
  schema: "public";
  old_record: null | Tables<"chat_messages">;
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  const supabaseAdmin = createClient("admin");

  const message = payload.record;

  const { data: sender } = await supabaseAdmin
    .from("users")
    .select("name")
    .eq("id", message.sender_id)
    .single();

  const { data: chat } = await supabaseAdmin
    .from("chats")
    .select("*")
    .eq("id", message.chat_id)
    .single();

  const { data: participantsResults } = await supabaseAdmin
    .from("chat_participants")
    .select("user_id")
    .eq("chat_id", message.chat_id)
    .eq("status", "joined");

  const participants = participantsResults?.map((participant) =>
    participant.user_id
  ).filter((id) => id !== message.sender_id);

  const { data: tokensResults } = await supabaseAdmin
    .from("user_notifications")
    .select("push_token")
    .in("user_id", participants as string[]);

  const tokens = tokensResults?.map((result) => result.push_token);

  const messages = tokens?.map((token) => ({
    to: token,
    sound: "default",
    title: chat?.chat_type === "1-1" ? sender?.name : chat?.name,
    body: chat?.chat_type === "1-1"
      ? message.text
      : `${sender?.name}: ${message.text}`,
    data: { toScreen: "/chat/messages/" + message.chat_id },
  }));

  const responses = await Promise.all(
    messages!.map((message) =>
      fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })
    ),
  );

  console.log("Push notification responses", responses);

  return new Response("Message notification sent to chat participants");
});
