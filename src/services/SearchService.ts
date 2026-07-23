import { prisma } from '@/lib/prisma'

type PositionResult = { id: string; title: string; company: string | null }
type CandidateResult = { id: string; first_name: string; last_name: string }
type CvResult = { id: string; first_name: string; last_name: string; title: string; like_count: bigint }
type PostResult = { id: string; position_id: string; content: string }

export class SearchService {
    async search(query: string, viewerRole: 'guest' | 'candidate' | 'recruiter' | 'admin') {
        const isStaff = viewerRole === 'recruiter' || viewerRole === 'admin'

        const positions = await prisma.$queryRaw<PositionResult[]>`
            select * from public.search_positions(${query}, ${isStaff})
        `
        if (!isStaff) return { positions, candidates: [], cvs: [], posts: [] }

        const candidates = await prisma.$queryRaw<CandidateResult[]>`select * from public.search_candidates(${query})`
        const cvsRaw = await prisma.$queryRaw<CvResult[]>`select * from public.search_cvs(${query})`
        const cvs = cvsRaw.map((c) => ({ ...c, like_count: Number(c.like_count) }))
        const posts = await prisma.$queryRaw<PostResult[]>`select * from public.search_posts(${query})`

        return { positions, candidates, cvs, posts }
    }
}

export const searchService = new SearchService()