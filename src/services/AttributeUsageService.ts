import { prisma } from '@/lib/prisma'

export class AttributeUsageService {
    async recordUsage(profileId: string, attributeIds: string[]) {
        if (attributeIds.length === 0) return
        await prisma.$transaction(
            attributeIds.map((attributeId) =>
                prisma.attributeUsage.upsert({
                    where: { profileId_attributeId: { profileId, attributeId } },
                    update: { lastUsedAt: new Date() },
                    create: { profileId, attributeId, lastUsedAt: new Date() },
                })
            )
        )
    }

    async listRecentlyUsed(profileId: string, limit = 8) {
        const usages = await prisma.attributeUsage.findMany({
            where: { profileId, attribute: { isActive: true } },
            include: { attribute: true },
            orderBy: { lastUsedAt: 'desc' },
            take: limit,
        })
        return usages.map((u) => u.attribute)
    }
}

export const attributeUsageService = new AttributeUsageService()