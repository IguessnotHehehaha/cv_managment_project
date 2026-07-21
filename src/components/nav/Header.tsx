import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getCachedClaims } from '@/lib/auth'
import { ThemeToggle } from './ThemeToggle'
import { HeaderSearch } from './HeaderSearch'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileNav } from './MobileNav'

export async function Header() {
    const claims = await getCachedClaims()
    const t = await getTranslations('nav')

    const links = (
        <>
            <Link href="/positions">{t('positions')}</Link>
            {claims && <Link href="/profile">{t('myProfile')}</Link>}
            {claims?.user_role === 'recruiter' && <Link href="/attributes">{t('attributes')}</Link>}
            {claims?.user_role === 'admin' && <Link href="/admin">{t('admin')}</Link>}
        </>
    )

    return (
        <header className="relative border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
                <Link href="/" className="font-semibold text-gray-900 dark:text-gray-100">CVPlatform</Link>

                <nav className="hidden gap-4 text-sm text-gray-600 dark:text-gray-300 sm:flex">{links}</nav>

                <div className="ml-auto hidden sm:block"><HeaderSearch /></div>
                <div className="hidden items-center gap-2 sm:flex">
                    <LocaleSwitcher />
                    <ThemeToggle />
                    {!claims && <Link href="/login" className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('signIn')}</Link>}
                </div>

                <MobileNav links={links} isAuthed={!!claims} />
            </div>
        </header>
    )
}