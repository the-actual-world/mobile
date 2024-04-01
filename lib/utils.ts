import { Chat } from "./types";

export function random_uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOtherChatUsers(chat: Chat, user_id: string) {
  return chat.participants.filter(
    (participant) => participant.user.id !== user_id,
  );
}
