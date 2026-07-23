import { NextResponse } from 'next/server'
import { userService } from '@/services/UserService'
import { requireRole } from '@/lib/auth'
import { NotFoundError } from '@/services/errors'
import { z } from 'zod'

const schema = z.object({
    role: z.enum(['candidate', 'recruiter', 'admin']).optional(),
    isBlocked: z.boolean().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    if (body.data.role) await userService.setRole(id, body.data.role)
    if (body.data.isBlocked !== undefined) await userService.setBlocked(id, body.data.isBlocked)
    return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    try {
        await userService.delete(id)
        return NextResponse.json({ ok: true })
    } catch (e) {
        if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 })
        throw e
    }
}