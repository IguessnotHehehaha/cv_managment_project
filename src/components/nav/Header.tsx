import Link from 'next/link'
import { getCachedClaims } from '@/lib/auth'
import { ThemeToggle } from './ThemeToggle'

export async function Header() {
    const claims = await getCachedClaims()

    return (
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
                <Link href="/" className="font-semibold text-gray-900 dark:text-gray-100">CVPlatform</Link>

                <nav className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <Link href="/positions">Positions</Link>
                    {claims && <Link href="/profile">My Profile</Link>}
                    {claims?.user_role === 'recruiter' && <Link href="/attributes">Attributes</Link>}
                    {claims?.user_role === 'admin' && <Link href="/admin">Admin</Link>}
                </nav>

                <input
                    type="search"
                    placeholder="Search positions, CVs..."
                    className="ml-auto w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                />

                <ThemeToggle />

                {!claims && (
                    <Link href="/login" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    )
}