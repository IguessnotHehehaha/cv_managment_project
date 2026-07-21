import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { VersionConflictError, DuplicateNameError } from './errors'


export class AttributeService {
    async list(filters: { q?: string; category?: string }) {
        return prisma.attribute.findMany({
            where: {
                isActive: true,
                ...(filters.q && { name: { startsWith: filters.q, mode: 'insensitive' as const } }),
                ...(filters.category && { category: filters.category as never }),
            },
            orderBy: { name: 'asc' },
        })
    }

    async create(data: Prisma.AttributeCreateInput) {
        try {
            return await prisma.attribute.create({ data })
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new DuplicateNameError()
            }
            throw e
        }
    }


    async update(id: string, version: number, data: Omit<Prisma.AttributeUpdateInput, 'version'>) {
        const result = await prisma.attribute.updateMany({
            where: { id, version },
            data: { ...data, version: { increment: 1 } },
        })
        if (result.count === 0) throw new VersionConflictError()
    }

    async softDelete(id: string) {
        await prisma.attribute.update({ where: { id }, data: { isActive: false } })
    }
}

export const attributeService = new AttributeService()