import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  moodEntrySchema,
  validateAndSanitizeInput,
} from './validation'

// Map routes to their validation schemas
const routeSchemas: Record<string, z.ZodType> = {
  '/api/auth/login': loginSchema,
  '/api/auth/register': registerSchema,
  '/api/auth/reset-password': resetPasswordSchema,
  '/api/auth/update-password': updatePasswordSchema,
  '/api/entries/mood': moodEntrySchema,
}

export async function validateRequest(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname

  // Skip validation for GET requests and routes without schemas
  if (request.method === 'GET' || !routeSchemas[pathname]) {
    return null
  }

  try {
    // Parse request body
    const body = await request.json()

    // Get schema for route
    const schema = routeSchemas[pathname]

    // Validate and sanitize input
    const result = await validateAndSanitizeInput(schema, body)

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: result.error || 'Invalid request data',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Clone request with validated data
    const validatedRequest = new NextRequest(request.url, {
      ...request,
      body: JSON.stringify(result.data),
    })

    // Continue with validated request
    return NextResponse.next({
      request: validatedRequest,
    })

  } catch (error) {
    console.error('Request validation error:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Invalid request format',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 