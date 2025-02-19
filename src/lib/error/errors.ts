import { AuditEventType } from '@/lib/auth/audit-log'
import { AppError, ErrorCode, ValidationErrorDetails } from './types'

export class AuthenticationError implements AppError {
  name = 'AuthenticationError'
  code: ErrorCode
  message: string
  statusCode: number
  severity: 'low' | 'medium' | 'high'
  auditEvent: AuditEventType
  context?: Record<string, any>
  isOperational = true
  stack?: string

  constructor(
    code: ErrorCode.AUTH_INVALID_CREDENTIALS | ErrorCode.AUTH_SESSION_EXPIRED,
    message: string,
    context?: Record<string, any>
  ) {
    this.code = code
    this.message = message
    this.statusCode = 401
    this.severity = 'medium'
    this.auditEvent = AuditEventType.LOGIN_FAILURE
    this.context = context
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthorizationError implements AppError {
  name = 'AuthorizationError'
  code = ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS
  message: string
  statusCode = 403
  severity: 'medium' | 'high'
  auditEvent = AuditEventType.SUSPICIOUS_ACTIVITY
  context?: Record<string, any>
  isOperational = true
  stack?: string

  constructor(message: string, severity: 'medium' | 'high' = 'medium', context?: Record<string, any>) {
    this.message = message
    this.severity = severity
    this.context = context
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError implements AppError {
  name = 'ValidationError'
  code = ErrorCode.VALIDATION_FAILED
  message: string
  statusCode = 400
  severity: 'low' = 'low'
  context: { errors: ValidationErrorDetails[] }
  isOperational = true
  stack?: string

  constructor(errors: ValidationErrorDetails[]) {
    this.message = 'Validation failed'
    this.context = { errors }
    Error.captureStackTrace(this, this.constructor)
  }
}

export class SecurityError implements AppError {
  name = 'SecurityError'
  code: ErrorCode
  message: string
  statusCode: number
  severity: 'medium' | 'high'
  auditEvent: AuditEventType
  context?: Record<string, any>
  isOperational = true
  stack?: string

  constructor(
    code: ErrorCode.CSRF_TOKEN_INVALID | ErrorCode.RATE_LIMIT_EXCEEDED | ErrorCode.API_KEY_INVALID,
    message: string,
    severity: 'medium' | 'high' = 'medium',
    context?: Record<string, any>
  ) {
    this.code = code
    this.message = message
    this.statusCode = code === ErrorCode.RATE_LIMIT_EXCEEDED ? 429 : 403
    this.severity = severity
    this.auditEvent = AuditEventType.SUSPICIOUS_ACTIVITY
    this.context = context
    Error.captureStackTrace(this, this.constructor)
  }
}

export class DatabaseError implements AppError {
  name = 'DatabaseError'
  code: ErrorCode
  message: string
  statusCode = 500
  severity: 'high' = 'high'
  context?: Record<string, any>
  isOperational = false
  stack?: string

  constructor(
    code: ErrorCode.DB_CONNECTION_ERROR | ErrorCode.DB_QUERY_ERROR,
    message: string,
    context?: Record<string, any>
  ) {
    this.code = code
    this.message = message
    this.context = context
    Error.captureStackTrace(this, this.constructor)
  }
} 