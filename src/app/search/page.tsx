import { searchService } from '@/services/SearchService'
import { getCachedClaims } from '@/lib/auth'
import Link from 'next/link'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    const claims = await getCachedClaims()
    const role = claims?.user_role ?? 'guest'
    const results = q ? await searchService.search(q, role) : { positions: [], candidates: [], cvs: [], posts: [] }

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6">
            <h1 className="text-xl font-semibold">Results for &#34;{q}&#34;</h1>

            {results.positions.length > 0 && (
                <div>
                    <h2 className="mb-2 font-medium">Positions</h2>
                    {results.positions.map((p) => (
                        <Link key={p.id} href={`/positions/${p.id}`} className="block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            {p.title}
                        </Link>
                    ))}
                </div>
            )}

            {results.candidates.length > 0 && (
                <div>
                    <h2 className="mb-2 font-medium">Candidates</h2>
                    {results.candidates.map((c) => (
                        <Link key={c.id} href={`/positions/candidates/${c.id}`} className="block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            {c.first_name} {c.last_name}
                        </Link>
                    ))}
                </div>
            )}

            {results.cvs.length > 0 && (
                <div>
                    <h2 className="mb-2 font-medium">CVs</h2>
                    {results.cvs.map((cv) => (
                        <Link key={cv.id} href={`/cvs/${cv.id}`} className="block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            {cv.first_name} {cv.last_name} — {cv.title} ({cv.like_count} likes)
                        </Link>
                    ))}
                </div>
            )}

            {results.posts.length > 0 && (
                <div>
                    <h2 className="mb-2 font-medium">Discussion posts</h2>
                    {results.posts.map((post) => (
                        <Link key={post.id} href={`/positions/${post.position_id}`} className="block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            {post.content.slice(0, 80)}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}