import { useEffect, useRef } from 'react'

export function useAutoSave<T>(value: T, onSave: (value: T) => Promise<void>, intervalMs = 7000) {
    const valueRef = useRef(value)
    const lastSavedRef = useRef(value)
    const savingRef = useRef(false)

    useEffect(() => { valueRef.current = value }, [value])

    useEffect(() => {
        const interval = setInterval(async () => {
            if (savingRef.current) return
            const current = valueRef.current
            if (JSON.stringify(current) === JSON.stringify(lastSavedRef.current)) return
            savingRef.current = true
            try {
                await onSave(current)
                lastSavedRef.current = current
            } finally {
                savingRef.current = false
            }
        }, intervalMs)
        return () => clearInterval(interval)
    }, [intervalMs, onSave])
}