import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { statsService } from '@/services/StatsService'
import { getCachedClaims } from '@/lib/auth'

export default async function HomePage() {
    const claims = await getCachedClaims()
    const isStaff = !!claims && ['recruiter', 'admin'].includes(claims.user_role)
    const t = await getTranslations('home')

    const [stats, latest, popular, tags] = await Promise.all([
        statsService.getHomeStats(),
        statsService.getLatestPositions(),
        statsService.getMostPopularPositions(),
        statsService.getTagCloud(),
    ])

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {[
                    [t('statCvsLast24h'), stats.cvsLast24h],
                    [t('statPositions'), stats.totalPositions],
                    [t('statCandidates'), stats.totalCandidates],
                    [t('statRecruiters'), stats.totalRecruiters],
                    [t('statTotalCvs'), stats.totalCvs],
                ].map(([label, value]) => (
                    <div key={label as string} className="min-w-0 rounded-lg border p-3 text-center dark:border-gray-700">
                        <p className="text-2xl font-semibold">{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="mb-2 font-medium">{t('latestPositions')}</h2>
                <div className="space-y-1">
                    {latest.map((p) => (
                        <Link key={p.id} href={`/positions/${p.id}`} className="block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            {p.title} {p.company && <span className="text-gray-400">· {p.company}</span>}
                        </Link>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="mb-2 font-medium">{t('mostPopularPositions')}</h2>
                <div className="space-y-1">
                    {popular.map(({ position, cvCount }) => (
                        <Link key={position.id} href={`/positions/${position.id}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            <span>{position.title}</span>
                            <span className="text-gray-400">{t('cvsCount', { count: cvCount })}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="mb-2 font-medium">{t('tagCloud')}</h2>
                <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                        <Link
                            key={t.name}
                            href={isStaff ? `/search?q=${t.name}` : `/positions?tag=${t.name}`}
                            style={{ fontSize: `${0.75 + Math.min(t.count, 10) * 0.05}rem` }}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                            prefetch = {false}
                        >
                            {t.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}