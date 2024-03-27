export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          chat_id: string;
          created_at: string;
          id: string;
          image: string | null;
          sender_id: string;
          text: string;
        };
        Insert: {
          chat_id: string;
          created_at?: string;
          id?: string;
          image?: string | null;
          sender_id?: string;
          text: string;
        };
        Update: {
          chat_id?: string;
          created_at?: string;
          id?: string;
          image?: string | null;
          sender_id?: string;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey";
            columns: ["chat_id"];
            isOneToOne: false;
            referencedRelation: "chats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_participants: {
        Row: {
          chat_id: string;
          is_admin: boolean;
          status: string;
          user_id: string;
        };
        Insert: {
          chat_id: string;
          is_admin?: boolean;
          status?: string;
          user_id: string;
        };
        Update: {
          chat_id?: string;
          is_admin?: boolean;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey";
            columns: ["chat_id"];
            isOneToOne: false;
            referencedRelation: "chats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      chats: {
        Row: {
          chat_type: string;
          created_at: string;
          id: string;
          name: string | null;
        };
        Insert: {
          chat_type: string;
          created_at?: string;
          id?: string;
          name?: string | null;
        };
        Update: {
          chat_type?: string;
          created_at?: string;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      friend_addresses: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friend_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      friends: {
        Row: {
          created_at: string | null;
          receiver_id: string;
          sender_id: string;
          status: string;
        };
        Insert: {
          created_at?: string | null;
          receiver_id: string;
          sender_id?: string;
          status?: string;
        };
        Update: {
          created_at?: string | null;
          receiver_id?: string;
          sender_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friends_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friends_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      post_attachments: {
        Row: {
          caption: string | null;
          created_at: string;
          id: string;
          image: string | null;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          image?: string | null;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          image?: string | null;
        };
        Relationships: [];
      };
      post_collection_posts: {
        Row: {
          collection_id: string;
          created_at: string;
          post_id: string;
        };
        Insert: {
          collection_id?: string;
          created_at?: string;
          post_id?: string;
        };
        Update: {
          collection_id?: string;
          created_at?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_post_collection_posts_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "post_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_post_collection_posts_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_collection_shares: {
        Row: {
          collection_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          collection_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          collection_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_post_collection_shares_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "post_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_post_collection_shares_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      post_collections: {
        Row: {
          created_at: string;
          emoji: string | null;
          id: string;
          label: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          emoji?: string | null;
          id?: string;
          label: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          emoji?: string | null;
          id?: string;
          label?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_post_collections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      post_comments: {
        Row: {
          created_at: string | null;
          id: string;
          parent_id: string | null;
          post_id: string;
          text: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          parent_id?: string | null;
          post_id: string;
          text: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          parent_id?: string | null;
          post_id?: string;
          text?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "post_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          created_at: string | null;
          edited_at: string | null;
          id: string;
          location: unknown | null;
          text: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          edited_at?: string | null;
          id: string;
          location?: unknown | null;
          text?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          edited_at?: string | null;
          id?: string;
          location?: unknown | null;
          text?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      summaries: {
        Row: {
          content: string | null;
          created_at: string;
          date: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          date: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_summaries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_notifications: {
        Row: {
          created_at: string;
          push_token: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          push_token: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          push_token?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_user_notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          birthdate: string | null;
          created_at: string | null;
          email: string;
          id: string;
          last_login: string | null;
          name: string | null;
          updated_at: string;
        };
        Insert: {
          birthdate?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          last_login?: string | null;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          birthdate?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          last_login?: string | null;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      all_friend_addresses_inactive: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
      create_chat_with_admin: {
        Args: {
          chat_name: string;
          chat_type: string;
        };
        Returns: string;
      };
      get_user_id_from_friend_address: {
        Args: {
          check_address: string;
        };
        Returns: string;
      };
      invite_friend_by_address: {
        Args: {
          target_friend_address: string;
        };
        Returns: boolean;
      };
      is_friend_address_of_user: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
      is_user_in_chat: {
        Args: {
          chat_id: string;
        };
        Returns: boolean;
      };
      is_user_invited: {
        Args: {
          user_id: string;
          friend_address: string;
        };
        Returns: boolean;
      };
      is_user_sender_pending: {
        Args: {
          sender_id: string;
        };
        Returns: boolean;
      };
      users_are_friends: {
        Args: {
          user_1_id: string;
          user_2_id: string;
        };
        Returns: boolean;
      };
      users_share_chat: {
        Args: {
          user_one: string;
          user_two: string;
        };
        Returns: boolean;
      };
      verify_user_password: {
        Args: {
          password: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (
      & Database[PublicTableNameOrOptions["schema"]]["Tables"]
      & Database[PublicTableNameOrOptions["schema"]]["Views"]
    )
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database } ? (
    & Database[PublicTableNameOrOptions["schema"]]["Tables"]
    & Database[PublicTableNameOrOptions["schema"]]["Views"]
  )[TableName] extends {
    Row: infer R;
  } ? R
  : never
  : PublicTableNameOrOptions extends keyof (
    & PublicSchema["Tables"]
    & PublicSchema["Views"]
  ) ? (
      & PublicSchema["Tables"]
      & PublicSchema["Views"]
    )[PublicTableNameOrOptions] extends {
      Row: infer R;
    } ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  } ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    } ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  } ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    } ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
