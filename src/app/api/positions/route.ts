import { NextResponse } from 'next/server'
import { positionService } from '@/services/PositionService'
import { accessRuleService } from '@/services/AccessRuleService'
import { getCachedClaims, requireRole } from '@/lib/auth'
import { z } from 'zod'

export async function GET() {
    const claims = await getCachedClaims()
    const isStaff = !!claims && ['recruiter', 'admin'].includes(claims.user_role)
    if (isStaff) return NextResponse.json(await positionService.list({ includeRestricted: true }))

    const all = await positionService.list({ includeRestricted: true })
    if (!claims) return NextResponse.json(all.filter((p) => p.visibility === 'public'))

    const visible = await Promise.all(
        all.map(async (p) => {
            if (p.visibility === 'public') return p
            const has = await accessRuleService.candidateHasAccess(claims.sub, p.id)
            return has ? p : null
        })
    )
    return NextResponse.json(visible.filter(Boolean))
}

const positionSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    company: z.string().optional(),
    level: z.enum(['junior', 'middle', 'senior', 'c_level']).optional(),
    visibility: z.enum(['public', 'restricted']).default('public'),
    maxProjects: z.number().int().min(0).default(3),
    projectTags: z.array(z.string()).default([]),
    attributeIds: z.array(z.string()).default([]),
})

export async function POST(request: Request) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = positionSchema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const position = await positionService.create(body.data, claims.sub)
    return NextResponse.json(position, { status: 201 })
}