'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers'
import { Loader2 } from 'lucide-react'

export function DataManagement() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!user) return
    
    try {
      setIsExporting(true)
      
      // Fetch all user's data
      const { data: entries, error: moodError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
      
      if (moodError) throw moodError

      // Create a JSON file
      const data = {
        daily_entries: entries,
        exported_at: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mood-tracker-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success',
        description: 'Your data has been exported successfully.',
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: 'Error',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Download all your mood tracking data in JSON format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            'Export Data'
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 