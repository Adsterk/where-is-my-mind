import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { name, value, options } = await request.json()
  cookies().set(name, value, options)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { name } = await request.json()
  cookies().delete(name)
  return NextResponse.json({ success: true })
} 