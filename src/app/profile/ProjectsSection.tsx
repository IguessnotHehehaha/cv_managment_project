'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { TagInput } from '@/components/TagInput'
import { MarkdownField } from '@/components/MarkdownField'
import type { Project } from '@/types/project'

function ProjectForm({ project, onClose }: { project: Project | null; onClose: () => void }) {
    const queryClient = useQueryClient()
    const t = useTranslations('profile.projects')
    const tCommon = useTranslations('common')
    const [name, setName] = useState(project?.name ?? '')
    const [periodStart, setPeriodStart] = useState(project?.periodStart?.slice(0, 10) ?? '')
    const [periodEnd, setPeriodEnd] = useState(project?.periodEnd?.slice(0, 10) ?? '')
    const [description, setDescription] = useState(project?.description ?? '')
    const [tags, setTags] = useState<string[]>(project?.tags.map((t) => t.tag.name) ?? [])

    const mutation = useMutation({
        mutationFn: async () => {
            const payload = { name, periodStart: periodStart || undefined, periodEnd: periodEnd || undefined, description, tags }
            const res = project
                ? await fetch(`/api/projects/${project.id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, version: project.version }),
                })
                : await fetch('/api/projects', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
            if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
            return res.json()
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); onClose() },
    })

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
                  className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-900">
                <h2 className="text-lg font-semibold">{project ? t('editTitle') : t('newTitle')}</h2>

                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('namePlaceholder')} required
                       className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />

                <div className="flex flex-col gap-2 sm:flex-row">
                    <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
                           className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
                           className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                </div>

                <MarkdownField value={description} onChange={setDescription} />
                <TagInput tags={tags} onChange={setTags} />

                {mutation.isError && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm">{tCommon('cancel')}</button>
                    <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white">{tCommon('save')}</button>
                </div>
            </form>
        </div>
    )
}

export function ProjectsSection() {
    const queryClient = useQueryClient()
    const [editing, setEditing] = useState<Project | 'new' | null>(null)
    const t = useTranslations('profile.projects')
    const tCommon = useTranslations('common')

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => (await fetch('/api/projects')).json() as Promise<Project[]>,
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => fetch(`/api/projects/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    })

    return (
        <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t('title')}</h2>
                <button onClick={() => setEditing('new')} className="text-sm text-blue-600">{t('addProject')}</button>
            </div>

            <div className="space-y-3">
                {projects.map((p) => (
                    <div key={p.id} className="rounded-lg border p-3 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs text-gray-400">
                                    {p.periodStart?.slice(0, 10) ?? '?'} — {p.periodEnd?.slice(0, 10) ?? t('present')}
                                </p>
                            </div>
                            <div className="flex gap-2 text-sm">
                                <button onClick={() => setEditing(p)} className="text-blue-600">{tCommon('edit')}</button>
                                <button onClick={() => deleteMutation.mutate(p.id)} className="text-red-500">{tCommon('delete')}</button>
                            </div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                            {p.tags.map((t) => (
                                <span key={t.tag.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{t.tag.name}</span>
                            ))}
                        </div>
                    </div>
                ))}
                {projects.length === 0 && <p className="text-sm text-gray-400">{t('noProjects')}</p>}
            </div>

            {editing && <ProjectForm project={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
        </div>
    )
}