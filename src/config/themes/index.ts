export const themeConfig = {
  defaultTheme: 'system',
  themes: ['light', 'dark'],
} as const

export const colorSchemes = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-700',
  },
} as const

export type Theme = keyof typeof colorSchemes 