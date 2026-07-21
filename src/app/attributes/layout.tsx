import { redirect } from 'next/navigation'
import { getCachedClaims } from '@/lib/auth'

export default async function AttributesLayout({ children }: { children: React.ReactNode }) {
    const claims = await getCachedClaims()
    if (!claims || !['recruiter', 'admin'].includes(claims.user_role)) redirect('/')
    return <>{children}</>
}