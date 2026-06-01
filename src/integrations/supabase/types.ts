export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alumni: {
        Row: {
          added_by: string | null
          contact: string | null
          created_at: string
          full_name: string
          graduation_year: number | null
          id: string
          notes: string | null
        }
        Insert: {
          added_by?: string | null
          contact?: string | null
          created_at?: string
          full_name: string
          graduation_year?: number | null
          id?: string
          notes?: string | null
        }
        Update: {
          added_by?: string | null
          contact?: string | null
          created_at?: string
          full_name?: string
          graduation_year?: number | null
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      chapter_profile: {
        Row: {
          about: string | null
          contact_email: string | null
          contact_phone: string | null
          id: string
          logo_url: string | null
          motto: string | null
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          about?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          id?: string
          logo_url?: string | null
          motto?: string | null
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          about?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          id?: string
          logo_url?: string | null
          motto?: string | null
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          created_at: string
          details: string
          id: string
          read_at: string | null
          status: string
          subject: string
          submitter_id: string
        }
        Insert: {
          category: string
          created_at?: string
          details: string
          id?: string
          read_at?: string | null
          status?: string
          subject: string
          submitter_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string
          id?: string
          read_at?: string | null
          status?: string
          subject?: string
          submitter_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          photo_url: string | null
          starts_at: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          photo_url?: string | null
          starts_at: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          photo_url?: string | null
          starts_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      events_attended: {
        Row: {
          created_at: string
          event_date: string
          id: string
          notes: string | null
          profile_id: string
          title: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          notes?: string | null
          profile_id: string
          title: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          notes?: string | null
          profile_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_attended_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          notes: string | null
          period: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          period?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          period?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      meeting_reports: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          meeting_date: string
          notes: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          meeting_date: string
          notes?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          meeting_date?: string
          notes?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      mentor_assignments: {
        Row: {
          assigned_by: string | null
          assigned_until: string | null
          created_at: string
          id: string
          profile_id: string
          school: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_until?: string | null
          created_at?: string
          id?: string
          profile_id: string
          school: string
        }
        Update: {
          assigned_by?: string | null
          assigned_until?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          school?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_activities: {
        Row: {
          activity_date: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          activity_date: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          activity_date?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          course: string | null
          created_at: string
          email: string | null
          email_opt_in: boolean
          full_name: string
          id: string
          mentoring_school: string | null
          phone: string | null
          scholar_code: string
          updated_at: string
          year: number | null
        }
        Insert: {
          avatar_url?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          email_opt_in?: boolean
          full_name?: string
          id: string
          mentoring_school?: string | null
          phone?: string | null
          scholar_code: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          avatar_url?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          email_opt_in?: boolean
          full_name?: string
          id?: string
          mentoring_school?: string | null
          phone?: string | null
          scholar_code?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_permissions: { Args: never; Returns: string[] }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      notify_all_members: {
        Args: { _body: string; _link: string; _title: string; _type: string }
        Returns: undefined
      }
      notify_users_with_permission: {
        Args: {
          _body: string
          _link: string
          _permission: string
          _title: string
          _type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "member"
        | "president"
        | "vice_president"
        | "treasurer"
        | "event_manager"
        | "comm_officer_y1"
        | "comm_officer_y2"
        | "comm_officer_y3"
        | "comm_officer_y4"
        | "secretary_general"
        | "assistant_secretary"
        | "alumni_manager"
        | "mentorship_coordinator"
        | "welfare_coordinator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "member",
        "president",
        "vice_president",
        "treasurer",
        "event_manager",
        "comm_officer_y1",
        "comm_officer_y2",
        "comm_officer_y3",
        "comm_officer_y4",
        "secretary_general",
        "assistant_secretary",
        "alumni_manager",
        "mentorship_coordinator",
        "welfare_coordinator",
      ],
    },
  },
} as const
