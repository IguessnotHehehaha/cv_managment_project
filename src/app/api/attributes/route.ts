import { NextResponse } from 'next/server'
import { attributeService } from '@/services/AttributeService'
import { VersionConflictError, DuplicateNameError } from '@/services/errors'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'
import { attributeUsageService } from '@/services/AttributeUsageService'
import { getCachedClaims } from '@/lib/auth'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const attributes = await attributeService.list({
        q: searchParams.get('q') ?? undefined,
        category: searchParams.get('category') ?? undefined,
    })
    if (searchParams.get('recent') === 'true') {
        const claims = await getCachedClaims()
        if (!claims) return NextResponse.json([])
        return NextResponse.json(await attributeUsageService.listRecentlyUsed(claims.sub))
    }
    return NextResponse.json(attributes)
}

const createSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.enum(['certification', 'domain_knowledge', 'personal_information', 'soft_skills']),
    description: z.string().min(1),
    dataType: z.enum(['string', 'text', 'image', 'numeric', 'date', 'period', 'boolean', 'dropdown']),
    config: z.object({ options: z.array(z.string()).optional() }).default({}),
})

export async function POST(request: Request) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = createSchema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    try {
        const attribute = await attributeService.create(body.data)
        return NextResponse.json(attribute, { status: 201 })
    } catch (e) {
        if (e instanceof DuplicateNameError) return NextResponse.json({ error: e.message }, { status: 409 })
        return NextResponse.json({ error: (e as Error).message }, { status: 409 })
    }
}