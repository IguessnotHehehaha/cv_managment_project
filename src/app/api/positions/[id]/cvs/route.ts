import { NextResponse } from 'next/server'
import { cvService } from '@/services/CvService'
import { requireRole } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    return NextResponse.json(await cvService.listForPosition(id, claims.user_role === 'admin'))
}