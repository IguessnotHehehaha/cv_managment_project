import { NextResponse } from 'next/server'
import { projectService } from '@/services/ProjectService'
import { getCachedClaims } from '@/lib/auth'
import { z } from 'zod'

export async function GET() {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(await projectService.listForProfile(claims.sub))
}

const schema = z.object({
    name: z.string().min(1),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
})

export async function POST(request: Request) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const project = await projectService.create(claims.sub, body.data)
    return NextResponse.json(project, { status: 201 })
}