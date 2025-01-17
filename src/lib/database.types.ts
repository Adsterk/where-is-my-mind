export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          id: string
          is_custom: boolean | null
          is_default: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          is_default?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          is_default?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      activity_entries: {
        Row: {
          activity_id: string
          created_at: string
          duration_minutes: number | null
          engagement_level: number | null
          id: string
          impact_rating: number | null
          mood_entry_id: string
          notes: string | null
        }
        Insert: {
          activity_id: string
          created_at?: string
          duration_minutes?: number | null
          engagement_level?: number | null
          id?: string
          impact_rating?: number | null
          mood_entry_id: string
          notes?: string | null
        }
        Update: {
          activity_id?: string
          created_at?: string
          duration_minutes?: number | null
          engagement_level?: number | null
          id?: string
          impact_rating?: number | null
          mood_entry_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_entries_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_entries_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_entries: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          mood_entry_id: string
          notes: string | null
          side_effects: string | null
          time_taken: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          mood_entry_id: string
          notes?: string | null
          side_effects?: string | null
          time_taken: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          mood_entry_id?: string
          notes?: string | null
          side_effects?: string | null
          time_taken?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_entries_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_entries_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          is_bipolar_scale: boolean | null
          language: string
          mood_score: number
          notes: string | null
          section_order: string[] | null
          sleep_hours: number | null
          sleep_quality: string | null
          timezone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_bipolar_scale?: boolean | null
          language?: string
          mood_score: number
          notes?: string | null
          section_order?: string[] | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          timezone: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_bipolar_scale?: boolean | null
          language?: string
          mood_score?: number
          notes?: string | null
          section_order?: string[] | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          timezone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      problematic_behavior_entries: {
        Row: {
          behavior_id: string
          created_at: string
          frequency_level: number | null
          id: string
          intensity_level: number | null
          mood_entry_id: string
          notes: string | null
          triggers: string | null
        }
        Insert: {
          behavior_id: string
          created_at?: string
          frequency_level?: number | null
          id?: string
          intensity_level?: number | null
          mood_entry_id: string
          notes?: string | null
          triggers?: string | null
        }
        Update: {
          behavior_id?: string
          created_at?: string
          frequency_level?: number | null
          id?: string
          intensity_level?: number | null
          mood_entry_id?: string
          notes?: string | null
          triggers?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "problematic_behavior_entries_behavior_id_fkey"
            columns: ["behavior_id"]
            isOneToOne: false
            referencedRelation: "problematic_behaviors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problematic_behavior_entries_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      problematic_behaviors: {
        Row: {
          created_at: string
          id: string
          is_custom: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          language: string
          theme: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          language?: string
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          language?: string
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_entries: {
        Row: {
          created_at: string
          effectiveness: number | null
          id: string
          mood_entry_id: string
          notes: string | null
          skill_id: string
        }
        Insert: {
          created_at?: string
          effectiveness?: number | null
          id?: string
          mood_entry_id: string
          notes?: string | null
          skill_id: string
        }
        Update: {
          created_at?: string
          effectiveness?: number | null
          id?: string
          mood_entry_id?: string
          notes?: string | null
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_entries_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_entries_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          is_custom: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      social_connection_entries: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          impact_on_wellbeing: number | null
          mood_entry_id: string
          notes: string | null
          quality_rating: number | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          impact_on_wellbeing?: number | null
          mood_entry_id: string
          notes?: string | null
          quality_rating?: number | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          impact_on_wellbeing?: number | null
          mood_entry_id?: string
          notes?: string | null
          quality_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_connection_entries_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_connection_entries_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          created_at: string
          id: string
          is_custom: boolean | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      spiritual_practice_entries: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          impact_rating: number | null
          mood_entry_id: string
          notes: string | null
          practice_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          impact_rating?: number | null
          mood_entry_id: string
          notes?: string | null
          practice_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          impact_rating?: number | null
          mood_entry_id?: string
          notes?: string | null
          practice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_practice_entries_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spiritual_practice_entries_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "spiritual_practices"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_practices: {
        Row: {
          created_at: string
          id: string
          is_custom: boolean | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          form_sections: Json | null
          id: string
          updated_at: string
          use_bipolar_scale: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          form_sections?: Json | null
          id?: string
          updated_at?: string
          use_bipolar_scale?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          form_sections?: Json | null
          id?: string
          updated_at?: string
          use_bipolar_scale?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          data_retention_days: number | null
          notification_email: boolean
          notification_push: boolean
          reminder_days: number[] | null
          reminder_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_retention_days?: number | null
          notification_email?: boolean
          notification_push?: boolean
          reminder_days?: number[] | null
          reminder_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_retention_days?: number | null
          notification_email?: boolean
          notification_push?: boolean
          reminder_days?: number[] | null
          reminder_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

