// Constants for CSRF handling
const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_HEADER = 'X-CSRF-Token'

/**
 * Client-side CSRF manager
 * Handles token storage and header injection for fetch requests
 */
export class CSRFManager {
  private static instance: CSRFManager
  private currentToken: string | null = null

  private constructor() {}

  static getInstance(): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager()
    }
    return CSRFManager.instance
  }

  setToken(token: string) {
    this.currentToken = token
  }

  getToken(): string | null {
    return this.currentToken
  }

  clearToken() {
    this.currentToken = null
  }

  /**
   * Add CSRF token to fetch headers
   */
  addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
    if (!this.currentToken) {
      return headers
    }

    return {
      ...headers,
      [CSRF_HEADER]: this.currentToken
    }
  }
}

// Export singleton instance
export const csrfManager = CSRFManager.getInstance() 