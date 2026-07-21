export const OPERATORS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
    numeric: [
        { value: 'gt', label: '>' },
        { value: 'gte', label: '≥' },
        { value: 'lt', label: '<' },
        { value: 'lte', label: '≤' },
        { value: 'eq', label: '=' },
    ],
    boolean: [{ value: 'eq', label: 'is' }],
    dropdown: [{ value: 'eq', label: 'equals' }],
    date: [
        { value: 'before', label: 'before' },
        { value: 'after', label: 'after' },
    ],
    string: [{ value: 'contains', label: 'contains' }],
    text: [{ value: 'contains', label: 'contains' }],
    period: [{ value: 'contains', label: 'overlaps' }],
    image: [],
}