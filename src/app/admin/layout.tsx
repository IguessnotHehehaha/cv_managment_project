import { redirect } from 'next/navigation'
import { getCachedClaims } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const claims = await getCachedClaims()
    if (!claims || claims.user_role !== 'admin') redirect('/')
    return <>{children}</>
}