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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          language: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood_score: number
          notes: string | null
          created_at: string
          timezone: string
          language: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_score: number
          notes?: string | null
          created_at?: string
          timezone: string
          language?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_score?: number
          notes?: string | null
          created_at?: string
          timezone?: string
          language?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          notification_email: boolean
          notification_push: boolean
          reminder_time: string | null
          reminder_days: number[]
          data_retention_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          notification_email?: boolean
          notification_push?: boolean
          reminder_time?: string | null
          reminder_days?: number[]
          data_retention_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          notification_email?: boolean
          notification_push?: boolean
          reminder_time?: string | null
          reminder_days?: number[]
          data_retention_days?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 