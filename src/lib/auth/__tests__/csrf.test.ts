import { NextRequest } from 'next/server'
import { generateToken, validateCSRFToken } from '../csrf'

// Mock the cookies API
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

describe('CSRF Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateToken', () => {
    it('generates a 64-character hex string', () => {
      const token = generateToken()
      expect(token).toMatch(/^[a-f0-9]{64}$/)
    })

    it('generates unique tokens', () => {
      const token1 = generateToken()
      const token2 = generateToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('validateCSRFToken', () => {
    it('returns false when cookie token is missing', () => {
      const mockRequest = {
        headers: {
          get: () => 'valid-token',
        },
      } as unknown as NextRequest

      const result = validateCSRFToken(mockRequest)
      expect(result).toBe(false)
    })

    it('returns false when header token is missing', () => {
      const mockRequest = {
        headers: {
          get: () => null,
        },
      } as unknown as NextRequest

      const result = validateCSRFToken(mockRequest)
      expect(result).toBe(false)
    })

    it('returns false when tokens do not match', () => {
      jest.requireMock('next/headers').cookies.mockImplementation(() => ({
        get: () => ({ value: 'token1' }),
      }))

      const mockRequest = {
        headers: {
          get: () => 'token2',
        },
      } as unknown as NextRequest

      const result = validateCSRFToken(mockRequest)
      expect(result).toBe(false)
    })

    it('returns true when tokens match', () => {
      const token = 'valid-token'
      jest.requireMock('next/headers').cookies.mockImplementation(() => ({
        get: () => ({ value: token }),
      }))

      const mockRequest = {
        headers: {
          get: () => token,
        },
      } as unknown as NextRequest

      const result = validateCSRFToken(mockRequest)
      expect(result).toBe(true)
    })
  })
}) 