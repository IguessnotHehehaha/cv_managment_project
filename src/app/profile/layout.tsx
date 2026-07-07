import { redirect } from 'next/navigation'
import { getCachedClaims } from '@/lib/auth'

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
    const claims = await getCachedClaims()
    if (!claims) redirect('/login')
    return <>{children}</>
}