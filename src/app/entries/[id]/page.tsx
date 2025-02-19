'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default function EntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [entry, setEntry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [adjacentEntries, setAdjacentEntries] = useState<{ prev: string | null; next: string | null }>({
    prev: null,
    next: null
  })

  useEffect(() => {
    if (!user) {
      router.replace('/auth/signin?redirectedFrom=/entries/' + params.id)
      return
    }

    async function fetchEntry() {
      try {
        // Fetch current entry
        const { data: currentEntry, error } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user?.id)
          .single()

        if (error) throw error
        if (!currentEntry) throw new Error('Entry not found')

        setEntry(currentEntry)

        // Fetch adjacent entries
        const { data: adjacentData } = await supabase
          .from('daily_entries')
          .select('id, date')
          .eq('user_id', user?.id)
          .order('date', { ascending: false })

        if (adjacentData) {
          const currentIndex = adjacentData.findIndex(e => e.id === params.id)
          setAdjacentEntries({
            prev: currentIndex > 0 ? adjacentData[currentIndex - 1].id : null,
            next: currentIndex < adjacentData.length - 1 ? adjacentData[currentIndex + 1].id : null
          })
        }
      } catch (err) {
        console.error('Error fetching entry:', err)
        setError(err instanceof Error ? err : new Error('Failed to load entry'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [params.id, supabase, user, router])

  const navigateToEntry = (id: string | null) => {
    if (id) {
      router.push(`/entries/${id}`)
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Loading entry..." />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error.message}</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!entry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entry Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This entry could not be found.</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold order-first">
          Entry for {format(new Date(entry.created_at), 'MMMM d, yyyy')}
        </h1>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateToEntry(adjacentEntries.next)}
              disabled={!adjacentEntries.next}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateToEntry(adjacentEntries.prev)}
              disabled={!adjacentEntries.prev}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Mood Score */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {entry.is_bipolar ? (
                entry.mood_score === 5 ? 'Balanced' :
                entry.mood_score < 5 ? `Depression Level ${entry.mood_score}` :
                `Mania Level ${entry.mood_score}`
              ) : (
                `${entry.mood_score}/10`
              )}
            </p>
            {entry.tracking_data?.mood?.notes && (
              <p className="mt-2 text-muted-foreground">
                {entry.tracking_data.mood.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sleep */}
        {entry.tracking_data?.sleep && (
          <Card>
            <CardHeader>
              <CardTitle>Sleep</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{entry.tracking_data.sleep.hours} hours</p>
              {entry.tracking_data.sleep.notes && (
                <p className="mt-2 text-muted-foreground">
                  {entry.tracking_data.sleep.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Medications */}
        {entry.tracking_data?.medications && (
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.tracking_data.medications.items?.map((med: any) => (
                  <div key={med.id} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${med.completed ? 'bg-primary' : 'bg-muted'}`} />
                    <span>{med.name}</span>
                  </div>
                ))}
                {entry.tracking_data.medications.notes && (
                  <p className="mt-2 text-muted-foreground">
                    {entry.tracking_data.medications.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Behaviors */}
        {entry.tracking_data?.behaviors && (
          <Card>
            <CardHeader>
              <CardTitle>Behaviors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.tracking_data.behaviors.items?.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.completed && item.severity && (
                      <p className="text-sm text-muted-foreground ml-4">
                        Severity: {item.severity}
                      </p>
                    )}
                  </div>
                ))}
                {entry.tracking_data.behaviors.notes && (
                  <p className="mt-2 text-muted-foreground">
                    {entry.tracking_data.behaviors.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {entry.tracking_data?.skills && (
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.tracking_data.skills.items?.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.completed && item.effectiveness && (
                      <p className="text-sm text-muted-foreground ml-4">
                        Effectiveness: {item.effectiveness}
                      </p>
                    )}
                  </div>
                ))}
                {entry.tracking_data.skills.notes && (
                  <p className="mt-2 text-muted-foreground">
                    {entry.tracking_data.skills.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Activities */}
        {entry.tracking_data?.social && (
          <Card>
            <CardHeader>
              <CardTitle>Social Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.tracking_data.social.items?.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.completed && item.quality && (
                      <p className="text-sm text-muted-foreground ml-4">
                        Quality: {item.quality}
                      </p>
                    )}
                  </div>
                ))}
                {entry.tracking_data.social.notes && (
                  <p className="mt-2 text-muted-foreground">
                    {entry.tracking_data.social.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Self-Care Activities */}
        {entry.tracking_data?.selfCare && (
          <Card>
            <CardHeader>
              <CardTitle>Self-Care Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.tracking_data.selfCare.items?.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.completed && item.impact && (
                      <p className="text-sm text-muted-foreground ml-4">
                        Impact: {item.impact}
                      </p>
                    )}
                  </div>
                ))}
                {entry.tracking_data.selfCare.notes && (
                  <p className="mt-2 text-muted-foreground">
                    {entry.tracking_data.selfCare.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 