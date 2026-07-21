import { NextResponse } from 'next/server'
import { userService } from '@/services/UserService'
import { requireRole } from '@/lib/auth'

export async function GET() {
    const claims = await requireRole(['admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json(await userService.list())
}