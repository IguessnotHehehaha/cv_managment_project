import type { Attribute } from '@/types/attribute'

export type Position = {
    id: string
    title: string
    description: string
    company: string | null
    level: string | null
    visibility: string
    maxProjects: number
    projectTags: string[]
    version: number
    positionAttributes: { attribute: Attribute }[]
}