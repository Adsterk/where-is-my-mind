import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // Session events
  SESSION_START = 'SESSION_START',
  SESSION_REFRESH = 'SESSION_REFRESH',
  SESSION_EXPIRE = 'SESSION_EXPIRE',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // Data access events
  DATA_EXPORT = 'DATA_EXPORT',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  ACCOUNT_DELETE = 'ACCOUNT_DELETE',

  // API events
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  API_REQUEST_INVALID = 'API_REQUEST_INVALID'
}

export interface AuditLogEntry {
  event_type: AuditEventType
  user_id?: string
  ip_address: string
  user_agent?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high'
  created_at?: string
}

export class AuditLogger {
  private supabase: SupabaseClient<Database>
  
  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
  }
  
  async log(entry: Omit<AuditLogEntry, 'created_at'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('audit_logs')
        .insert([{
          ...entry,
          created_at: new Date().toISOString(),
        }])
      
      if (error) throw error
      
      // For high severity events, we might want to trigger additional actions
      if (entry.severity === 'high') {
        await this.handleHighSeverityEvent(entry)
      }
      
    } catch (error) {
      console.error('Failed to write audit log:', error)
      // Implement fallback logging mechanism (e.g., write to file)
      this.fallbackLog(entry)
    }
  }
  
  private async handleHighSeverityEvent(entry: AuditLogEntry): Promise<void> {
    // Implement additional handling for high severity events
    // For example: Send notifications, trigger security measures, etc.
    console.warn('High severity audit event:', entry)
  }
  
  private fallbackLog(entry: AuditLogEntry): void {
    // Implement fallback logging mechanism
    // This could write to a local file or another backup storage
    console.error('Audit log fallback:', entry)
  }
  
  async query(options: {
    startDate?: Date
    endDate?: Date
    eventTypes?: AuditEventType[]
    userId?: string
    severity?: AuditLogEntry['severity']
    limit?: number
    offset?: number
  }): Promise<{
    logs: AuditLogEntry[]
    count: number
  }> {
    let query = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
    
    if (options.startDate) {
      query = query.gte('created_at', options.startDate.toISOString())
    }
    
    if (options.endDate) {
      query = query.lte('created_at', options.endDate.toISOString())
    }
    
    if (options.eventTypes?.length) {
      query = query.in('event_type', options.eventTypes)
    }
    
    if (options.userId) {
      query = query.eq('user_id', options.userId)
    }
    
    if (options.severity) {
      query = query.eq('severity', options.severity)
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }
    
    const { data, error, count } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    
    return {
      logs: data || [],
      count: count || 0,
    }
  }
} 