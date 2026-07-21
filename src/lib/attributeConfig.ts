export type AttributeConfig = {
    options?: string[]
    maxLength?: number
    regex?: string
    min?: number
    max?: number
}

export function toAttributeConfig(raw: unknown): AttributeConfig {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const r = raw as Record<string, unknown>
    const config: AttributeConfig = {}
    if (Array.isArray(r.options) && r.options.every((o) => typeof o === 'string')) config.options = r.options
    if (typeof r.maxLength === 'number') config.maxLength = r.maxLength
    if (typeof r.regex === 'string') config.regex = r.regex
    if (typeof r.min === 'number') config.min = r.min
    if (typeof r.max === 'number') config.max = r.max
    return config
}