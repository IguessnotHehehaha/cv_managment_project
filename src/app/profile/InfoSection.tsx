'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ValueEditor } from '@/components/ValueEditor'
import type { Attribute } from '@/types/attribute'
import type { ValueRow } from '@/types/attributeValue'

const CATEGORIES = ['all', 'certification', 'domain_knowledge', 'personal_information', 'soft_skills'] as const

function AddAttributeSearch({ excludeIds, onAdd }: { excludeIds: string[]; onAdd: (attr: Attribute) => void }) {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all')
    const t = useTranslations('profile.info')
    const tCat = useTranslations('attributes.categories')
    const { data: results = [] } = useQuery({
        queryKey: ['attributes', 'info-search', search, category],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.set('q', search)
            if (category !== 'all') params.set('category', category)
            return (await fetch(`/api/attributes?${params}`)).json() as Promise<Attribute[]>
        },
    })
    const { data: recent = [] } = useQuery({
        queryKey: ['attributes', 'recent'],
        queryFn: async () => (await fetch('/api/attributes?recent=true')).json() as Promise<Attribute[]>,
        enabled: !search,
        staleTime: 15_000,
    })

    const available = results.filter((a) => !excludeIds.includes(a.id))

    return (
        <div className="w-full max-w-full space-y-2 overflow-hidden rounded-lg border p-3 dark:border-gray-700">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchPlaceholder')}
                   className="w-full rounded-lg border px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <div className="flex gap-1">
                {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                            className={`rounded-lg px-2 py-1 text-xs ${category === c ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {tCat(c)}
                    </button>
                ))}
            </div>
            <div className="max-h-40 overflow-y-auto">
                {!search && recent.length > 0 && (
                    <p className="px-2 py-1 text-xs font-medium text-gray-500">{t('recentlyUsed')}</p>
                )}
                {(!search ? recent.filter((a) => !excludeIds.includes(a.id)) : available).map((a) => (
                    <button key={a.id} onClick={() => onAdd(a)} className="block w-full px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                        {a.name} <span className="text-gray-400">({tCat(a.category)})</span>
                    </button>
                ))}
                {!search && recent.length === 0 && <p className="px-2 py-1.5 text-sm text-gray-400">{t('noRecent')}</p>}
                {search && available.length === 0 && <p className="px-2 py-1.5 text-sm text-gray-400">{t('noMatches')}</p>}
            </div>
        </div>
    )
}

export function InfoSection() {
    const queryClient = useQueryClient()
    const [showPicker, setShowPicker] = useState(false)
    const t = useTranslations('profile.info')

    const { data: values = [] } = useQuery({
        queryKey: ['profile', 'attribute-values'],
        queryFn: async () => (await fetch('/api/profile/attribute-values')).json() as Promise<ValueRow[]>,
    })

    const addAttribute = async (attr: Attribute) => {
        await fetch(`/api/profile/attribute-values/${attr.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: null, version: null }),
        })
        queryClient.invalidateQueries({ queryKey: ['profile', 'attribute-values'] })
    }
    const removeAttribute = async (attributeId: string) => {
        await fetch(`/api/profile/attribute-values/${attributeId}`, { method: 'DELETE' })
        queryClient.invalidateQueries({ queryKey: ['profile', 'attribute-values'] })
    }

    return (
        <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t('title')}</h2>
                <button onClick={() => setShowPicker((s) => !s)} className="text-sm text-blue-600">
                    {showPicker ? t('doneAdding') : t('addAttribute')}
                </button>
            </div>

            {showPicker && <AddAttributeSearch excludeIds={values.map((v) => v.attributeId)} onAdd={addAttribute} />}

            <div className="space-y-3">
                {values.map((row) => (
                    <div key={row.attributeId} className="flex items-start gap-2">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-500">{row.attribute.name}</label>
                            <ValueEditor
                                attribute={row.attribute}
                                value={row.value}
                                onSave={async (newValue) => {
                                    await fetch(`/api/profile/attribute-values/${row.attributeId}`, {
                                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ value: newValue, version: row.version }),
                                    })
                                    queryClient.invalidateQueries({ queryKey: ['profile', 'attribute-values'] })
                                }}
                            />
                        </div>
                        <button onClick={() => removeAttribute(row.attributeId)} className="mt-6 text-red-500">×</button>
                    </div>
                ))}
                {values.length === 0 && <p className="text-sm text-gray-400">{t('noAttributes')}</p>}
            </div>
        </div>
    )
}