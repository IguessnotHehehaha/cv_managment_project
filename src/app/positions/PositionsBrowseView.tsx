'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

type Position = { id: string; title: string; company: string | null; level: string | null; projectTags: string[] }

export function PositionsBrowseView() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tag = searchParams.get('tag')
    const t = useTranslations('positions')

    const { data: positions = [] } = useQuery({
        queryKey: ['positions', 'public'],
        queryFn: async () => (await fetch('/api/positions')).json() as Promise<Position[]>,
    })

    const filtered = tag ? positions.filter((p) => p.projectTags.includes(tag)) : positions

    const columns: ColumnDef<Position>[] = [
        { accessorKey: 'title', header: t('columns.title') },
        { accessorKey: 'company', header: t('columns.company'), cell: (c) => c.getValue() ?? '—' },
        { accessorKey: 'level', header: t('columns.level'), cell: (c) => c.getValue() ?? '—' },
    ]

    return (
        <div className="mx-auto max-w-5xl space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">{t('browse.title')}</h1>
                {tag && (
                    <button onClick={() => router.push('/positions')} className="text-sm text-blue-600">
                        {t('browse.clearFilter', { tag })}
                    </button>
                )}
            </div>
            <DataTable data={filtered} columns={columns} getRowId={(r) => r.id} selectable={false}
                       onRowClick={(row) => router.push(`/positions/${row.id}`)} />
        </div>
    )
}