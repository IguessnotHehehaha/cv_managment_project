'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ValueEditor } from '@/components/ValueEditor'
import type { CvRenderData } from '@/types/cv'

export function CvEditor({ initialData, adminTargetProfileId }: { initialData: CvRenderData; adminTargetProfileId?: string }) {
    const router = useRouter()
    const t = useTranslations('cv')
    const [status, setStatus] = useState(initialData.cv.status)
    const [publishError, setPublishError] = useState<string | null>(null)
    const [rows, setRows] = useState(initialData.attributeRows)
    const { cv, projects } = initialData

    const saveValue = async (attributeId: string, index: number, newValue: unknown) => {
        const row = rows[index]
        const url = adminTargetProfileId
            ? `/api/admin/profiles/${adminTargetProfileId}/attribute-values/${attributeId}`
            : `/api/profile/attribute-values/${attributeId}`
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newValue, version: row.version }),
        })
        if (!res.ok) return
        const saved = await res.json()
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, value: saved.value, version: saved.version } : r)))
    }

    const togglePublish = async () => {
        setPublishError(null)
        const res = await fetch(`/api/cvs/${cv.id}/publish`, { method: status === 'published' ? 'DELETE' : 'POST' })
        if (!res.ok) { setPublishError((await res.json()).error); return }
        setStatus(status === 'published' ? 'draft' : 'published')
        router.refresh()
    }

    const isComplete = rows.every((r) => r.value !== null && r.value !== '' && r.value !== undefined)

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{cv.position.title}</h1>
                    {cv.position.company && <p className="text-gray-500">{cv.position.company}</p>}
                </div>

                <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
          }`}>
            {status}
          </span>
                    <button onClick={togglePublish} disabled={!isComplete && status !== 'published'}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-30">
                        {status === 'published' ? t('unpublish') : t('publish')}
                    </button>
                </div>
            </div>

            {publishError && <p className="text-sm text-red-500">{publishError}</p>}

            <div className="space-y-3">
                {rows.map((row, i) => (
                    <div key={row.attribute.id}>
                        <label className="mb-1 block text-xs font-medium text-gray-500">{row.attribute.name}</label>
                        <ValueEditor attribute={row.attribute} value={row.value} highlightEmpty
                                     onSave={(v) => saveValue(row.attribute.id, i, v)} />
                    </div>
                ))}
            </div>

            <div>
                <h2 className="mb-2 font-medium">{t('relevantProjects')}</h2>
                <div className="space-y-2">
                    {projects.map((p) => (
                        <div key={p.id} className="rounded-lg border p-3 text-sm dark:border-gray-700">
                            <p className="font-medium">{p.name}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {p.tags.map((t) => <span key={t.tag.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{t.tag.name}</span>)}
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && <p className="text-sm text-gray-400">{t('noMatchingProjects')}</p>}
                </div>
            </div>

            {!isComplete && (
                <p className="text-xs text-amber-600">{t('completeHint')}</p>
            )}
        </div>
    )
}