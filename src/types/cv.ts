import type { Attribute } from './attribute'

export type CvAttributeRow = {
    attribute: Attribute
    value: unknown
    version: number | null
}

export type CvProject = {
    id: string
    name: string
    tags: { tag: { id: string; name: string } }[]
}

export type CvRenderData = {
    cv: { id: string; profileId: string; status: string; position: { title: string; company: string | null } }
    attributeRows: CvAttributeRow[]
    projects: CvProject[]
    isComplete: boolean
    likeCount: number
}