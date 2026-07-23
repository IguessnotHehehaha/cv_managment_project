'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import type { Attribute } from '@/types/attribute'

const CATEGORIES = ['all', 'certification', 'domain_knowledge', 'personal_information', 'soft_skills'] as const


export function AttributePicker({
                                    selected,
                                    onChange,
                                }: {
    selected: Attribute[]
    onChange: (attrs: Attribute[]) => void
}) {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all')
    const t = useTranslations('attributePicker')
    const tCat = useTranslations('attributes.categories')

    const { data: results = [] } = useQuery({
        queryKey: ['attributes', 'picker', search, category],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.set('q', search)
            if (category !== 'all') params.set('category', category)
            const res = await fetch(`/api/attributes?${params}`)
            return res.json() as Promise<Attribute[]>
        },
    })

    const { data: recent = [] } = useQuery({
        queryKey: ['attributes', 'recent'],
        queryFn: async () => (await fetch('/api/attributes?recent=true')).json() as Promise<Attribute[]>,
        enabled: !search,
        staleTime: 15_000,
    })

    const selectedIds = new Set(selected.map((a) => a.id))
    const available = results.filter((a) => !selectedIds.has(a.id))

    const add = (attr: Attribute) => onChange([...selected, attr])
    const remove = (id: string) => onChange(selected.filter((a) => a.id !== id))
    const move = (index: number, dir: -1 | 1) => {
        const next = [...selected]
        const target = index + dir
        if (target < 0 || target >= next.length) return
            ;[next[index], next[target]] = [next[target], next[index]]
        onChange(next)
    }

    return (
        <div className="space-y-2">
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />

            <div className="flex-col sm:flex-row gap-1">
                {CATEGORIES.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`rounded-lg px-2 py-1 text-xs ${
                            category === c
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                    >
                        {tCat(c)}
                    </button>
                ))}
            </div>

            <div className="max-h-40 overflow-y-auto rounded-lg border dark:border-gray-700">
                {!search && recent.length > 0 && (
                    <p className="border-b bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                        {t('recentlyUsed')}
                    </p>
                )}
                {(!search ? recent.filter((a) => !selectedIds.has(a.id)) : available).map((attr) => (
                    <button
                        key={attr.id}
                        type="button"
                        onClick={() => add(attr)}
                        className="block w-full border-b px-3 py-1.5 text-left text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                    >
                        {attr.name}{' '}
                        <span className="text-gray-400">({tCat(attr.category)}, {attr.dataType})</span>
                    </button>
                ))}
                {!search && recent.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">{t('noRecent')}</p>
                )}
                {search && available.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">{t('noMatches')}</p>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">{t('selectedInOrder')}</p>
                {selected.length === 0 && <p className="text-sm text-gray-400">{t('none')}</p>}
                {selected.map((attr, i) => (
                    <div key={attr.id} className="flex-col sm:flex-row items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm dark:bg-gray-800">
                        <span className="flex-1">{attr.name}</span>
                        <button type="button" onClick={() => move(i, -1)} className="text-gray-400" aria-label={t('moveUpAriaLabel')}>↑</button>
                        <button type="button" onClick={() => move(i, 1)} className="text-gray-400" aria-label={t('moveDownAriaLabel')}>↓</button>
                        <button type="button" onClick={() => remove(attr.id)} className="text-red-500" aria-label={t('removeAriaLabel')}>×</button>
                    </div>
                ))}
            </div>
        </div>
    )
}