import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/lib/supabase/types'

async function testSchema() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Test user creation
  const { data: user, error: userError } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'test123456',
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  })
  
  if (userError) {
    console.error('User creation failed:', userError)
    return
  }

  // Test mood entry creation
  const { error: moodError } = await supabase
    .from('mood_entries')
    .insert({
      user_id: user.user!.id,
      mood_score: 7,
      notes: 'Test entry',
      timezone: 'UTC',
      language: 'en'
    })

  if (moodError) {
    console.error('Mood entry creation failed:', moodError)
    return
  }

  // Test settings update
  const { error: settingsError } = await supabase
    .from('user_settings')
    .update({
      notification_email: true,
      notification_push: true,
      reminder_time: '09:00:00'
    })
    .eq('user_id', user.user!.id)

  if (settingsError) {
    console.error('Settings update failed:', settingsError)
    return
  }

  console.log('All schema tests passed!')
}

testSchema() 