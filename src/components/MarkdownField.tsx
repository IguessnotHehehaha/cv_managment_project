'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { useTranslations } from 'next-intl'

export function MarkdownField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [tab, setTab] = useState<'write' | 'preview'>('write')
    const t = useTranslations('markdownField')

    return (
        <div className="rounded-lg border dark:border-gray-700">
            <div className="flex border-b text-xs dark:border-gray-700">
                <button type="button" onClick={() => setTab('write')}
                        className={`px-3 py-1.5 ${tab === 'write' ? 'font-medium text-blue-600' : 'text-gray-500'}`}>{t('write')}</button>
                <button type="button" onClick={() => setTab('preview')}
                        className={`px-3 py-1.5 ${tab === 'preview' ? 'font-medium text-blue-600' : 'text-gray-500'}`}>{t('preview')}</button>
            </div>
            {tab === 'write' ? (
                <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={6}
                          placeholder={t('placeholder')}
                          className="w-full resize-none rounded-b-lg px-3 py-2 text-sm dark:bg-gray-800" />
            ) : (
                <div className="prose prose-sm max-w-none px-3 py-2 dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                        {value || t('nothingToPreview')}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    )
}