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
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_entries: {
        Row: {
          activity_id: string | null
          created_at: string
          duration_minutes: number
          engagement_level: number | null
          id: string
          impact_rating: number | null
          is_draft: boolean | null
          mood_entry_id: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          duration_minutes: number
          engagement_level?: number | null
          id?: string
          impact_rating?: number | null
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          duration_minutes?: number
          engagement_level?: number | null
          id?: string
          impact_rating?: number | null
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          user_id?: string
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
      behavior_entries: {
        Row: {
          behavior_id: string | null
          created_at: string
          id: string
          intensity: number | null
          is_draft: boolean | null
          mood_entry_id: string | null
          notes: string | null
          triggers: string | null
          user_id: string
        }
        Insert: {
          behavior_id?: string | null
          created_at?: string
          id?: string
          intensity?: number | null
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          triggers?: string | null
          user_id: string
        }
        Update: {
          behavior_id?: string | null
          created_at?: string
          id?: string
          intensity?: number | null
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          triggers?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_entries_behavior_id_fkey"
            columns: ["behavior_id"]
            isOneToOne: false
            referencedRelation: "problematic_behaviors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_entries_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      form_section_preferences: {
        Row: {
          created_at: string | null
          id: string
          is_visible: boolean | null
          position: number
          section_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position: number
          section_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
          section_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medication_entries: {
        Row: {
          created_at: string
          id: string
          is_draft: boolean | null
          medication_id: string | null
          mood_entry_id: string | null
          notes: string | null
          side_effects: string | null
          time_taken: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_draft?: boolean | null
          medication_id?: string | null
          mood_entry_id?: string | null
          notes?: string | null
          side_effects?: string | null
          time_taken: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_draft?: boolean | null
          medication_id?: string | null
          mood_entry_id?: string | null
          notes?: string | null
          side_effects?: string | null
          time_taken?: string
          user_id?: string
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
          is_custom: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          id?: string
          is_custom?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          edit_history: Json[] | null
          id: string
          is_bipolar_scale: boolean | null
          last_edited_at: string | null
          mood_score: number
          notes: string | null
          section_order: string[] | null
          sleep_hours: number | null
          sleep_quality: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          edit_history?: Json[] | null
          id?: string
          is_bipolar_scale?: boolean | null
          last_edited_at?: string | null
          mood_score: number
          notes?: string | null
          section_order?: string[] | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          edit_history?: Json[] | null
          id?: string
          is_bipolar_scale?: boolean | null
          last_edited_at?: string | null
          mood_score?: number
          notes?: string | null
          section_order?: string[] | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      problematic_behaviors: {
        Row: {
          created_at: string
          id: string
          is_custom: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string
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
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_entries: {
        Row: {
          created_at: string
          difficulty: number | null
          effectiveness: number | null
          id: string
          is_draft: boolean | null
          mood_entry_id: string | null
          notes: string | null
          skill_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          effectiveness?: number | null
          id?: string
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          skill_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          effectiveness?: number | null
          id?: string
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          skill_id?: string | null
          user_id?: string
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
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      social_connection_entries: {
        Row: {
          connection_id: string | null
          created_at: string
          id: string
          impact_rating: number | null
          is_draft: boolean | null
          mood_entry_id: string | null
          notes: string | null
          quality_rating: number | null
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          id?: string
          impact_rating?: number | null
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          quality_rating?: number | null
          user_id: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          id?: string
          impact_rating?: number | null
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          quality_rating?: number | null
          user_id?: string
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
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      spiritual_practice_entries: {
        Row: {
          created_at: string
          duration_minutes: number
          fulfillment_rating: number | null
          id: string
          is_draft: boolean | null
          mood_entry_id: string | null
          notes: string | null
          practice_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          fulfillment_rating?: number | null
          id?: string
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          practice_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          fulfillment_rating?: number | null
          id?: string
          is_draft?: boolean | null
          mood_entry_id?: string | null
          notes?: string | null
          practice_id?: string | null
          user_id?: string
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
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          form_sections: Json | null
          id: string
          last_sign_in: string | null
          notification_enabled: boolean
          reminder_days: string[] | null
          reminder_time: string | null
          section_order: string[] | null
          sign_in_count: number | null
          theme: string
          updated_at: string
          use_bipolar_scale: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          form_sections?: Json | null
          id?: string
          last_sign_in?: string | null
          notification_enabled?: boolean
          reminder_days?: string[] | null
          reminder_time?: string | null
          section_order?: string[] | null
          sign_in_count?: number | null
          theme?: string
          updated_at?: string
          use_bipolar_scale?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          form_sections?: Json | null
          id?: string
          last_sign_in?: string | null
          notification_enabled?: boolean
          reminder_days?: string[] | null
          reminder_time?: string | null
          section_order?: string[] | null
          sign_in_count?: number | null
          theme?: string
          updated_at?: string
          use_bipolar_scale?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_draft_entries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_table_info: {
        Args: {
          table_name: string
        }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
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

