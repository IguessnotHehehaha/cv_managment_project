import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('exchangeCodeForSession failed:', {
            message: error.message,
            name: error.name,
            status: error.status,
            cause: (error as any).cause,
            full: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        })
    } else {
        console.error('No code param on callback request')
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}