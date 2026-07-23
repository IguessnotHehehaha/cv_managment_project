import { useEffect, useRef } from 'react'

export function useAutoSave<T>(
    value: T,
    onSave: (value: T) => Promise<void>,
    options?: { intervalMs?: number; enabled?: boolean }
) {
    const { intervalMs = 7000, enabled = true } = options ?? {}
    const valueRef = useRef(value)
    const onSaveRef = useRef(onSave)
    const lastSavedRef = useRef(value)
    const savingRef = useRef(false)
    const wasEnabled = useRef(enabled)

    useEffect(() => { valueRef.current = value }, [value])
    useEffect(() => { onSaveRef.current = onSave }, [onSave])

    useEffect(() => {
        if (enabled && !wasEnabled.current) lastSavedRef.current = value
        wasEnabled.current = enabled
    }, [enabled, value])

    useEffect(() => {
        if (!enabled) return
        const interval = setInterval(async () => {
            if (savingRef.current) return
            const current = valueRef.current
            if (JSON.stringify(current) === JSON.stringify(lastSavedRef.current)) return
            savingRef.current = true
            try {
                await onSaveRef.current(current)
                lastSavedRef.current = current
            } finally {
                savingRef.current = false
            }
        }, intervalMs)
        return () => clearInterval(interval)
    }, [intervalMs, enabled])
}