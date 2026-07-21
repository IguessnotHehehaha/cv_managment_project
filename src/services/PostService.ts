import { prisma } from '@/lib/prisma'
import {ForbiddenError} from "@/services/errors";

export class PostService {
    async listForPosition(positionId: string) {
        return prisma.post.findMany({
            where: { positionId },
            include: { author: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { createdAt: 'asc' },
        })
    }

    async create(positionId: string, authorId: string, content: string) {
        return prisma.post.create({
            data: { positionId, authorId, content },
            include: { author: { select: { id: true, firstName: true, lastName: true } } },
        })
    }

    async update(id: string, authorId: string, content: string) {
        const result = await prisma.post.updateMany({ where: { id, authorId }, data: { content } })
        if (result.count === 0) throw new ForbiddenError()
    }

    async delete(id: string, requesterId: string, isAdmin: boolean) {
        const result = await prisma.post.deleteMany({ where: { id, ...(isAdmin ? {} : { authorId: requesterId }) } })
        if (result.count === 0) throw new ForbiddenError()
    }
}

export const postService = new PostService()