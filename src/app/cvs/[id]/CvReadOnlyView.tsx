'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { CvRenderData } from '@/types/cv'

export function CvReadOnlyView({ data, initiallyLiked }: { data: CvRenderData; initiallyLiked: boolean }) {
    const { cv, attributeRows, projects } = data
    const [liked, setLiked] = useState(initiallyLiked)
    const t = useTranslations('cv')

    const toggleLike = async () => {
        const res = await fetch(`/api/cvs/${cv.id}/like`, { method: 'POST' })
        if (res.ok) setLiked((await res.json()).liked)
    }


    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{cv.position.title}</h1>
                    {cv.position.company && <p className="text-gray-500">{cv.position.company}</p>}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleLike}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
                            liked ? 'bg-red-50 text-red-600 dark:bg-red-950' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                        }`}
                    >
                        <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
                        {liked ? t('liked') : t('like')}
                    </button>
                    <span className="text-sm text-gray-500">{data.likeCount}</span>
                </div>

            </div>

            <div className="space-y-3">
                {attributeRows.map((row) => (
                    <div key={row.attribute.id}>
                        <p className="text-xs font-medium text-gray-500">{row.attribute.name}</p>
                        <p className={row.value === null || row.value === '' ? 'text-red-500' : ''}>
                            {row.value === null || row.value === '' ? t('notProvided') : String(row.value)}
                        </p>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="mb-2 font-medium">{t('relevantProjects')}</h2>
                {projects.map((p) => <p key={p.id} className="text-sm">{p.name}</p>)}
            </div>
        </div>
    )
}