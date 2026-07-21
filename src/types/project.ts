export type Project = {
    id: string
    name: string
    periodStart: string | null
    periodEnd: string | null
    description: string
    version: number
    tags: { tag: { id: string; name: string } }[]
}