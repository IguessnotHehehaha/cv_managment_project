import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type AppClaims = {
    sub: string
    user_role: 'candidate' | 'recruiter' | 'admin'
}

function isAppClaims(claims: unknown): claims is AppClaims {
    if (typeof claims !== 'object' || claims === null) return false
    const c = claims as Record<string, unknown>
    return (
        typeof c.sub === 'string' &&
        (c.user_role === 'candidate' || c.user_role === 'recruiter' || c.user_role === 'admin')
    )
}

export const getCachedClaims = cache(async (): Promise<AppClaims | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data) return null
    return isAppClaims(data.claims) ? data.claims : null
})

export async function requireRole(allowed: Array<AppClaims['user_role']>) {
    const claims = await getCachedClaims()
    if (!claims || !allowed.includes(claims.user_role)) return null
    return claims
}

export async function getCurrentProfile() {
    const claims = await getCachedClaims()
    if (!claims) return null
    return prisma.profile.findUnique({ where: { id: claims.sub } })
}