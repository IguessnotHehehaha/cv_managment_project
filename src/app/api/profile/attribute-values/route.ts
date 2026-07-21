import { NextResponse } from 'next/server'
import { profileAttributeValueService } from '@/services/ProfileAttributeValueService'
import { getCachedClaims } from '@/lib/auth'

export async function GET() {
    const claims = await getCachedClaims()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(await profileAttributeValueService.listForProfile(claims.sub))
}