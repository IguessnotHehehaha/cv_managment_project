import { prisma } from '@/lib/prisma'

export class LikeService {
    async toggle(cvId: string, recruiterId: string) {
        const existing = await prisma.like.findUnique({ where: { cvId_recruiterId: { cvId, recruiterId } } })
        if (existing) {
            await prisma.like.delete({ where: { cvId_recruiterId: { cvId, recruiterId } } })
            return { liked: false }
        }
        await prisma.like.create({ data: { cvId, recruiterId } })
        return { liked: true }
    }

    async countAndStatus(cvId: string, recruiterId: string | null) {
        const count = await prisma.like.count({ where: { cvId } })
        const liked = recruiterId
            ? !!(await prisma.like.findUnique({ where: { cvId_recruiterId: { cvId, recruiterId } } }))
            : false
        return { count, liked }
    }
}

export const likeService = new LikeService()