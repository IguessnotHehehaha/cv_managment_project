import { NextResponse } from 'next/server'
import { profileAttributeValueService } from '@/services/ProfileAttributeValueService'
import { requireRole } from '@/lib/auth'
import { VersionConflictError, ValidationError } from '@/services/errors'
import { z } from 'zod'

const schema = z.object({ value: z.unknown(), version: z.number().int().nullable() })

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; attributeId: string }> }) {
    const claims = await requireRole(['admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id, attributeId } = await params
    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    try {
        return NextResponse.json(await profileAttributeValueService.upsertValue(id, attributeId, body.data.value, body.data.version))
    } catch (e) {
        if (e instanceof VersionConflictError) return NextResponse.json({ error: e.message }, { status: 409 })
        if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 })
        throw e
    }
}