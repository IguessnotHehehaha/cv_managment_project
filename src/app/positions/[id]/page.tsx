import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getCachedClaims } from '@/lib/auth'
import { accessRuleService } from '@/services/AccessRuleService'
import { Discussion } from '@/components/Discussion'
import {PositionCvList} from "@/components/PositionCvList";

export default async function PositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const t = await getTranslations('positions.detail')

    const position = await prisma.position.findUnique({
        where: { id },
        include: { positionAttributes: { include: { attribute: true } } },
    })
    if (!position) notFound()

    const claims = await getCachedClaims()
    const isStaff = !!claims && ['recruiter', 'admin'].includes(claims.user_role)

    if (position.visibility === 'restricted') {
        const hasAccess = isStaff || (!!claims && (await accessRuleService.candidateHasAccess(claims.sub, position.id)))
        if (!hasAccess) notFound()
    }

    return (
        <div className="mx-auto max-w-3xl space-y-4 p-6">
            <h1 className="text-2xl font-semibold">{position.title}</h1>
            {position.company && (
                <p className="text-gray-500">{position.company}{position.level ? ` · ${position.level}` : ''}</p>
            )}
            <p>{position.description}</p>
            <div>
                <h2 className="mb-2 font-medium">{t('whatThisRoleLooksAt')}</h2>
                <ul className="list-inside list-disc text-sm text-gray-600 dark:text-gray-300">
                    {position.positionAttributes.map((pa) => <li key={pa.attributeId}>{pa.attribute.name}</li>)}
                </ul>
            </div>
            <div>
                <h2 className="mb-2 font-medium">{t('discussion')}</h2>
                <Discussion positionId={position.id} isStaff={isStaff} />
            </div>
            {isStaff && <PositionCvList positionId={position.id} />}
        </div>
    )
}