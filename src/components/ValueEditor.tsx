'use client'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { Attribute } from '@/types/attribute'
import { validateAttributeValue } from '@/lib/attributeValidation'
import { uploadFile } from '@/lib/uploadFile'


export function ValueEditor({
    attribute,
    value,
    onSave,
    highlightEmpty = false,
}: {
    attribute: Attribute
    value: unknown
    onSave: (value: unknown) => void | Promise<void>
    highlightEmpty?: boolean
}) {
    const [local, setLocal] = useState(value)
    const t = useTranslations('common')

    useEffect(() => setLocal(value), [value])

    const isEmpty = local === null || local === undefined || local === ''
    const border = highlightEmpty && isEmpty ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'
    const commit = () => {
        if (local !== value) onSave(local)
    }

    const base = `w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 ${border}`

    const validationError = validateAttributeValue(attribute.dataType, attribute.config, local)

    const withValidation = (input: ReactNode) => (
        <div>
            {input}
            {validationError && (
                <p className="mt-1 text-xs text-red-500">
                    {validationError}
                </p>
            )}
        </div>
    )

    switch (attribute.dataType) {
        case 'boolean':
            return withValidation(
                <input
                    type="checkbox"
                    checked={!!local}
                    onChange={(e) => {
                        setLocal(e.target.checked)
                        onSave(e.target.checked)
                    }}
                />
            )

        case 'dropdown':
            return withValidation(
                <select
                    value={(local as string) ?? ''}
                    onChange={(e) => {
                        setLocal(e.target.value)
                        onSave(e.target.value)
                    }}
                    className={base}
                >
                    <option value="">{t('choose')}</option>
                    {(attribute.config?.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            )

        case 'numeric':
            return withValidation(
                <input
                    type="number"
                    value={(local as number) ?? ''}
                    onChange={(e) =>
                        setLocal(e.target.value === '' ? null : Number(e.target.value))
                    }
                    onBlur={commit}
                    className={base}
                />
            )

        case 'date':
            return withValidation(
                <input
                    type="date"
                    value={(local as string) ?? ''}
                    onChange={(e) => {
                        setLocal(e.target.value)
                        onSave(e.target.value)
                    }}
                    className={base}
                />
            )

        case 'period': {
            const v = (local as { start?: string; end?: string }) ?? {}

            return withValidation(
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={v.start ?? ''}
                        onChange={(e) => {
                            const n = { ...v, start: e.target.value }
                            setLocal(n)
                            onSave(n)
                        }}
                        className={base}
                    />
                    <input
                        type="date"
                        value={v.end ?? ''}
                        onChange={(e) => {
                            const n = { ...v, end: e.target.value }
                            setLocal(n)
                            onSave(n)
                        }}
                        className={base}
                    />
                </div>
            )
        }

        case 'text':
            return withValidation(
                <textarea
                    value={(local as string) ?? ''}
                    onChange={(e) => setLocal(e.target.value)}
                    onBlur={commit}
                    className={base}
                />
            )

        case 'image':
            return (
                <div className="space-y-2">
                    {typeof local === 'string' && local && (
                        <img src={local} alt="" className="h-24 w-24 rounded-lg object-cover" />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const url = await uploadFile(file, 'attribute-images')
                            setLocal(url)
                            onSave(url)
                        }}
                        className="text-xs"
                    />
                </div>
            )

        default:
            return withValidation(
                <input
                    value={(local as string) ?? ''}
                    onChange={(e) => setLocal(e.target.value)}
                    onBlur={commit}
                    className={base}
                />
            )
    }
}