'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/DataTable'
import { AttributeForm } from './AttributeForm'
import type { ColumnDef } from '@tanstack/react-table'
import type { Attribute } from '@/types/attribute'

const CATEGORIES = ['all', 'certification', 'domain_knowledge', 'personal_information', 'soft_skills'] as const

export default function AttributesPage() {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all')
    const [editing, setEditing] = useState<Attribute | 'new' | null>(null)
    const queryClient = useQueryClient()
    const t = useTranslations('attributes')
    const tCat = useTranslations('attributes.categories')
    const tCommon = useTranslations('common')

    const { data: attributes = [] } = useQuery({
        queryKey: ['attributes', search, category],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.set('q', search)
            if (category !== 'all') params.set('category', category)
            const res = await fetch(`/api/attributes?${params}`)
            return res.json() as Promise<Attribute[]>
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            await Promise.all(ids.map((id) => fetch(`/api/attributes/${id}`, { method: 'DELETE' })))
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attributes'] }),
    })

    const columns: ColumnDef<Attribute>[] = [
        { accessorKey: 'name', header: t('columns.name') },
        { accessorKey: 'category', header: t('columns.category') },
        { accessorKey: 'dataType', header: t('columns.type') },
        { accessorKey: 'description', header: t('columns.description') },
    ]

    return (
        <div className="mx-auto max-w-5xl space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">{t('title')}</h1>
                <button
                    onClick={() => setEditing('new')}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    {t('newAttribute')}
                </button>
            </div>

            <div className="flex gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
                <div className="flex gap-1">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`rounded-lg px-3 py-1.5 text-sm ${
                                category === c
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                            {tCat(c)}
                        </button>
                    ))}
                </div>
            </div>

            <DataTable
                data={attributes}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(row) => setEditing(row)}
                toolbar={(selectedIds, clear) => (
                    <>
            <span className="text-sm text-gray-500">
              {selectedIds.length > 0 ? tCommon('selectedCount', { count: selectedIds.length }) : tCommon('noSelection')}
            </span>
                        <button
                            disabled={selectedIds.length === 0}
                            onClick={() => {
                                deleteMutation.mutate(selectedIds)
                                clear()
                            }}
                            className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-30"
                        >
                            {tCommon('delete')}
                        </button>
                    </>
                )}
            />

            {editing && (
                <AttributeForm
                    attribute={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </div>
    )
}