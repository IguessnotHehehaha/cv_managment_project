'use client'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { OPERATORS_BY_TYPE } from '@/lib/attributeOperators'
import type { Attribute } from '@/types/attribute'

export type AccessRule = { attributeId: string; operator: string; value: string }

export function AccessRuleBuilder({ rules, onChange }: { rules: AccessRule[]; onChange: (r: AccessRule[]) => void }) {
    const t = useTranslations('accessRuleBuilder')
    const tCommon = useTranslations('common')
    const { data: attributes = [] } = useQuery({
        queryKey: ['attributes', 'all-for-rules'],
        queryFn: async () => (await fetch('/api/attributes')).json() as Promise<Attribute[]>,
    })

    const attrById = (id: string) => attributes.find((a) => a.id === id)

    const addRule = () => {
        if (attributes.length === 0) return
        const first = attributes[0]
        onChange([...rules, { attributeId: first.id, operator: OPERATORS_BY_TYPE[first.dataType]?.[0]?.value ?? 'eq', value: '' }])
    }
    const updateRule = (i: number, patch: Partial<AccessRule>) => {
        const next = [...rules]
        next[i] = { ...next[i], ...patch }
        onChange(next)
    }
    const removeRule = (i: number) => onChange(rules.filter((_, idx) => idx !== i))

    return (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {t('hint')}
            </p>

            {rules.map((rule, i) => {
                const attr = attrById(rule.attributeId)
                const operators = attr ? OPERATORS_BY_TYPE[attr.dataType] ?? [] : []
                return (
                    <div key={i} className="flex-col sm:flex-row gap-2">
                        <select
                            value={rule.attributeId}
                            onChange={(e) => {
                                const newAttr = attrById(e.target.value)
                                updateRule(i, { attributeId: e.target.value, operator: newAttr ? OPERATORS_BY_TYPE[newAttr.dataType]?.[0]?.value ?? 'eq' : 'eq' })
                            }}
                            className="flex-1 rounded-lg border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            {attributes.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>

                        <select value={rule.operator} onChange={(e) => updateRule(i, { operator: e.target.value })}
                                className="w-28 rounded-lg border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
                            {operators.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                        </select>

                        {attr?.dataType === 'dropdown' ? (
                            <select value={rule.value} onChange={(e) => updateRule(i, { value: e.target.value })}
                                    className="flex-1 rounded-lg border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
                                <option value="">{tCommon('choose')}</option>
                                {(attr.config?.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : attr?.dataType === 'boolean' ? (
                            <select value={rule.value} onChange={(e) => updateRule(i, { value: e.target.value })}
                                    className="flex-1 rounded-lg border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
                                <option value="true">{t('checked')}</option>
                                <option value="false">{t('unchecked')}</option>
                            </select>
                        ) : (
                            <input value={rule.value} onChange={(e) => updateRule(i, { value: e.target.value })} placeholder={t('valuePlaceholder')}
                                   className="flex-1 rounded-lg border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        )}

                        <button type="button" onClick={() => removeRule(i)} className="text-red-500">×</button>
                    </div>
                )
            })}

            <button type="button" onClick={addRule} className="text-sm text-blue-600">{t('addRule')}</button>
        </div>
    )
}