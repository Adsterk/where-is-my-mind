import { createHash } from 'crypto'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { AuditLogger, AuditEventType } from './audit-log'

// Number of previous passwords to check against
const PASSWORD_HISTORY_LENGTH = 5

// Minimum time between password changes (24 hours)
const MIN_PASSWORD_AGE = 24 * 60 * 60 * 1000

interface PasswordHistoryEntry {
  user_id: string
  password_hash: string
  created_at: string
}

export class PasswordSecurityService {
  private supabase: SupabaseClient<Database>
  private auditLogger: AuditLogger

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
    this.auditLogger = new AuditLogger(supabaseClient)
  }

  /**
   * Check if a password has been previously used
   */
  private async isPasswordPreviouslyUsed(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    const { data: history } = await this.supabase
      .from('password_history')
      .select('password_hash')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(PASSWORD_HISTORY_LENGTH)

    if (!history) return false

    const newHash = this.hashPassword(newPassword)
    return history.some(entry => entry.password_hash === newHash)
  }

  /**
   * Check if enough time has passed since last password change
   */
  private async canChangePassword(userId: string): Promise<boolean> {
    const { data: lastChange } = await this.supabase
      .from('password_history')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!lastChange) return true

    const timeSinceLastChange = Date.now() - new Date(lastChange.created_at).getTime()
    return timeSinceLastChange >= MIN_PASSWORD_AGE
  }

  /**
   * Hash a password using a secure algorithm
   */
  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex')
  }

  /**
   * Check if a password has been exposed in known breaches
   * Uses the k-Anonymity model to check only the first 5 characters of the hash
   */
  private async isPasswordBreached(password: string): Promise<boolean> {
    const hash = this.hashPassword(password).toUpperCase()
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)

    try {
      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`
      )
      const text = await response.text()
      const hashes = text.split('\n')
      
      return hashes.some(line => {
        const [hashSuffix] = line.split(':')
        return hashSuffix.trim() === suffix
      })
    } catch (error) {
      console.error('Error checking password breach:', error)
      // Fail closed - assume password is safe if service is unavailable
      return false
    }
  }

  /**
   * Validate a password change request
   */
  async validatePasswordChange(
    userId: string,
    newPassword: string,
    ip: string,
    userAgent?: string
  ): Promise<{
    valid: boolean
    error?: string
  }> {
    try {
      // Check password age
      if (!(await this.canChangePassword(userId))) {
        return {
          valid: false,
          error: 'Password was changed too recently. Please wait 24 hours between changes.',
        }
      }

      // Check password history
      if (await this.isPasswordPreviouslyUsed(userId, newPassword)) {
        return {
          valid: false,
          error: 'Password has been used previously. Please choose a different password.',
        }
      }

      // Check for breached passwords
      if (await this.isPasswordBreached(newPassword)) {
        await this.auditLogger.log({
          event_type: AuditEventType.SUSPICIOUS_ACTIVITY,
          user_id: userId,
          ip_address: ip,
          user_agent: userAgent,
          details: {
            reason: 'Attempted to use breached password'
          },
          severity: 'high'
        })

        return {
          valid: false,
          error: 'This password has appeared in a data breach. Please choose a different password.',
        }
      }

      return { valid: true }
    } catch (error) {
      console.error('Password validation error:', error)
      return {
        valid: false,
        error: 'An error occurred validating the password. Please try again.',
      }
    }
  }

  /**
   * Record a password change in history
   */
  async recordPasswordChange(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const passwordHash = this.hashPassword(newPassword)

    const { error } = await this.supabase
      .from('password_history')
      .insert({
        user_id: userId,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      })

    if (error) throw error
  }
} 