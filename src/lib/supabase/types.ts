export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          id: string
          theme_preference: string
          language: string
          timezone: string
          form_layout: Json
          draft_data: Json
          draft_last_accessed: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          theme_preference?: string
          language?: string
          timezone?: string
          form_layout?: Json
          draft_data?: Json
          draft_last_accessed?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme_preference?: string
          language?: string
          timezone?: string
          form_layout?: Json
          draft_data?: Json
          draft_last_accessed?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      form_sections: {
        Row: {
          id: string
          name: string
          type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'self-care'
          default_order: number
          is_required: boolean
          is_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'self-care'
          default_order: number
          is_required?: boolean
          is_visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'self-care'
          default_order?: number
          is_required?: boolean
          is_visible?: boolean
          created_at?: string
        }
      }
      user_sections: {
        Row: {
          id: string
          user_id: string
          section_id: string
          display_order: number
          is_visible: boolean
        }
        Insert: {
          id?: string
          user_id: string
          section_id: string
          display_order: number
          is_visible?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          section_id?: string
          display_order?: number
          is_visible?: boolean
        }
      }
      tracking_items: {
        Row: {
          id: string
          user_id: string
          section_id: string
          name: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          section_id: string
          name: string
          is_active?: boolean
          display_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          section_id?: string
          name?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      daily_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          mood_score: number | null
          is_bipolar: boolean
          sleep_hours: number | null
          tracking_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood_score?: number | null
          is_bipolar?: boolean
          sleep_hours?: number | null
          tracking_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood_score?: number | null
          is_bipolar?: boolean
          sleep_hours?: number | null
          tracking_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      clean_old_drafts: {
        Args: {
          older_than?: string
        }
        Returns: number
      }
      clean_user_drafts: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      section_type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'self-care'
    }
  }
}
