import { notFound, redirect } from 'next/navigation'
import { getCachedClaims } from '@/lib/auth'
import { cvService } from '@/services/CvService'
import { ForbiddenError, NotFoundError } from '@/services/errors'
import { CvEditor } from './CvEditor'
import { CvReadOnlyView } from './CvReadOnlyView'
import type { CvRenderData } from '@/types/cv'

export default async function CvDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const claims = await getCachedClaims()
    if (!claims) redirect('/login')

    const isStaff = ['recruiter', 'admin'].includes(claims.user_role)
    const isAdmin = claims.user_role === 'admin'

    let data: CvRenderData
    try {
        data = await cvService.getRenderDataForViewer(id, claims.sub, isStaff, isAdmin)
    } catch (e) {
        if (e instanceof NotFoundError || e instanceof ForbiddenError) notFound()
        throw e
    }

    if (isStaff && !isAdmin) {
        const initiallyLiked = await cvService.getViewerLikeStatus(id, claims.sub)
        return <CvReadOnlyView data={data} initiallyLiked={initiallyLiked} />
    }

    const actingAsAdmin = isAdmin && data.cv.profileId !== claims.sub
    return <CvEditor initialData={data} adminTargetProfileId={actingAsAdmin ? data.cv.profileId : undefined} />
}