'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useTranslations } from 'next-intl'


type Results = {
    positions: { id: string; title: string }[]
    candidates: { id: string; first_name: string; last_name: string }[]
    cvs: { id: string; first_name: string; last_name: string; title: string }[]
    posts: { id: string; position_id: string; content: string }[]
}

export function HeaderSearch() {
    const router = useRouter()
    const t = useTranslations('search')
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const boxRef = useRef<HTMLDivElement>(null)
    const debouncedQuery = useDebouncedValue(query, 300)

    const { data } = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: async ({ signal }) => {
            const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, { signal })
            return res.json() as Promise<Results>
        },
        enabled: debouncedQuery.length > 1,
    })

    useEffect(() => {
        const onClick = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false) }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    return (
        <div ref={boxRef} className="relative">
            <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                placeholder={t('placeholder')}
                className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            {open && data && (data.positions.length > 0 || data.candidates.length > 0 || data.cvs.length > 0 || data.posts.length > 0) && (
                <div className="absolute z-10 mt-1 w-72 rounded-lg border bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {data.positions.map((p) => (
                        <button key={p.id} onClick={() => { router.push(`/positions/${p.id}`); setOpen(false) }}
                                className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            {p.title}
                        </button>
                    ))}
                    {data.candidates.map((c) => (
                        <button key={c.id} onClick={() => { router.push(`/positions/candidates/${c.id}`); setOpen(false) }}
                                className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            {c.first_name} {c.last_name}
                        </button>
                    ))}
                    {data.cvs.map((cv) => (
                        <button key={cv.id} onClick={() => { router.push(`/cvs/${cv.id}`); setOpen(false) }}
                                className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            {cv.first_name} {cv.last_name} — {cv.title}
                        </button>
                    ))}
                    {data.posts.map((post) => (
                        <button key={post.id} onClick={() => { router.push(`/positions/${post.position_id}`); setOpen(false) }}
                                className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            {post.content.slice(0, 60)}{post.content.length > 60 ? '...' : ''}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}