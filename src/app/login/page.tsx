'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const supabase = createClient()

    const signIn = (provider: 'google' | 'github') => {
        supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sign in</h1>
                <button
                    onClick={() => signIn('google')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                    Continue with Google
                </button>
                <button
                    onClick={() => signIn('github')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                    Continue with GitHub
                </button>
            </div>
        </div>
    )
}