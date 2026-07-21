import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { VersionConflictError, NotFoundError } from './errors'


type ProjectInput = {
    name: string
    periodStart?: string
    periodEnd?: string
    description: string
    tags: string[]
}

export class ProjectService {
    async listForProfile(profileId: string) {
        return prisma.project.findMany({
            where: { profileId },
            include: { tags: { include: { tag: true } } },
            orderBy: { periodStart: 'desc' },
        })
    }

    private async resolveTagIds(tx: Prisma.TransactionClient, tagNames: string[]) {
        const ids: string[] = []
        for (const name of tagNames) {
            const trimmed = name.trim()
            if (!trimmed) continue
            const tag = await tx.projectTag.upsert({
                where: { name: trimmed },
                update: {},
                create: { name: trimmed },
            })
            ids.push(tag.id)
        }
        return ids
    }

    async create(profileId: string, input: ProjectInput) {
        return prisma.$transaction(async (tx) => {
            const tagIds = await this.resolveTagIds(tx, input.tags)
            return tx.project.create({
                data: {
                    profileId,
                    name: input.name,
                    periodStart: input.periodStart ? new Date(input.periodStart) : null,
                    periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
                    description: input.description,
                    tags: { create: tagIds.map((tagId) => ({ tagId })) },
                },
                include: { tags: { include: { tag: true } } },
            })
        })
    }

    async update(id: string, profileId: string, version: number, input: ProjectInput) {
        await prisma.$transaction(async (tx) => {
            const updated = await tx.project.updateMany({
                where: { id, profileId, version },
                data: {
                    name: input.name,
                    periodStart: input.periodStart ? new Date(input.periodStart) : null,
                    periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
                    description: input.description,
                    version: { increment: 1 },
                },
            })
            if (updated.count === 0) throw new VersionConflictError()

            const tagIds = await this.resolveTagIds(tx, input.tags)
            await tx.projectTagLink.deleteMany({ where: { projectId: id } })
            await tx.projectTagLink.createMany({ data: tagIds.map((tagId) => ({ projectId: id, tagId })) })
        })
    }

    async delete(id: string, profileId: string) {
        const result = await prisma.project.deleteMany({ where: { id, profileId } })
        if (result.count === 0) throw new NotFoundError()
    }

    async searchTags(prefix: string) {
        return prisma.projectTag.findMany({
            where: { name: { startsWith: prefix, mode: 'insensitive' } },
            take: 10,
            orderBy: { name: 'asc' },
        })
    }
}

export const projectService = new ProjectService()