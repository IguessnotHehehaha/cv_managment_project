import { getCachedClaims } from '@/lib/auth'
import { PositionsManageView } from './PositionsManageView'
import { PositionsBrowseView } from './PositionsBrowseView'

export default async function PositionsPage() {
    const claims = await getCachedClaims()
    const isStaff = !!claims && ['recruiter', 'admin'].includes(claims.user_role)
    return isStaff ? <PositionsManageView /> : <PositionsBrowseView />
}