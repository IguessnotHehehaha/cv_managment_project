import { NextResponse } from 'next/server'
import { positionService } from '@/services/PositionService'
import { requireRole } from '@/lib/auth'
import { VersionConflictError, NotFoundError, ForbiddenError } from '@/services/errors'
import { z } from 'zod'

const updateSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    company: z.string().optional(),
    level: z.enum(['junior', 'middle', 'senior', 'c_level']).optional(),
    visibility: z.enum(['public', 'restricted']),
    maxProjects: z.number().int().min(0),
    projectTags: z.array(z.string()),
    attributeIds: z.array(z.string()),
    version: z.number().int(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = updateSchema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const { version, ...data } = body.data
    try {
        await positionService.update(id, version, data, claims.sub)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (e instanceof VersionConflictError) return NextResponse.json({ error: e.message }, { status: 409 })
        if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 })
        throw e
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    try {
        await positionService.delete(id)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 409 })
        throw e
    }
}