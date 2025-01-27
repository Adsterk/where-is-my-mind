'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            There was a problem authenticating your account.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/auth/login">Return to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 