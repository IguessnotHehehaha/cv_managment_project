'use client'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

export function LocaleSwitcher() {
    const locale = useLocale()
    const router = useRouter()

    const changeLocale = async (next: string) => {
        document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`
        await fetch('/api/profile/preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: next }),
        }).catch(() => {}) // fine to no-op for guests (401) — the cookie above already covers them
        router.refresh()
    }

    return (
        <select value={locale} onChange={(e) => changeLocale(e.target.value)}
                className="rounded-lg border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800">
            <option value="en">EN</option>
            <option value="ru">RU</option>
        </select>
    )
}