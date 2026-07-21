import { NextResponse } from 'next/server'
import { cvService } from '@/services/CvService'
import { getCachedClaims } from '@/lib/auth'
import { NotFoundError, ForbiddenError, DuplicateError } from '@/services/errors'
import { z } from 'zod'

export async function GET() {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(await cvService.listForProfile(claims.sub))
}

const schema = z.object({ positionId: z.string() })

export async function POST(request: Request) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    try {
        const cv = await cvService.create(claims.sub, body.data.positionId)
        return NextResponse.json(cv, { status: 201 })
    } catch (e) {
        if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 })
        if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 })
        if (e instanceof DuplicateError) return NextResponse.json({ error: e.message }, { status: 409 })
        throw e
    }
}