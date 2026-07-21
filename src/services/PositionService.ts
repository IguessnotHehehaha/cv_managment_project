import { prisma } from '@/lib/prisma'
import { VersionConflictError, NotFoundError, ForbiddenError } from './errors'
import { attributeUsageService } from './AttributeUsageService'

type PositionInput = {
    title: string
    description: string
    company?: string
    level?: 'junior' | 'middle' | 'senior' | 'c_level'
    visibility: 'public' | 'restricted'
    maxProjects: number
    projectTags: string[]
    attributeIds: string[]
}

export class PositionService {
    async list(options: { includeRestricted: boolean }) {
        return prisma.position.findMany({
            where: options.includeRestricted ? {} : { visibility: 'public' },
            include: { positionAttributes: { include: { attribute: true } } },
            orderBy: { updatedAt: 'desc' },
        })
    }

    async getById(id: string) {
        const position = await prisma.position.findUnique({
            where: { id },
            include: { positionAttributes: { include: { attribute: true } } },
        })
        if (!position) throw new NotFoundError()
        return position
    }

    async create(input: PositionInput, actingProfileId: string) {
        const { attributeIds, ...data } = input
        const position = await prisma.position.create({
            data: { ...data, positionAttributes: { create: attributeIds.map((attributeId, sortOrder) => ({ attributeId, sortOrder })) } },
        })
        await attributeUsageService.recordUsage(actingProfileId, attributeIds)
        return position
    }

    async update(id: string, version: number, input: PositionInput, actingProfileId: string) {
        const { attributeIds, ...data } = input
        await prisma.$transaction(async (tx) => {
            const updated = await tx.position.updateMany({ where: { id, version }, data: { ...data, version: { increment: 1 } } })
            if (updated.count === 0) throw new VersionConflictError()
            await tx.positionAttribute.deleteMany({ where: { positionId: id } })
            await tx.positionAttribute.createMany({ data: attributeIds.map((attributeId, sortOrder) => ({ positionId: id, attributeId, sortOrder })) })
        })
        await attributeUsageService.recordUsage(actingProfileId, attributeIds)
    }

    async duplicate(id: string) {
        const original = await prisma.position.findUnique({
            where: { id },
            include: { positionAttributes: true },
        })
        if (!original) throw new NotFoundError()

        return prisma.position.create({
            data: {
                title: `${original.title} (copy)`,
                description: original.description,
                company: original.company,
                level: original.level,
                visibility: original.visibility,
                maxProjects: original.maxProjects,
                projectTags: original.projectTags,
                positionAttributes: {
                    create: original.positionAttributes.map((pa) => ({
                        attributeId: pa.attributeId,
                        sortOrder: pa.sortOrder,
                    })),
                },
            },
        })
    }

    async delete(id: string) {
        const cvCount = await prisma.cv.count({ where: { positionId: id } })
        if (cvCount > 0) throw new ForbiddenError('Cannot delete a position with submitted CVs')
        await prisma.position.delete({ where: { id } })
    }
}

export const positionService = new PositionService()