interface Chat {
  id: string;
  chat_type: "group" | "1-1";
  name: string;
  chat_messages?: ChatMessage[];
  participants: Participant[];
}

interface Participant {
  chat_id: string;
  user: User;
  is_admin: boolean;
  status: "invited" | "joined" | "hidden" | "left";
}

interface ChatMessage {
  id: string;
  text: string;
  created_at: string;
  user: User;
}

interface User {
  id: string;
  name: string;
  birthdate: string;
  email: string;
}
