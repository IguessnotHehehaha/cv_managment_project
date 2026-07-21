'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const supabase = createClient()
    const t = useTranslations('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [message, setMessage] = useState<string | null>(null)

    const signInOAuth = (provider: 'google' | 'github') => {
        supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } })
    }

    const submitPassword = async () => {
        setMessage(null)
        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
            })
            setMessage(error ? error.message : 'Check your email to confirm your account.')
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) setMessage(error.message)
            else window.location.href = '/'
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>

                <button onClick={() => signInOAuth('google')} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    {t('continueWithGoogle')}
                </button>
                <button onClick={() => signInOAuth('github')} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    {t('continueWithGitHub')}
                </button>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" /> {t('or')} <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                </div>

                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')}
                       className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')}
                       className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                <button onClick={submitPassword} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                    {mode === 'signup' ? t('createAccount') : t('signIn')}
                </button>

                <button onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="text-xs text-blue-600">
                    {mode === 'signup' ? t('switchToSignIn') : t('switchToSignUp')}
                </button>

                {message && <p className="text-sm text-amber-600">{message}</p>}
            </div>
        </div>
    )
}