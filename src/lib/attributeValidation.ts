import type { AttributeConfig } from './attributeConfig'

export function validateAttributeValue(dataType: string, config: AttributeConfig, value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null

    switch (dataType) {
        case 'string':
        case 'text': {
            const str = String(value)
            if (config.maxLength && str.length > config.maxLength) return `Must be ${config.maxLength} characters or fewer`
            if (config.regex) {
                try {
                    if (!new RegExp(config.regex).test(str)) return 'Does not match the required format'
                } catch {}
            }
            return null
        }
        case 'numeric': {
            const num = Number(value)
            if (Number.isNaN(num)) return 'Must be a number'
            if (config.min !== undefined && num < config.min) return `Must be at least ${config.min}`
            if (config.max !== undefined && num > config.max) return `Must be at most ${config.max}`
            return null
        }
        default:
            return null
    }
}