'use client'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/post'

export function Discussion({ positionId, isStaff }: { positionId: string; isStaff: boolean }) {
    const t = useTranslations('discussion')
    const tCommon = useTranslations('common')
    const [posts, setPosts] = useState<Post[]>([])
    const [draft, setDraft] = useState('')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let active = true

        const loadPosts = async () => {
            const res = await fetch(`/api/positions/${positionId}/posts`)
            const data: Post[] = await res.json()
            if (active) setPosts(data)
        }
        loadPosts()
        const supabase = createClient()
        const channel = supabase
            .channel(`posts:${positionId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts', filter: `position_id=eq.${positionId}` },
                () => { loadPosts() }
            )
            .subscribe()

        return () => {
            active = false
            supabase.removeChannel(channel)
        }
    }, [positionId])

    useEffect(() => {
        createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
    }, [])

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [posts.length])

    const submit = async () => {
        if (!draft.trim()) return
        const res = await fetch(`/api/positions/${positionId}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: draft }),
        })
        if (res.ok) setDraft('')
    }

    const saveEdit = async (postId: string) => {
        await fetch(`/api/positions/${positionId}/posts/${postId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editDraft }),
        })
        setEditingId(null)
        const res = await fetch(`/api/positions/${positionId}/posts`)
        setPosts(await res.json())
    }

    const deletePost = async (postId: string) => {
        await fetch(`/api/positions/${positionId}/posts/${postId}`, { method: 'DELETE' })
        setPosts((prev) => prev.filter((p) => p.id !== postId))
    }

    return (
        <div className="space-y-3">
            <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border p-3 dark:border-gray-700">
                {posts.map((post) => (
                    <div key={post.id} className="text-sm">
                        <div className="flex items-baseline gap-2">
                            {isStaff ? (
                                <Link href={`/positions/candidates/${post.authorId}`} className="font-medium text-blue-600 hover:underline">
                                    {post.author.firstName} {post.author.lastName}
                                </Link>
                            ) : (
                                <span className="font-medium">{post.author.firstName} {post.author.lastName}</span>
                            )}
                            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
                        </div>

                        {editingId === post.id ? (
                            <textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} rows={2}
                                      className="w-full rounded-lg border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{post.content}</ReactMarkdown>
                            </div>
                        )}

                        {post.authorId === currentUserId && (
                            <div className="mt-1 flex gap-2 text-xs">
                                {editingId === post.id ? (
                                    <>
                                        <button onClick={() => saveEdit(post.id)} className="text-blue-600">{tCommon('save')}</button>
                                        <button onClick={() => setEditingId(null)} className="text-gray-400">{tCommon('cancel')}</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setEditingId(post.id); setEditDraft(post.content) }} className="text-blue-600">{tCommon('edit')}</button>
                                        <button onClick={() => deletePost(post.id)} className="text-red-500">{tCommon('delete')}</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {posts.length === 0 && <p className="text-sm text-gray-400">{t('noDiscussion')}</p>}
                <div ref={bottomRef} />
            </div>

            <div className="flex flex-col gap-2">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
                  placeholder={t('placeholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                <button onClick={submit} className="self-end rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white">{t('post')}</button>
            </div>
        </div>
    )
}