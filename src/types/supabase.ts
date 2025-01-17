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
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood_score: number
          notes: string | null
          is_bipolar_scale: boolean
          created_at: string
          updated_at: string
          last_edited_at: string | null
          edit_history: Json[]
          section_order: string[]
        }
        Insert: {
          id?: string
          user_id: string
          mood_score: number
          notes?: string | null
          is_bipolar_scale?: boolean
          created_at?: string
          updated_at?: string
          last_edited_at?: string | null
          edit_history?: Json[]
          section_order?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          mood_score?: number
          notes?: string | null
          is_bipolar_scale?: boolean
          created_at?: string
          updated_at?: string
          last_edited_at?: string | null
          edit_history?: Json[]
          section_order?: string[]
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          use_bipolar_scale: boolean
          created_at: string
          updated_at: string
          form_sections: Json
          section_order: string[]
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          use_bipolar_scale?: boolean
          created_at?: string
          updated_at?: string
          form_sections?: Json
          section_order?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          use_bipolar_scale?: boolean
          created_at?: string
          updated_at?: string
          form_sections?: Json
          section_order?: string[]
        }
      }
    }
  }
} 