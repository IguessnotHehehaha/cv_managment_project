'use client'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useAutoSave } from '@/hooks/useAutoSave'
import { uploadFile } from '@/lib/uploadFile'
import { PasswordManager } from '@/components/PasswordManager'

type Profile = { id: string; firstName: string; lastName: string; location: string | null; avatarUrl: string | null; version: number }

export function ProfileMeSection() {
    const queryClient = useQueryClient()
    const t = useTranslations('profile.me')
    const { data: profile } = useQuery({
        queryKey: ['profile', 'me'],
        queryFn: async () => (await fetch('/api/profile')).json() as Promise<Profile>,
    })

    const initialized = useRef(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [location, setLocation] = useState('')
    const [version, setVersion] = useState(1)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'conflict'>('idle')

    useEffect(() => {
        if (profile && !initialized.current) {
            setFirstName(profile.firstName)
            setLastName(profile.lastName)
            setLocation(profile.location ?? '')
            setVersion(profile.version)
            setAvatarUrl(profile.avatarUrl)
            initialized.current = true
        }
    }, [profile])

    useAutoSave({ firstName, lastName, location }, async (data) => {
        setStatus('saving')
        const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, avatarUrl, version }),
        })
        if (res.status === 409) {
            setStatus('conflict')
            const fresh = await fetch('/api/profile').then((r) => r.json())
            setFirstName(fresh.firstName); setLastName(fresh.lastName)
            setLocation(fresh.location ?? ''); setVersion(fresh.version)
            return
        }
        if (!res.ok) { setStatus('idle'); return }
        const saved = await res.json()
        setVersion(saved.version)
        setStatus('saved')
        queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    }, 7000)

    const handleAvatarUpload = async (file: File) => {
        const url = await uploadFile(file, 'avatars')
        setAvatarUrl(url)
        const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, location, avatarUrl: url, version }),
        })
        if (res.ok) setVersion((await res.json()).version)
    }

    if (!profile) return <p className="text-sm text-gray-400">{t('loading')}</p>

    return (
        <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t('title')}</h2>
                <span className="text-xs text-gray-400">
          {status === 'saving' && t('saving')}
                    {status === 'saved' && t('saved')}
                    {status === 'conflict' && t('conflict')}
        </span>
            </div>

            <div className="flex items-center gap-4">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-400 dark:bg-gray-700">
                        {t('noPhoto')}
                    </div>
                )}

                <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    {avatarUrl ? t('changePhoto') : t('uploadPhoto')}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                        className="hidden"
                    />
                </label>
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">{t('firstNameLabel')}</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                       className={`w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 ${!firstName ? 'border-red-400' : 'dark:border-gray-700'}`} />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lastNameLabel')}</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                       className={`w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 ${!lastName ? 'border-red-400' : 'dark:border-gray-700'}`} />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">{t('locationLabel')}</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                       className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            </div>
            <PasswordManager />
        </div>
    )
}