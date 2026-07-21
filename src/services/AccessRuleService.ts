import { prisma } from '@/lib/prisma'

export class AccessRuleService {
    async listForPosition(positionId: string) {
        return prisma.positionAccessRule.findMany({ where: { positionId } })
    }

    async replaceForPosition(positionId: string, rules: { attributeId: string; operator: string; value: string }[]) {
        await prisma.positionAccessRule.deleteMany({ where: { positionId } })
        if (rules.length > 0) {
            await prisma.positionAccessRule.createMany({ data: rules.map((r) => ({ positionId, ...r })) })
        }
    }

    async candidateHasAccess(profileId: string, positionId: string): Promise<boolean> {
        const rules = await this.listForPosition(positionId)
        if (rules.length === 0) return false

        const values = await prisma.profileAttributeValue.findMany({
            where: { profileId, attributeId: { in: rules.map((r) => r.attributeId) } },
        })
        const valueMap = new Map(values.map((v) => [v.attributeId, v.value]))

        return rules.every((rule) => {
            const actual = valueMap.get(rule.attributeId)
            if (actual === undefined || actual === null) return false
            return this.evaluate(rule.operator, actual, rule.value)
        })
    }

    private evaluate(operator: string, actual: unknown, expected: string): boolean {
        switch (operator) {
            case 'gt': return Number(actual) > Number(expected)
            case 'gte': return Number(actual) >= Number(expected)
            case 'lt': return Number(actual) < Number(expected)
            case 'lte': return Number(actual) <= Number(expected)
            case 'eq': return String(actual) === expected
            case 'before': return new Date(actual as string) < new Date(expected)
            case 'after': return new Date(actual as string) > new Date(expected)
            case 'contains': return String(actual).toLowerCase().includes(expected.toLowerCase())
            default: return false
        }
    }
}

export const accessRuleService = new AccessRuleService()