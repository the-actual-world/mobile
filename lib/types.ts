export type Error = {
  name: string;
  message: string;
  status: number;
};

export interface Chat {
  id: string;
  chat_type: "group" | "1-1";
  name: string;
  chat_messages?: ChatMessage[];
  participants: Participant[];
}

export interface Participant {
  chat_id: string;
  user: User;
  is_admin: boolean;
  status: "invited" | "joined" | "hidden" | "left";
  last_read_at: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  created_at: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  birthdate: string;
  email: string;
}

export type FriendStatus = "accepted" | "pending" | "rejected";
export type FriendType = "sender" | "receiver";

export type Friend = {
  user: {
    id: string;
    name: string;
    type: FriendType;
  };
  status: FriendStatus;
};

export type StripeStyle = "alwaysLight" | "alwaysDark" | "automatic";
