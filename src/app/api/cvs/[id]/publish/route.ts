import { NextResponse } from 'next/server'
import { cvService } from '@/services/CvService'
import { getCachedClaims } from '@/lib/auth'
import { NotFoundError, ForbiddenError } from '@/services/errors'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    try {
        await cvService.publish(id, claims.sub)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 })
        if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 })
        throw e
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await cvService.unpublish(id, claims.sub)
    return NextResponse.json({ ok: true })
}