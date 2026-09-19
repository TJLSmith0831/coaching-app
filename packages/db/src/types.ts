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
      availability: {
        Row: {
          child_id: string
          created_at: string
          minutes_by_dow: number[]
          reminder_time: string
        }
        Insert: {
          child_id: string
          created_at?: string
          minutes_by_dow?: number[]
          reminder_time?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          minutes_by_dow?: number[]
          reminder_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_equipment: {
        Row: {
          child_id: string
          created_at: string
          equipment_type_id: string
          source: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          equipment_type_id: string
          source?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          equipment_type_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_equipment_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_progress: {
        Row: {
          child_id: string
          created_at: string
          progress: Json
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          progress: Json
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          progress?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_sports: {
        Row: {
          child_id: string
          created_at: string
          goal_track_ids: string[]
          is_focus: boolean
          level: string | null
          position_ids: string[]
          sport_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          goal_track_ids?: string[]
          is_focus?: boolean
          level?: string | null
          position_ids?: string[]
          sport_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          goal_track_ids?: string[]
          is_focus?: boolean
          level?: string | null
          position_ids?: string[]
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_sports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          avatar: Json
          birth_month: number | null
          birth_year: number | null
          created_at: string
          daily_goal_xp: number
          deleted_at: string | null
          difficulty_cap: number
          id: string
          nickname: string
          parent_id: string
          pin_attempt_at: string | null
          pin_attempts: number
          pin_hash: string | null
          settings: Json
        }
        Insert: {
          avatar?: Json
          birth_month?: number | null
          birth_year?: number | null
          created_at?: string
          daily_goal_xp?: number
          deleted_at?: string | null
          difficulty_cap?: number
          id?: string
          nickname: string
          parent_id: string
          pin_attempt_at?: string | null
          pin_attempts?: number
          pin_hash?: string | null
          settings?: Json
        }
        Update: {
          avatar?: Json
          birth_month?: number | null
          birth_year?: number | null
          created_at?: string
          daily_goal_xp?: number
          deleted_at?: string | null
          difficulty_cap?: number
          id?: string
          nickname?: string
          parent_id?: string
          pin_attempt_at?: string | null
          pin_attempts?: number
          pin_hash?: string | null
          settings?: Json
        }
        Relationships: []
      }
      parent_checkins: {
        Row: {
          child_id: string
          created_at: string
          day: string
          id: string
          kind: string
          parent_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          day: string
          id?: string
          kind: string
          parent_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          day?: string
          id?: string
          kind?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_checkins_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          consent_version: string | null
          consented_at: string | null
          created_at: string
          first_name: string | null
          id: string
          settings: Json
          timezone: string | null
        }
        Insert: {
          consent_version?: string | null
          consented_at?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          settings?: Json
          timezone?: string | null
        }
        Update: {
          consent_version?: string | null
          consented_at?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          settings?: Json
          timezone?: string | null
        }
        Relationships: []
      }
      reward_claims: {
        Row: {
          child_id: string
          claimed_at: string
          created_at: string
          id: string
          resolved_at: string | null
          reward_id: string
          status: string
        }
        Insert: {
          child_id: string
          claimed_at?: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          reward_id: string
          status?: string
        }
        Update: {
          child_id?: string
          claimed_at?: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          reward_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_claims_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          child_id: string | null
          cost_xp: number | null
          created_at: string
          id: string
          milestone: Json | null
          parent_id: string
          title: string
        }
        Insert: {
          active?: boolean
          child_id?: string | null
          cost_xp?: number | null
          created_at?: string
          id?: string
          milestone?: Json | null
          parent_id: string
          title: string
        }
        Update: {
          active?: boolean
          child_id?: string | null
          cost_xp?: number | null
          created_at?: string
          id?: string
          milestone?: Json | null
          parent_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string
          id: string
          level: number | null
          planned_drill_ids: string[]
          results: Json | null
          sport_id: string | null
          spot_id: string | null
          stars: number | null
          started_at: string | null
          time_budget_sec: number | null
          unit: number | null
          xp_earned: number | null
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string
          id: string
          level?: number | null
          planned_drill_ids?: string[]
          results?: Json | null
          sport_id?: string | null
          spot_id?: string | null
          stars?: number | null
          started_at?: string | null
          time_budget_sec?: number | null
          unit?: number | null
          xp_earned?: number | null
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: number | null
          planned_drill_ids?: string[]
          results?: Json | null
          sport_id?: string | null
          spot_id?: string | null
          stars?: number | null
          started_at?: string | null
          time_budget_sec?: number | null
          unit?: number | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spots: {
        Row: {
          child_id: string
          confidence: number | null
          created_at: string
          fixtures: string[]
          id: string
          is_favorite: boolean
          label: string | null
          photo_path: string | null
          space: string | null
          surface: string | null
        }
        Insert: {
          child_id: string
          confidence?: number | null
          created_at?: string
          fixtures?: string[]
          id?: string
          is_favorite?: boolean
          label?: string | null
          photo_path?: string | null
          space?: string | null
          surface?: string | null
        }
        Update: {
          child_id?: string
          confidence?: number | null
          created_at?: string
          fixtures?: string[]
          id?: string
          is_favorite?: boolean
          label?: string | null
          photo_path?: string | null
          space?: string | null
          surface?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spots_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
