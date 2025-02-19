import { createHmac, randomBytes } from 'crypto'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { AuditLogger, AuditEventType } from './audit-log'

interface APIKey {
  id: string
  name: string
  key: string
  secret: string
  user_id: string
  scopes: string[]
  expires_at?: string
  created_at: string
  last_used_at?: string
}

interface SignedRequest {
  timestamp: number
  signature: string
  apiKeyId: string
}

export class APISecurityService {
  private supabase: SupabaseClient<Database>
  private auditLogger: AuditLogger

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
    this.auditLogger = new AuditLogger(supabaseClient)
  }

  /**
   * Generate a new API key pair
   */
  async generateAPIKey(
    userId: string,
    name: string,
    scopes: string[],
    expiresIn?: number
  ): Promise<{
    apiKey: string
    apiSecret: string
  }> {
    const apiKey = `wim_${randomBytes(16).toString('hex')}`
    const apiSecret = randomBytes(32).toString('hex')

    const { error } = await this.supabase
      .from('api_keys')
      .insert({
        name,
        key: apiKey,
        secret: this.hashSecret(apiSecret),
        user_id: userId,
        scopes,
        expires_at: expiresIn ? new Date(Date.now() + expiresIn).toISOString() : null,
      })

    if (error) throw error

    await this.auditLogger.log({
      event_type: AuditEventType.API_KEY_CREATED,
      user_id: userId,
      details: { name, scopes },
      severity: 'medium',
      ip_address: '0.0.0.0', // This should be passed in from the request
    })

    // Only return the secret once - it cannot be retrieved later
    return {
      apiKey,
      apiSecret,
    }
  }

  /**
   * Validate an API key
   */
  async validateAPIKey(
    apiKey: string,
    requiredScopes: string[] = []
  ): Promise<{
    valid: boolean
    userId?: string
    error?: string
  }> {
    const { data: key, error } = await this.supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single()

    if (error || !key) {
      return {
        valid: false,
        error: 'Invalid API key',
      }
    }

    // Check if key is expired
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return {
        valid: false,
        error: 'API key has expired',
      }
    }

    // Check if key has required scopes
    if (requiredScopes.length > 0) {
      const hasRequiredScopes = requiredScopes.every(
        scope => key.scopes.includes(scope)
      )
      if (!hasRequiredScopes) {
        return {
          valid: false,
          error: 'Insufficient permissions',
        }
      }
    }

    // Update last used timestamp
    await this.supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', key.id)

    return {
      valid: true,
      userId: key.user_id,
    }
  }

  /**
   * Sign a request
   */
  signRequest(
    apiKey: string,
    apiSecret: string,
    method: string,
    path: string,
    body?: any
  ): SignedRequest {
    const timestamp = Date.now()
    const payload = this.createSignaturePayload(method, path, timestamp, body)
    const signature = this.createSignature(payload, apiSecret)

    return {
      timestamp,
      signature,
      apiKeyId: apiKey,
    }
  }

  /**
   * Verify a signed request
   */
  async verifySignedRequest(
    method: string,
    path: string,
    body: any,
    auth: SignedRequest
  ): Promise<boolean> {
    try {
      // Get API key record
      const { data: key } = await this.supabase
        .from('api_keys')
        .select('secret')
        .eq('key', auth.apiKeyId)
        .single()

      if (!key) return false

      // Verify timestamp is within 5 minutes
      const timeDiff = Math.abs(Date.now() - auth.timestamp)
      if (timeDiff > 5 * 60 * 1000) return false

      // Verify signature
      const payload = this.createSignaturePayload(method, path, auth.timestamp, body)
      const expectedSignature = this.createSignature(payload, key.secret)

      return auth.signature === expectedSignature

    } catch (error) {
      console.error('Error verifying signed request:', error)
      return false
    }
  }

  /**
   * Revoke an API key
   */
  async revokeAPIKey(userId: string, apiKey: string): Promise<void> {
    const { error } = await this.supabase
      .from('api_keys')
      .delete()
      .match({ user_id: userId, key: apiKey })

    if (error) throw error

    await this.auditLogger.log({
      event_type: AuditEventType.API_KEY_REVOKED,
      user_id: userId,
      details: { api_key: apiKey },
      severity: 'medium',
      ip_address: '0.0.0.0', // This should be passed in from the request
    })
  }

  private hashSecret(secret: string): string {
    return createHmac('sha256', process.env.API_SECRET_SALT!)
      .update(secret)
      .digest('hex')
  }

  private createSignaturePayload(
    method: string,
    path: string,
    timestamp: number,
    body?: any
  ): string {
    const parts = [
      method.toUpperCase(),
      path,
      timestamp,
    ]

    if (body) {
      parts.push(typeof body === 'string' ? body : JSON.stringify(body))
    }

    return parts.join('|')
  }

  private createSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
  }
} 