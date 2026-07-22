'use client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
    const router = useRouter()
    const t = useTranslations('nav')

    const handleSignOut = async () => {
        await createClient().auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <button
            onClick={handleSignOut}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        >
            {t('signOut')}
        </button>
    )
}