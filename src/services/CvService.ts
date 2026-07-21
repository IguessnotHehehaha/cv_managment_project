import { prisma } from '@/lib/prisma'
import { accessRuleService } from './AccessRuleService'
import { toAttributeConfig } from '@/lib/attributeConfig'
import { NotFoundError, ForbiddenError, DuplicateError } from './errors'
import type { CvRenderData } from '@/types/cv'

export class CvService {
    async create(profileId: string, positionId: string) {
        const position = await prisma.position.findUnique({ where: { id: positionId } })
        if (!position) throw new NotFoundError('Position not found')

        if (position.visibility === 'restricted') {
            const hasAccess = await accessRuleService.candidateHasAccess(profileId, positionId)
            if (!hasAccess) throw new ForbiddenError('You do not have access to this position')
        }

        const existing = await prisma.cv.findUnique({
            where: { profileId_positionId: { profileId, positionId } },
        })
        if (existing) throw new DuplicateError('You already have a CV for this position')

        return prisma.cv.create({ data: { profileId, positionId }, include: { position: true } })
    }

    async listForProfile(profileId: string) {
        const cvs = await prisma.cv.findMany({ where: { profileId }, include: { position: true }, orderBy: { updatedAt: 'desc' } })
        const filtered = await Promise.all(cvs.map(async (cv) => {
            if (cv.position.visibility !== 'restricted') return cv
            const hasAccess = await accessRuleService.candidateHasAccess(profileId, cv.positionId)
            return hasAccess ? cv : null
        }))
        return filtered.filter((cv): cv is NonNullable<typeof cv> => cv !== null)
    }

    async listForPosition(positionId: string, includeUnpublished: boolean) {
        return prisma.cv.findMany({
            where: { positionId, ...(includeUnpublished ? {} : { status: 'published' }) },
            include: { profile: true, _count: { select: { likes: true } } },
            orderBy: { updatedAt: 'desc' },
        })
    }


    async getRenderData(cvId: string, requesterId: string): Promise<CvRenderData> {
        const cv = await prisma.cv.findUnique({ where: { id: cvId } })
        if (!cv) throw new NotFoundError()
        if (cv.profileId !== requesterId) throw new ForbiddenError()
        return this.getRenderDataUnchecked(cvId)
    }

    async getRenderDataForViewer(cvId: string, viewerId: string, isStaff: boolean, isAdmin: boolean): Promise<CvRenderData> {
        const cv = await prisma.cv.findUnique({ where: { id: cvId } })
        if (!cv) throw new NotFoundError()

        const isOwner = cv.profileId === viewerId
        if (!isOwner && !isStaff) throw new ForbiddenError()
        if (!isOwner && isStaff && !isAdmin && cv.status !== 'published') throw new ForbiddenError('Not yet published')

        return this.getRenderDataUnchecked(cvId)
    }

    private async getRenderDataUnchecked(cvId: string): Promise<CvRenderData> {
        const likeCount = await prisma.like.count({ where: { cvId } })
        const cv = await prisma.cv.findUniqueOrThrow({
            where: { id: cvId },
            include: { position: { include: { positionAttributes: { include: { attribute: true }, orderBy: { sortOrder: 'asc' } } } } },
        })

        if (cv.position.visibility === 'restricted') {
            const stillHasAccess = await accessRuleService.candidateHasAccess(cv.profileId, cv.positionId)
            if (!stillHasAccess) throw new NotFoundError('This position is no longer accessible')
        }

        const attributeIds = cv.position.positionAttributes.map((pa) => pa.attributeId)
        const values = await prisma.profileAttributeValue.findMany({
            where: { profileId: cv.profileId, attributeId: { in: attributeIds } },
        })
        const valueMap = new Map(values.map((v) => [v.attributeId, v]))

        const attributeRows = cv.position.positionAttributes.map((pa) => {
            const stored = valueMap.get(pa.attributeId)
            return {
                attribute: { ...pa.attribute, config: toAttributeConfig(pa.attribute.config) },
                value: stored?.value ?? null,
                version: stored?.version ?? null,
            }
        })

        const allProjects = await prisma.project.findMany({
            where: { profileId: cv.profileId },
            include: { tags: { include: { tag: true } } },
            orderBy: { periodStart: 'desc' },
        })
        const relevant = cv.position.projectTags.length > 0
            ? allProjects.filter((p) => p.tags.some((t) => cv.position.projectTags.includes(t.tag.name)))
            : allProjects
        const projects = relevant.slice(0, cv.position.maxProjects)

        const isComplete = attributeRows.every((r) => r.value !== null && r.value !== '')

        return {
            cv: { id: cv.id, profileId: cv.profileId, status: cv.status, position: { title: cv.position.title, company: cv.position.company } },
            attributeRows, projects, isComplete, likeCount
        }
    }

    async publish(cvId: string, profileId: string) {
        const { isComplete } = await this.getRenderData(cvId, profileId)
        if (!isComplete) throw new ForbiddenError('Fill in every attribute before publishing')

        const result = await prisma.cv.updateMany({ where: { id: cvId, profileId }, data: { status: 'published' } })
        if (result.count === 0) throw new NotFoundError()
    }

    async unpublish(cvId: string, profileId: string) {
        const result = await prisma.cv.updateMany({ where: { id: cvId, profileId }, data: { status: 'draft' } })
        if (result.count === 0) throw new NotFoundError()
    }

    async getViewerLikeStatus(cvId: string, viewerId: string) {
        const like = await prisma.like.findUnique({ where: { cvId_recruiterId: { cvId, recruiterId: viewerId } } })
        return !!like
    }

    async delete(cvId: string, profileId: string) {
        const result = await prisma.cv.deleteMany({ where: { id: cvId, profileId } })
        if (result.count === 0) throw new NotFoundError()
    }
}

export const cvService = new CvService()