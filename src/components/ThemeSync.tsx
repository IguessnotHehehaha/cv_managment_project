'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'

export function ThemeSync() {
    const { setTheme } = useTheme()
    const applied = useRef(false)
    const { data } = useQuery({
        queryKey: ['profile', 'theme-pref'],
        queryFn: async () => {
            const res = await fetch('/api/profile')
            return res.ok ? res.json() : null
        },
        staleTime: Infinity,
    })

    useEffect(() => {
        if (data?.theme && !applied.current) {
            setTheme(data.theme)
            applied.current = true
        }
    }, [data, setTheme])

    return null
}