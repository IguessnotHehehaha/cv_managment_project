import { NextResponse } from 'next/server'
import { exportService } from '@/services/ExportService'
import { requireRole } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    if (!claims) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const csv = await exportService.positionCvsToCsv(id)

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="position-${id}-cvs.csv"`,
        },
    })
}