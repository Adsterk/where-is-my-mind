import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'

export default async function FormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/auth/login')
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <div className="space-y-6">
            {children}
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Form layout error:', error)
    redirect('/auth/login')
  }
}
