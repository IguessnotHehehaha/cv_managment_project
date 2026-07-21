import { NextResponse } from 'next/server'
import { postService } from '@/services/PostService'
import { getCachedClaims } from '@/lib/auth'
import { z } from 'zod'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return NextResponse.json(await postService.listForPosition(id))
}

const schema = z.object({ content: z.string().min(1).max(5000) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const post = await postService.create(id, claims.sub, body.data.content)
    return NextResponse.json(post, { status: 201 })
}