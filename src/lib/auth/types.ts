export interface AuthError {
  message: string
  status?: number
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  user: AuthUser
}

export interface AuthUser {
  id: string
  email?: string
  role?: string
  created_at: string
} 