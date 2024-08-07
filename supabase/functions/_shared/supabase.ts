export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          image: string | null
          reply_to: string | null
          sender_id: string
          text: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          image?: string | null
          reply_to?: string | null
          sender_id?: string
          text: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          image?: string | null
          reply_to?: string | null
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string
          is_admin: boolean
          last_read_at: string
          status: string
          user_id: string
        }
        Insert: {
          chat_id: string
          is_admin?: boolean
          last_read_at?: string
          status?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          is_admin?: boolean
          last_read_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          chat_type: string
          created_at: string
          id: string
          is_active: boolean
          name: string | null
        }
        Insert: {
          chat_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string | null
        }
        Update: {
          chat_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string | null
        }
        Relationships: []
      }
      friend_addresses: {
        Row: {
          active: boolean
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string | null
          receiver_id: string
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          receiver_id: string
          sender_id?: string
          status?: string
        }
        Update: {
          created_at?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_attachments: {
        Row: {
          caption: string
          created_at: string
          id: string
          media_type: Database["public"]["Enums"]["mediatype"]
          path: string
          post_id: string
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["mediatype"]
          path: string
          post_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["mediatype"]
          path?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "friends_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_collection_posts: {
        Row: {
          collection_id: string
          created_at: string
          post_id: string
        }
        Insert: {
          collection_id?: string
          created_at?: string
          post_id?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_post_collection_posts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "post_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_post_collection_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "friends_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_post_collection_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_collections: {
        Row: {
          created_at: string
          emoji: string
          id: string
          label: string
          public: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          label: string
          public?: boolean
          user_id?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          label?: string
          public?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          status: Database["public"]["Enums"]["commentstatus"]
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          status?: Database["public"]["Enums"]["commentstatus"]
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: Database["public"]["Enums"]["commentstatus"]
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "friends_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_poll_options: {
        Row: {
          id: string
          option_order: number | null
          option_text: string
          poll_id: string
        }
        Insert: {
          id?: string
          option_order?: number | null
          option_text: string
          poll_id: string
        }
        Update: {
          id?: string
          option_order?: number | null
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      post_poll_votes: {
        Row: {
          id: string
          poll_option_id: string
          voted_at: string
          voter_id: string
        }
        Insert: {
          id?: string
          poll_option_id: string
          voted_at?: string
          voter_id: string
        }
        Update: {
          id?: string
          poll_option_id?: string
          voted_at?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "post_poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_poll_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_poll_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_polls: {
        Row: {
          created_at: string
          id: string
          post_id: string
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          question: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "friends_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tagged_users: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tagged_users_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "friends_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tagged_users_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tagged_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tagged_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          created_at: string
          id: string
          location: unknown | null
          text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: unknown | null
          text?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: unknown | null
          text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      summaries: {
        Row: {
          ai_summary: boolean
          content: string
          created_at: string
          date: string
          user_id: string
        }
        Insert: {
          ai_summary?: boolean
          content?: string
          created_at?: string
          date: string
          user_id?: string
        }
        Update: {
          ai_summary?: boolean
          content?: string
          created_at?: string
          date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          amount: number
          created_at: string
          id: string
          sender: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          sender: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          sender?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_user_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_user_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          push_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          push_token: string
          user_id?: string
        }
        Update: {
          created_at?: string
          push_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birthdate: string | null
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          name?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      friends_posts: {
        Row: {
          created_at: string | null
          edited_at: string | null
          id: string | null
          location: unknown | null
          text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          edited_at?: string | null
          id?: string | null
          location?: unknown | null
          text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          edited_at?: string | null
          id?: string | null
          location?: unknown | null
          text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "my_friends"
            referencedColumns: ["id"]
          },
        ]
      }
      my_friends: {
        Row: {
          birthdate: string | null
          created_at: string | null
          email: string | null
          id: string | null
          last_login: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_login?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          last_login?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_where_i_am: {
        Row: {
          created_at: string | null
          id: string | null
          location: unknown | null
          text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      random_posts_where_i_am: {
        Row: {
          created_at: string | null
          id: string | null
          location: unknown | null
          row_num: number | null
          text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      all_friend_addresses_inactive: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      calculate_daily_credit_charge: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      calculate_storage_used_by_user: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      create_chat_with_admin: {
        Args: {
          chat_name: string
          chat_type: string
        }
        Returns: string
      }
      deduct_daily_charges: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_friends_with_1on1_chats: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_post_locations: {
        Args: Record<PropertyKey, never>
        Returns: {
          location: string
          post_count: number
        }[]
      }
      get_total_user_credits:
        | {
            Args: Record<PropertyKey, never>
            Returns: number
          }
        | {
            Args: {
              optional_user_id?: string
            }
            Returns: number
          }
      get_user_id_from_friend_address: {
        Args: {
          check_address: string
        }
        Returns: string
      }
      get_user_posts_in_locations: {
        Args: {
          locations: string[]
        }
        Returns: {
          post_id: string
          post_text: string
          post_created_at: string
          post_updated_at: string
          post_location: unknown
          user_record: Json
          attachments: Json
          tagged_users: Json
        }[]
      }
      gift_credits: {
        Args: {
          receiver_id: string
          gift_amount: number
        }
        Returns: boolean
      }
      invite_friend_by_address: {
        Args: {
          target_friend_address: string
        }
        Returns: boolean
      }
      invite_user_to_chat: {
        Args: {
          userid: string
          chatid: string
        }
        Returns: undefined
      }
      is_friend_address_of_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_user_in_chat: {
        Args: {
          chat_id: string
        }
        Returns: boolean
      }
      is_user_invited: {
        Args: {
          user_id: string
          friend_address: string
        }
        Returns: boolean
      }
      is_user_sender_pending: {
        Args: {
          sender_id: string
        }
        Returns: boolean
      }
      kick_user_from_chat: {
        Args: {
          userid: string
          chatid: string
        }
        Returns: undefined
      }
      user_can_view_post: {
        Args: {
          user_id: string
          post_id: string
        }
        Returns: boolean
      }
      users_are_friends: {
        Args: {
          user_1_id: string
          user_2_id: string
        }
        Returns: boolean
      }
      users_share_chat: {
        Args: {
          user_one: string
          user_two: string
        }
        Returns: boolean
      }
      verify_user_password: {
        Args: {
          password: string
        }
        Returns: boolean
      }
    }
    Enums: {
      commentstatus: "active" | "deleted"
      mediatype: "video" | "image"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

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
    : never
