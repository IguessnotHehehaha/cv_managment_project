import { NextResponse } from 'next/server'
import { projectService } from '@/services/ProjectService'
import { getCachedClaims } from '@/lib/auth'
import { VersionConflictError, NotFoundError } from '@/services/errors'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(1),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    version: z.number().int(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const { version, ...data } = body.data
    try {
        await projectService.update(id, claims.sub, version, data)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (e instanceof VersionConflictError) return NextResponse.json({ error: e.message }, { status: 409 })
        throw e
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    try {
        await projectService.delete(id, claims.sub)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 })
        throw e
    }
}