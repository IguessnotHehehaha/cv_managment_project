import { prisma } from '@/lib/prisma'
import { VersionConflictError } from './errors'

export class ProfileService {
    async getById(id: string) {
        return prisma.profile.findUnique({ where: { id } })
    }

    async updateMe(id: string, version: number, data: { firstName: string; lastName: string; location?: string; avatarUrl?: string }) {
        const result = await prisma.profile.updateMany({
            where: { id, version },
            data: { ...data, version: { increment: 1 } },
        })
        if (result.count === 0) throw new VersionConflictError()
        return prisma.profile.findUniqueOrThrow({ where: { id } })
    }
}

export const profileService = new ProfileService()