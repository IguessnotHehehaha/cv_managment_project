import type { Attribute } from './attribute'

export type ValueRow = {
    attributeId: string
    value: unknown
    version: number
    attribute: Attribute
}