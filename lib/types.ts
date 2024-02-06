interface Chat {
  id: string;
  chat_type: "group" | "1-1";
  name: string;
  participants: Participant[];
}

interface Participant {
  chat_id: string;
  user: User;
  is_admin: boolean;
}

interface User {
  id: string;
  name: string;
  birthdate: string;
  email: string;
}
