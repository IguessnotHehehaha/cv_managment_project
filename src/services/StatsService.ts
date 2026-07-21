import { prisma } from '@/lib/prisma'

export class StatsService {
    async getHomeStats() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const [cvsLast24h, totalPositions, totalCandidates, totalRecruiters, totalCvs] = await Promise.all([
            prisma.cv.count({ where: { createdAt: { gte: oneDayAgo } } }),
            prisma.position.count(),
            prisma.profile.count({ where: { role: 'candidate' } }),
            prisma.profile.count({ where: { role: 'recruiter' } }),
            prisma.cv.count(),
        ])
        return { cvsLast24h, totalPositions, totalCandidates, totalRecruiters, totalCvs }
    }

    async getLatestPositions(limit = 5) {
        return prisma.position.findMany({ where: { visibility: 'public' }, orderBy: { updatedAt: 'desc' }, take: limit })
    }

    async getMostPopularPositions(limit = 5) {
        const grouped = await prisma.cv.groupBy({
            by: ['positionId'],
            where: { status: 'published' },
            _count: { positionId: true },
            orderBy: { _count: { positionId: 'desc' } },
            take: limit,
        })
        const positions = await prisma.position.findMany({ where: { id: { in: grouped.map((g) => g.positionId) } } })
        return grouped.map((g) => ({
            position: positions.find((p) => p.id === g.positionId)!,
            cvCount: g._count.positionId,
        }))
    }

    async getTagCloud(limit = 20) {
        const tags = await prisma.$queryRaw<{ name: string; count: bigint }[]>`
      select pt.name, count(*)::bigint as count
      from public.project_tag_links ptl
      join public.project_tags pt on pt.id = ptl.tag_id
      group by pt.name
      order by count desc
      limit ${limit}
    `
        return tags.map((t) => ({ name: t.name, count: Number(t.count) }))
    }
}

export const statsService = new StatsService()