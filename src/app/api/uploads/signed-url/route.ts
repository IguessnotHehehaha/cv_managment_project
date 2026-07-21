import { NextResponse } from 'next/server'
import { bucket } from '@/lib/gcs'
import { getCachedClaims } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
    fileName: z.string().min(1),
    contentType: z.string().min(1),
    folder: z.enum(['avatars', 'attribute-images']),
})

export async function POST(request: Request) {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = schema.safeParse(await request.json())
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

    const { fileName, contentType, folder } = body.data
    const path = `${folder}/${claims.sub}/${Date.now()}-${fileName}`
    const file = bucket.file(path)

    const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 10 * 60 * 1000,
        contentType,
    })

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`
    return NextResponse.json({ uploadUrl, publicUrl })
}