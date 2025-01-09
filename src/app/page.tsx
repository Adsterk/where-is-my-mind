'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthForm } from "@/components/forms/AuthForm"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Mood Tracker</CardTitle>
            <CardDescription className="text-center">
              Track and analyze your daily moods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sign-in" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign-in">Login</TabsTrigger>
                <TabsTrigger value="sign-up">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-in">
                <AuthForm view="sign-in" />
              </TabsContent>
              <TabsContent value="sign-up">
                <AuthForm view="sign-up" />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-slate-500 text-center">
              Protected by Supabase Auth. Your data is secure.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
