import { NextResponse } from 'next/server'
import { postService } from '@/services/PostService'
import { getCachedClaims } from '@/lib/auth'
import { ForbiddenError } from '@/services/errors'
import { z } from 'zod'

export async function PATCH(request: Request, { params }: { params: Promise<{ postId: string }> }) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { postId } = await params
    const body = z.object({ content: z.string().min(1) }).safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
    try {
        await postService.update(postId, claims.sub, body.data.content)
        return NextResponse.json({ ok: true })
    } catch (e) { if (e instanceof ForbiddenError) return NextResponse.json({ error: 'Not your post' }, { status: 403 }); throw e }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ postId: string }> }) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { postId } = await params
    try {
        await postService.delete(postId, claims.sub, claims.user_role === 'admin')
        return NextResponse.json({ ok: true })
    } catch (e) { if (e instanceof ForbiddenError) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); throw e }
}