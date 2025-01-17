'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'x-large'
  highContrast: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  reducedMotion: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (settings: Partial<AccessibilitySettings>) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    colorBlindMode: 'none',
    reducedMotion: false
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Apply settings to document
  useEffect(() => {
    document.documentElement.classList.remove('text-normal', 'text-large', 'text-x-large')
    document.documentElement.classList.add(`text-${settings.fontSize}`)
    
    document.documentElement.classList.toggle('high-contrast', settings.highContrast)
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion)
    
    document.documentElement.setAttribute('data-color-blind-mode', settings.colorBlindMode)
    
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
} 