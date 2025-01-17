'use client'

import { createContext, useContext, useState } from 'react'
import type { Database } from '@/lib/supabase/types'

type FormSection = {
  id: string
  title: string
  component: string
  enabled: boolean
}

interface FormEditContextType {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  sections: FormSection[]
  setSections: (sections: FormSection[]) => void
  sectionOrder: string[]
  setSectionOrder: (order: string[]) => void
  saveSectionOrder: (order: string[]) => Promise<void>
}

const FormEditContext = createContext<FormEditContextType | undefined>(undefined)

export function FormEditProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [sections, setSections] = useState<FormSection[]>([])
  const [sectionOrder, setSectionOrder] = useState<string[]>([])

  const saveSectionOrder = async (order: string[]) => {
    // Implementation remains the same
  }

  return (
    <FormEditContext.Provider
      value={{
        isEditing,
        setIsEditing,
        sections,
        setSections,
        sectionOrder,
        setSectionOrder,
        saveSectionOrder,
      }}
    >
      {children}
    </FormEditContext.Provider>
  )
}

export const useFormEdit = () => {
  const context = useContext(FormEditContext)
  if (context === undefined) {
    throw new Error('useFormEdit must be used within a FormEditProvider')
  }
  return context
} 