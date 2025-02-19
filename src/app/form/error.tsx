'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function FormError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Form error:', error)
  }, [error])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mood Entry</h1>
      </div>

      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold">Error Loading Form</h2>
          <p className="text-muted-foreground">
            {error.message || 'Failed to load the mood entry form.'}
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Button onClick={() => window.location.reload()} variant="default">
              Refresh page
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 