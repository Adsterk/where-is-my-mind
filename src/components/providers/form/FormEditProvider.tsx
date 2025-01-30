'use client'

import { createContext, useContext, useState } from 'react'

interface FormEditContextType {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
}

interface FormEditProviderProps {
  children: React.ReactNode
  initialEditing?: boolean
}

const FormEditContext = createContext<FormEditContextType | undefined>(undefined)

export function FormEditProvider({ 
  children, 
  initialEditing = false 
}: FormEditProviderProps) {
  const [isEditing, setIsEditing] = useState(initialEditing)

  return (
    <FormEditContext.Provider value={{ isEditing, setIsEditing }}>
      {children}
    </FormEditContext.Provider>
  )
}

export function useFormEdit() {
  const context = useContext(FormEditContext)
  if (context === undefined) {
    throw new Error('useFormEdit must be used within a FormEditProvider')
  }
  return context
} 