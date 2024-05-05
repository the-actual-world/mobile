import { sb } from "@/context/SupabaseProvider";
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

export function getPostAttachmentSource(path: string, user_id: string) {
  return sb.storage.from("post_attachments").getPublicUrl(
    `${user_id}/${path}`,
  ).data.publicUrl;
}

export class LocationUtils {
  static getLatLong(location: string) {
    if (!location) return null;
    return {
      latitude: parseFloat(location.split(",")[0].replace("(", "")),
      longitude: parseFloat(location.split(",")[1].replace(")", "")),
    };
  }
}
