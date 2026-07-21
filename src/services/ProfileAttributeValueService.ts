import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { toAttributeConfig } from '@/lib/attributeConfig'
import { validateAttributeValue } from '@/lib/attributeValidation'
import { VersionConflictError, ValidationError, NotFoundError } from './errors'
import { attributeUsageService } from './AttributeUsageService'

export class ProfileAttributeValueService {
    async listForProfile(profileId: string) {
        return prisma.profileAttributeValue.findMany({ where: { profileId }, include: { attribute: true } })
    }

    async upsertValue(profileId: string, attributeId: string, value: unknown, expectedVersion: number | null) {
        const attribute = await prisma.attribute.findUnique({ where: { id: attributeId } })
        if (!attribute) throw new NotFoundError('Attribute not found')

        const validationError = validateAttributeValue(attribute.dataType, toAttributeConfig(attribute.config), value)
        if (validationError) throw new ValidationError(validationError)

        if (expectedVersion === null) {
            try {
                const created = await prisma.profileAttributeValue.create({
                    data: { profileId, attributeId, value: value as Prisma.InputJsonValue, version: 1 },
                })
                await attributeUsageService.recordUsage(profileId, [attributeId])
                return created
            } catch {
                throw new VersionConflictError('This attribute was already added — refresh and try again')
            }
        }
        const result = await prisma.profileAttributeValue.updateMany({
            where: { profileId, attributeId, version: expectedVersion },
            data: { value: value as Prisma.InputJsonValue, version: { increment: 1 } },
        })
        if (result.count === 0) throw new VersionConflictError()
        return prisma.profileAttributeValue.findUniqueOrThrow({ where: { profileId_attributeId: { profileId, attributeId } } })
    }
    async removeAttribute(profileId: string, attributeId: string) {
        await prisma.profileAttributeValue.deleteMany({ where: { profileId, attributeId } })
    }
}

export const profileAttributeValueService = new ProfileAttributeValueService()