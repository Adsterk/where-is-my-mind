export const routes = {
  home: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    resetPassword: '/auth/reset-password',
    updatePassword: '/auth/update-password',
    verifyEmail: '/auth/verify-email',
  },
  dashboard: {
    root: '/dashboard',
    settings: '/dashboard/settings',
  },
  form: {
    moodEntry: '/form/mood-entry',
  },
} as const

export type Route = typeof routes
export type AuthRoute = keyof typeof routes.auth
export type DashboardRoute = keyof typeof routes.dashboard
export type FormRoute = keyof typeof routes.form
