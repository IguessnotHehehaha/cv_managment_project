import { NextResponse } from 'next/server'
import { profileService } from '@/services/ProfileService'
import { getCachedClaims } from '@/lib/auth'
import { VersionConflictError } from '@/services/errors'
import { z } from 'zod'

export async function GET() {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(await profileService.getById(claims.sub))
}

const updateSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    location: z.string().optional(),
    avatarUrl: z.string().optional(),
    version: z.number().int(),
})

export async function PATCH(request: Request) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = updateSchema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const { version, ...data } = body.data
    try {
        return NextResponse.json(await profileService.updateMe(claims.sub, version, data))
    } catch (e) {
        if (e instanceof VersionConflictError) return NextResponse.json({ error: e.message }, { status: 409 })
        throw e
    }
}