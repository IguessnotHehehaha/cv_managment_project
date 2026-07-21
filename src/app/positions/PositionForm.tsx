'use client'
import {useEffect, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import {AttributePicker} from '@/components/AttributePicker'
import type {Position} from '@/types/position'
import type {Attribute} from '@/types/attribute'
import { AccessRuleBuilder, type AccessRule } from '@/components/AccessRuleBuilder'

export function PositionForm({ position, onClose }: { position: Position | null; onClose: () => void }) {
    const queryClient = useQueryClient()
    const t = useTranslations('positions.form')
    const tCommon = useTranslations('common')
    const [title, setTitle] = useState(position?.title ?? '')
    const [description, setDescription] = useState(position?.description ?? '')
    const [company, setCompany] = useState(position?.company ?? '')
    const [level, setLevel] = useState(position?.level ?? '')
    const [visibility, setVisibility] = useState(position?.visibility ?? 'public')
    const [maxProjects, setMaxProjects] = useState(position?.maxProjects ?? 3)
    const [projectTagsInput, setProjectTagsInput] = useState(position?.projectTags.join(', ') ?? '')
    const [attributes, setAttributes] = useState<Attribute[]>(
        position?.positionAttributes.map((pa) => pa.attribute) ?? []
    )

    const [rules, setRules] = useState<AccessRule[]>([])

    const rulesQuery = useQuery({
        queryKey: ['access-rules', position?.id],
        queryFn: async () => (await fetch(`/api/positions/${position!.id}/access-rules`)).json() as Promise<AccessRule[]>,
        enabled: !!position && visibility === 'restricted',
    })

    useEffect(() => {
        if (rulesQuery.data) setRules(rulesQuery.data)
    }, [rulesQuery.data])

    const mutation = useMutation({
        mutationFn: async () => {
            const payload = {
                title,
                description,
                company: company || undefined,
                level: level || undefined,
                visibility,
                maxProjects,
                projectTags: projectTagsInput.split(',').map((t) => t.trim()).filter(Boolean),
                attributeIds: attributes.map((a) => a.id),
            }

            const res = position
                ? await fetch(`/api/positions/${position.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, version: position.version }),
                })
                : await fetch('/api/positions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
            if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')

            const saved = await res.json()
            const savedId = position?.id ?? saved.id

            if (visibility === 'restricted') {
                await fetch(`/api/positions/${savedId}/access-rules`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rules }),
                })
            }
            return saved
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] })
            onClose()
        },
    })

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
            <form
                onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
                className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-900"
            >
                <h2 className="text-lg font-semibold">{position ? t('editTitle') : t('newTitle')}</h2>

                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('titlePlaceholder')} required
                       className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />

                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('descriptionPlaceholder')} required
                          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />

                <div className="flex flex-col gap-2 sm:flex-row">
                    <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t('companyPlaceholder')}
                           className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    <select value={level} onChange={(e) => setLevel(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                        <option value="">{t('noLevel')}</option>
                        <option value="junior">{t('junior')}</option>
                        <option value="middle">{t('middle')}</option>
                        <option value="senior">{t('senior')}</option>
                        <option value="c_level">{t('cLevel')}</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                        <option value="public">{t('public')}</option>
                        <option value="restricted">{t('restricted')}</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-500">{t('projectTagsLabel')}</label>
                        <input value={projectTagsInput} onChange={(e) => setProjectTagsInput(e.target.value)}
                               placeholder={t('projectTagsPlaceholder')}
                               className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                    <div className="w-40">
                        <label className="mb-1 block text-xs font-medium text-gray-500">{t('maxProjectsLabel')}</label>
                        <input type="number" min={0} value={maxProjects} onChange={(e) => setMaxProjects(Number(e.target.value))}
                               className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                </div>

                <div>
                    <p className="mb-1 text-sm font-medium">{t('attributesLabel')}</p>
                    <AttributePicker selected={attributes} onChange={setAttributes} />
                </div>

                {visibility === 'restricted' && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">{t('accessRulesLabel')}</p>
                        <AccessRuleBuilder rules={rules} onChange={setRules} />
                    </div>
                )}

                {mutation.isError && <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>}

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm">{tCommon('cancel')}</button>
                    <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white">
                        {tCommon('save')}
                    </button>
                </div>
            </form>
        </div>
    )
}