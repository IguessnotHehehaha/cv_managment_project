import { NextResponse } from 'next/server'
import { profileService } from '@/services/ProfileService'
import { requireRole } from '@/lib/auth'
import { VersionConflictError } from '@/services/errors'
import { z } from 'zod'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    return NextResponse.json(await profileService.getById(id))
}

const schema = z.object({ firstName: z.string(), lastName: z.string(), location: z.string().optional(), avatarUrl: z.string().optional(), version: z.number().int() })

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const { version, ...data } = body.data
    try {
        return NextResponse.json(await profileService.updateMe(id, version, data))
    } catch (e) {
        if (e instanceof VersionConflictError) return NextResponse.json({ error: e.message }, { status: 409 })
        throw e
    }
}