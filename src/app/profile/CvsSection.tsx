'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

type Cv = { id: string; status: string; position: { id: string; title: string; company: string | null } }
type Position = { id: string; title: string }

export function CvsSection() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [showPicker, setShowPicker] = useState(false)
    const t = useTranslations('profile.cvs')
    const tCommon = useTranslations('common')
    const tCol = useTranslations('positions.columns')

    const { data: cvs = [] } = useQuery({
        queryKey: ['cvs'],
        queryFn: async () => (await fetch('/api/cvs')).json() as Promise<Cv[]>,
    })
    const { data: positions = [] } = useQuery({
        queryKey: ['positions', 'for-cv-picker'],
        queryFn: async () => (await fetch('/api/positions')).json() as Promise<Position[]>,
        enabled: showPicker,
    })

    const createMutation = useMutation({
        mutationFn: async (positionId: string) => {
            const res = await fetch('/api/cvs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ positionId }) })
            if (!res.ok) throw new Error((await res.json()).error ?? 'Could not create CV')
            return res.json()
        },
        onSuccess: (cv) => { queryClient.invalidateQueries({ queryKey: ['cvs'] }); router.push(`/cvs/${cv.id}`) },
    })

    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => Promise.all(ids.map((id) => fetch(`/api/cvs/${id}`, { method: 'DELETE' }))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cvs'] }),
    })

    const existingPositionIds = new Set(cvs.map((c) => c.position.id))

    const columns: ColumnDef<Cv>[] = [
        { accessorFn: (c) => c.position.title, header: tCol('title') },
        { accessorFn: (c) => c.position.company ?? '—', header: tCol('company') },
        { accessorKey: 'status', header: tCommon('status') },
    ]

    return (
        <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t('title')}</h2>
                <button onClick={() => setShowPicker((s) => !s)} className="text-sm text-blue-600">{t('newCv')}</button>
            </div>

            {showPicker && (
                <div className="rounded-lg border p-2 dark:border-gray-700">
                    {positions.filter((p) => !existingPositionIds.has(p.id)).map((p) => (
                        <button key={p.id} onClick={() => createMutation.mutate(p.id)}
                                className="block w-full px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            {p.title}
                        </button>
                    ))}
                    {createMutation.isError && <p className="px-2 text-xs text-red-500">{(createMutation.error as Error).message}</p>}
                </div>
            )}

            <DataTable
                data={cvs}
                columns={columns}
                getRowId={(c) => c.id}
                onRowClick={(row) => router.push(`/cvs/${row.id}`)}
                toolbar={(selectedIds, clear) => (
                    <>
                        <span className="text-sm text-gray-500">{selectedIds.length > 0 ? tCommon('selectedCount', { count: selectedIds.length }) : tCommon('noSelection')}</span>
                        <button disabled={selectedIds.length === 0}
                                onClick={() => { deleteMutation.mutate(selectedIds); clear() }}
                                className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-30">
                            {tCommon('delete')}
                        </button>
                    </>
                )}
            />
        </div>
    )
}