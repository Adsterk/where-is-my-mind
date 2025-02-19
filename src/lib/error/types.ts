import { AuditEventType } from '@/lib/auth/audit-log'

export enum ErrorCode {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  
  // Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Security Errors
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // API Errors
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_SIGNATURE_INVALID = 'API_SIGNATURE_INVALID',
  
  // Database Errors
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface AppError extends Error {
  code: ErrorCode
  statusCode: number
  auditEvent?: AuditEventType
  severity: 'low' | 'medium' | 'high'
  context?: Record<string, any>
  isOperational?: boolean
}

export interface ErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, any>
  }
}

export interface ValidationErrorDetails {
  field: string
  message: string
  code: string
}

export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: ErrorCode.VALIDATION_FAILED
    message: string
    details: {
      errors: ValidationErrorDetails[]
    }
  }
} 