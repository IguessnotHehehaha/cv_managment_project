import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getOrigin(request: Request): string {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
    if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
    return new URL(request.url).origin
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const origin = getOrigin(request)

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('exchangeCodeForSession failed:', error.message)
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}