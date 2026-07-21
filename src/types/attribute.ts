export type Attribute = {
    id: string
    name: string
    category: string
    description: string
    dataType: string
    config: { options?: string[] }
    version: number
}