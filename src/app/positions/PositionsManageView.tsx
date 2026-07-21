'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/DataTable'
import { PositionForm } from './PositionForm'
import type { Position } from '@/types/position'
import type { ColumnDef } from '@tanstack/react-table'

export function PositionsManageView() {
    const [editing, setEditing] = useState<Position | 'new' | null>(null)
    const queryClient = useQueryClient()
    const t = useTranslations('positions')
    const tCommon = useTranslations('common')

    const { data: positions = [] } = useQuery({
        queryKey: ['positions'],
        queryFn: async () => (await fetch('/api/positions')).json() as Promise<Position[]>,
    })

    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            await Promise.all(ids.map((id) => fetch(`/api/positions/${id}`, { method: 'DELETE' })))
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
    })

    const duplicateMutation = useMutation({
        mutationFn: async (id: string) => fetch(`/api/positions/${id}/duplicate`, { method: 'POST' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
    })

    const columns: ColumnDef<Position>[] = [
        { accessorKey: 'title', header: t('columns.title') },
        { accessorKey: 'company', header: t('columns.company'), cell: (c) => c.getValue() ?? '—' },
        { accessorKey: 'level', header: t('columns.level'), cell: (c) => c.getValue() ?? '—' },
        { accessorKey: 'visibility', header: t('columns.visibility') },
        { id: 'attrCount', header: t('columns.attributes'), cell: ({ row }) => row.original.positionAttributes.length },
    ]

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">{t('manage.title')}</h1>
                <button
                    onClick={() => setEditing('new')}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    {t('manage.newPosition')}
                </button>
            </div>

            <DataTable
                data={positions}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(row) => setEditing(row)}
                toolbar={(selectedIds, clear) => (
                    <>
            <span className="text-sm text-gray-500">
              {selectedIds.length > 0 ? tCommon('selectedCount', { count: selectedIds.length }) : tCommon('noSelection')}
            </span>
                        <button
                            disabled={selectedIds.length !== 1}
                            onClick={() => { duplicateMutation.mutate(selectedIds[0]); clear() }}
                            className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 disabled:opacity-30"
                        >
                            {t('manage.duplicate')}
                        </button>
                        <button
                            disabled={selectedIds.length === 0}
                            onClick={() => { deleteMutation.mutate(selectedIds); clear() }}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-30"
                        >
                            {tCommon('delete')}
                        </button>
                        <a
                            href={selectedIds.length === 1 ? `/api/positions/${selectedIds[0]}/export` : undefined}
                            onClick={(e) => { if (selectedIds.length !== 1) e.preventDefault() }}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                            selectedIds.length === 1 ? 'text-green-600' : 'pointer-events-none text-gray-300'
                        }`}
                            >
                            {t('manage.exportCsv')}
                        </a>
                    </>
                )}
            />

            {editing && <PositionForm position={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
        </div>
    )
}