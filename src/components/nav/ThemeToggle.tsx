'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const t = useTranslations('themeToggle')

    return (
        <button
            onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark'
                setTheme(next)
                fetch('/api/profile/preferences', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ theme: next }),
                }).catch(() => {})
            }}
            aria-label={t('ariaLabel')}
            className="rounded-lg border border-gray-300 p-1.5 dark:border-gray-700"
        >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="block h-4 w-4 dark:hidden" />
        </button>
    )
}