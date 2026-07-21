import { NextResponse } from 'next/server'
import { positionService } from '@/services/PositionService'
import { requireRole } from '@/lib/auth'
import { NotFoundError } from '@/services/errors'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    try {
        const copy = await positionService.duplicate(id)
        return NextResponse.json(copy, { status: 201 })
    } catch (e) {
        if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 })
        throw e
    }
}