import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedClaims } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
    theme: z.enum(['light', 'dark']).optional(),
    locale: z.enum(['en', 'ru']).optional(),
})

export async function PATCH(request: Request) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    await prisma.profile.update({ where: { id: claims.sub }, data: body.data })
    return NextResponse.json({ ok: true })
}