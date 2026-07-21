'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFieldArray } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import type { Attribute } from '@/types/attribute'

const schema = z.object({
    name: z.string().min(1),
    category: z.enum(['certification', 'domain_knowledge', 'personal_information', 'soft_skills']),
    description: z.string().min(1),
    dataType: z.enum(['string', 'text', 'image', 'numeric', 'date', 'period', 'boolean', 'dropdown']),
    options: z.array(z.object({ value: z.string() })).optional(),
    maxLength: z.number().int().positive().optional(),
    regex: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
})
type FormData = z.infer<typeof schema>

export function AttributeForm({
                                  attribute,
                                  onClose,
                              }: {
    attribute: Attribute | null
    onClose: () => void
}) {
    const queryClient = useQueryClient()
    const t = useTranslations('attributes.form')
    const tCommon = useTranslations('common')
    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: attribute
            ? {
                name: attribute.name,
                category: attribute.category as FormData['category'],
                description: attribute.description,
                dataType: attribute.dataType as FormData['dataType'],
                options: attribute.config?.options?.map((value) => ({ value })) ?? [],
            }
            : { name: '', category: 'soft_skills', description: '', dataType: 'string', options: [] },
    })
    const { fields, append, remove } = useFieldArray({ control, name: 'options' })
    const dataType = watch('dataType')

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            const payload = {
                name: data.name,
                category: data.category,
                description: data.description,
                dataType: data.dataType,
                config: data.dataType === 'dropdown'
                    ? { options: data.options?.map((o) => o.value) }
                    : {
                        ...(data.maxLength && { maxLength: data.maxLength }),
                        ...(data.regex && { regex: data.regex }),
                        ...(data.min !== undefined && { min: data.min }),
                        ...(data.max !== undefined && { max: data.max }),
                    },
            }
            const res = attribute
                ? await fetch(`/api/attributes/${attribute.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, version: attribute.version }),
                })
                : await fetch('/api/attributes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
            if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attributes'] })
            onClose()
        },
    })

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
            <form
                onSubmit={handleSubmit((data) => mutation.mutate(data))}
                className="w-full max-w-md space-y-3 rounded-xl bg-white p-6 dark:bg-gray-900"
            >
                <h2 className="text-lg font-semibold">{attribute ? t('editTitle') : t('newTitle')}</h2>

                <input {...register('name')} placeholder={t('namePlaceholder')} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

                <select {...register('category')} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                    <option value="certification">{t('categoryCertification')}</option>
                    <option value="domain_knowledge">{t('categoryDomainKnowledge')}</option>
                    <option value="personal_information">{t('categoryPersonalInformation')}</option>
                    <option value="soft_skills">{t('categorySoftSkills')}</option>
                </select>

                <select {...register('dataType')} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                    {['string', 'text', 'image', 'numeric', 'date', 'period', 'boolean', 'dropdown'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                {(dataType === 'string' || dataType === 'text') && (
                    <div className="flex gap-2">
                        <input type="number" {...register('maxLength', { valueAsNumber: true })} placeholder={t('maxLengthPlaceholder')}
                               className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        <input {...register('regex')} placeholder={t('regexPlaceholder')}
                               className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                )}

                {dataType === 'numeric' && (
                    <div className="flex gap-2">
                        <input type="number" {...register('min', { valueAsNumber: true })} placeholder={t('minPlaceholder')}
                               className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        <input type="number" {...register('max', { valueAsNumber: true })} placeholder={t('maxPlaceholder')}
                               className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                )}

                {dataType === 'dropdown' && (
                    <div className="space-y-1">
                        {fields.map((field, i) => (
                            <div key={field.id} className="flex gap-2">
                                <input {...register(`options.${i}.value`)} className="flex-1 rounded-lg border px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
                                <button type="button" onClick={() => remove(i)} className="text-red-500">×</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => append({ value: '' })} className="text-sm text-blue-600">{t('addOption')}</button>
                    </div>
                )}

                <textarea {...register('description')} placeholder={t('descriptionPlaceholder')} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />

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