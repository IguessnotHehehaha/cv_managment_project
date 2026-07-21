'use client'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { HeaderSearch } from './HeaderSearch'
import { LocaleSwitcher } from './LocaleSwitcher'
import { ThemeToggle } from './ThemeToggle'

export function MobileNav({ links, isAuthed }: { links: React.ReactNode; isAuthed: boolean }) {
    const [open, setOpen] = useState(false)
    const t = useTranslations('mobileNav')
    const tNav = useTranslations('nav')
    return (
        <div className="ml-auto sm:hidden">
            <button onClick={() => setOpen((o) => !o)} aria-label={t('menuAriaLabel')}>
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {open && (
                <div className="absolute inset-x-0 top-full z-20 space-y-3 border-b bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <nav className="flex flex-col gap-2 text-sm">{links}</nav>
                    <HeaderSearch />
                    <div className="flex items-center justify-between">
                        <LocaleSwitcher />
                        <ThemeToggle />
                    </div>
                    {!isAuthed && <Link href="/login" className="block text-sm font-medium text-blue-600">{tNav('signIn')}</Link>}
                </div>
            )}
        </div>
    )
}