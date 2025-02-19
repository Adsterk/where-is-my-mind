import { NextResponse } from 'next/server'
import { AuditLogger } from '@/lib/auth/audit-log'
import { AppError, ErrorCode, ErrorResponse } from './types'

export class ErrorHandler {
  private auditLogger: AuditLogger

  constructor(auditLogger: AuditLogger) {
    this.auditLogger = auditLogger
  }

  /**
   * Handle and format an error for response
   */
  async handleError(error: Error | AppError, requestInfo?: {
    url?: string
    method?: string
    ip?: string
    userAgent?: string
    userId?: string
  }): Promise<NextResponse> {
    const appError = this.normalizeError(error)
    
    // Log error details
    console.error('Error:', {
      code: appError.code,
      message: appError.message,
      stack: appError.stack,
      context: appError.context,
    })

    // Log to audit trail if it's a security-related error
    if (appError.auditEvent) {
      await this.auditLogger.log({
        event_type: appError.auditEvent,
        user_id: requestInfo?.userId,
        ip_address: requestInfo?.ip || '0.0.0.0',
        user_agent: requestInfo?.userAgent,
        details: {
          error_code: appError.code,
          url: requestInfo?.url,
          method: requestInfo?.method,
          ...appError.context,
        },
        severity: appError.severity,
      })
    }

    // Format error response
    const response: ErrorResponse = {
      error: {
        code: appError.code,
        message: this.getSafeErrorMessage(appError),
        details: appError.context,
      },
    }

    return new NextResponse(
      JSON.stringify(response),
      {
        status: appError.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  /**
   * Convert any error to an AppError
   */
  private normalizeError(error: Error | AppError): AppError {
    if (this.isAppError(error)) {
      return error
    }

    // Convert unknown error to AppError
    return {
      name: 'InternalServerError',
      message: 'An unexpected error occurred',
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: 500,
      severity: 'high',
      isOperational: false,
      stack: error.stack,
    }
  }

  /**
   * Get a safe error message that won't leak sensitive info
   */
  private getSafeErrorMessage(error: AppError): string {
    // For non-operational errors (bugs/crashes), return generic message
    if (!error.isOperational) {
      return 'An unexpected error occurred'
    }

    // For validation/auth errors, return actual message
    if (
      error.code.startsWith('AUTH_') ||
      error.code.startsWith('VALIDATION_')
    ) {
      return error.message
    }

    // For other errors, return generic message based on code
    switch (error.code) {
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return 'Too many requests, please try again later'
      case ErrorCode.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable'
      default:
        return 'An error occurred while processing your request'
    }
  }

  private isAppError(error: Error | AppError): error is AppError {
    return 'code' in error && 'statusCode' in error
  }
} 