import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { getCachedClaims } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default getRequestConfig(async () => {
    let locale = 'en'
    const claims = await getCachedClaims()

    if (claims) {
        const profile = await prisma.profile.findUnique({ where: { id: claims.sub }, select: { locale: true } })
        if (profile?.locale) locale = profile.locale
    } else {
        const cookieStore = await cookies()
        locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'en'
    }

    return { locale, messages: (await import(`../messages/${locale}.json`)).default }
})