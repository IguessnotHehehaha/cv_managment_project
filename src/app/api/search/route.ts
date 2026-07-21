import { NextResponse } from 'next/server'
import { searchService } from '@/services/SearchService'
import { getCachedClaims } from '@/lib/auth'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    if (!q) return NextResponse.json({ positions: [], candidates: [] })

    const claims = await getCachedClaims()
    const role = claims?.user_role ?? 'guest'
    return NextResponse.json(await searchService.search(q, role))
}