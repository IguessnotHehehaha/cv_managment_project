import { NextResponse } from 'next/server'
import { accessRuleService } from '@/services/AccessRuleService'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return NextResponse.json(await accessRuleService.listForPosition(id))
}

const rulesSchema = z.object({
    rules: z.array(z.object({ attributeId: z.string(), operator: z.string(), value: z.string() })),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = rulesSchema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    await accessRuleService.replaceForPosition(id, body.data.rules)
    return NextResponse.json({ ok: true })
}