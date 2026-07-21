import { NextResponse } from 'next/server'
import { attributeService } from '@/services/AttributeService'
import { VersionConflictError, DuplicateNameError } from '@/services/errors'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.enum(['certification', 'domain_knowledge', 'personal_information', 'soft_skills']),
    description: z.string().min(1),
    dataType: z.enum(['string', 'text', 'image', 'numeric', 'date', 'period', 'boolean', 'dropdown']),
    config: z.object({ options: z.array(z.string()).optional() }).default({}),
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
        await attributeService.update(id, version, data)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (e instanceof VersionConflictError) return NextResponse.json({ error: e.message }, { status: 409 })
        throw e
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    await attributeService.softDelete(id)
    return NextResponse.json({ ok: true })
}