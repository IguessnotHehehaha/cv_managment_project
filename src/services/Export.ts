import { prisma } from '@/lib/prisma'

function csvEscape(value: unknown): string {
    const str = value === null || value === undefined ? '' : String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export class ExportService {
    async positionCvsToCsv(positionId: string): Promise<string> {
        const position = await prisma.position.findUniqueOrThrow({
            where: { id: positionId },
            include: { positionAttributes: { include: { attribute: true }, orderBy: { sortOrder: 'asc' } } },
        })

        const cvs = await prisma.cv.findMany({
            where: { positionId, status: 'published' },
            include: { profile: true, _count: { select: { likes: true } } },
            orderBy: { updatedAt: 'desc' },
        })

        const attributeIds = position.positionAttributes.map((pa) => pa.attributeId)
        const values = await prisma.profileAttributeValue.findMany({
            where: { profileId: { in: cvs.map((c) => c.profileId) }, attributeId: { in: attributeIds } },
        })
        const valueMap = new Map(values.map((v) => [`${v.profileId}:${v.attributeId}`, v.value]))

        const headers = ['Name', 'Email', ...position.positionAttributes.map((pa) => pa.attribute.name), 'Likes', 'Last updated']
        const rows = cvs.map((cv) => [
            `${cv.profile.firstName} ${cv.profile.lastName}`,
            cv.profile.email ?? '',
            ...position.positionAttributes.map((pa) => {
                const raw = valueMap.get(`${cv.profileId}:${pa.attributeId}`)
                return raw === undefined || raw === null ? '' : String(raw)
            }),
            cv._count.likes,
            cv.updatedAt.toISOString().slice(0, 10),
        ])

        return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
    }
}

export const exportService = new ExportService()