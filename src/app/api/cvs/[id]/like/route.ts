import { NextResponse } from 'next/server'
import { likeService } from '@/services/LikeService'
import { requireRole } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    return NextResponse.json(await likeService.toggle(id, claims.sub))
}