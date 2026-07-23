'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SetPasswordModal } from './SetPasswordModal'
import { ChangePasswordModal } from './ChangePasswordModal'

export function PasswordManager() {
    const [email, setEmail] = useState<string | null>(null)
    const [hasPassword, setHasPassword] = useState<boolean | null>(null)
    const [open, setOpen] = useState(false)

    const check = async () => {
        const { data } = await createClient().auth.getUser()
        setEmail(data.user?.email ?? null)
        const providers = data.user?.app_metadata?.providers as string[] | undefined
        setHasPassword(!!providers?.includes('email'))
    }

    useEffect(() => { check() }, [])

    const close = () => { setOpen(false); check() }

    if (hasPassword === null || !email) return null

    return (
        <>
            <button onClick={() => setOpen(true)} className="text-sm text-blue-600 dark:text-blue-400">
                {hasPassword ? 'Change password' : 'Set a password'}
            </button>
            {open && (hasPassword ? <ChangePasswordModal email={email} onClose={close} /> : <SetPasswordModal email={email} onClose={close} />)}
        </>
    )
}