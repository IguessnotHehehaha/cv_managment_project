import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export default async function CandidatePublicProfile({ params }: { params: Promise<{ id: string }> }) {
    const claims = await requireRole(['recruiter', 'admin'])
    const t = await getTranslations('candidateProfile')
    if (!claims) notFound()
    const isAdmin = claims.user_role === 'admin'

    const { id } = await params
    const profile = await prisma.profile.findUnique({ where: { id } })
    if (!profile) notFound()

    const cvs = await prisma.cv.findMany({
        where: { profileId: id, ...(isAdmin ? {} : { status: 'published' }) },
        include: { position: true },
    })

    return (
        <div className="mx-auto max-w-2xl space-y-4 p-6">
            <div className="flex items-center gap-4">
                {profile.avatarUrl && <img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />}
                <div>
                    <h1 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h1>
                    {profile.location && <p className="text-sm text-gray-500">{profile.location}</p>}
                </div>
            </div>
            <div>
                <h2 className="mb-2 font-medium">{t('publishedCvs')}</h2>
                <div className="space-y-1">
                    {cvs.map((cv) => (
                        <a key={cv.id} href={`/cvs/${cv.id}`} className="block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            {cv.position.title}
                        </a>
                    ))}
                    {cvs.length === 0 && <p className="text-sm text-gray-400">{t('noPublishedCvs')}</p>}
                </div>
            </div>
        </div>
    )
}