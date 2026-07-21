'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

type CvRow = { id: string; status: string; profile: { firstName: string | null; lastName: string | null }; _count: { likes: number } }

export function PositionCvList({ positionId }: { positionId: string }) {
    const router = useRouter()
    const t = useTranslations('positionCvList')
    const { data: cvs = [] } = useQuery({
        queryKey: ['position-cvs', positionId],
        queryFn: async () => (await fetch(`/api/positions/${positionId}/cvs`)).json() as Promise<CvRow[]>,
    })

    const columns: ColumnDef<CvRow>[] = [
        { accessorFn: (r) => `${r.profile.firstName ?? ''} ${r.profile.lastName ?? ''}`.trim() || '—', header: t('columns.candidate') },
        { accessorKey: 'status', header: t('columns.status') },
        { accessorFn: (r) => r._count.likes, header: t('columns.likes') },
    ]

    return (
        <div>
            <h2 className="mb-2 font-medium">{t('title')}</h2>
            <DataTable data={cvs} columns={columns} getRowId={(r) => r.id} selectable={false}
                       onRowClick={(row) => router.push(`/cvs/${row.id}`)} />
            {cvs.length === 0 && <p className="text-sm text-gray-400">{t('noCvs')}</p>}
        </div>
    )
}