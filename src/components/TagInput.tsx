'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
    const [input, setInput] = useState('')
    const t = useTranslations('tagInput')

    const { data: suggestions = [] } = useQuery({
        queryKey: ['project-tags', input],
        queryFn: async () => (await fetch(`/api/project-tags?q=${encodeURIComponent(input)}`)).json() as Promise<{ name: string }[]>,
        enabled: input.length > 0,
    })

    const addTag = (name: string) => {
        const trimmed = name.trim()
        if (!trimmed || tags.includes(trimmed)) return
        onChange([...tags, trimmed])
        setInput('')
    }
    const removeTag = (name: string) => onChange(tags.filter((t) => t !== name))

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-blue-500">×</button>
          </span>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(input) } }}
                placeholder={t('placeholder')}
                className="w-full rounded-lg border px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            {input && suggestions.length > 0 && (
                <div className="rounded-lg border dark:border-gray-700">
                    {suggestions.filter((s) => !tags.includes(s.name)).map((s) => (
                        <button key={s.name} type="button" onClick={() => addTag(s.name)}
                                className="block w-full px-3 py-1 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            {s.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}