'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SetPasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const submit = async () => {
        setError(null)
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }

        setLoading(true)
        const { error: updateError } = await createClient().auth.updateUser({ password: newPassword })
        setLoading(false)
        if (updateError) { setError(updateError.message); return }
        setSuccess(true)
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 dark:bg-gray-900">
                <h2 className="text-lg font-semibold">Set a password</h2>

                {success ? (
                    <>
                        <p className="text-sm text-green-600">Password set. You can now also sign in with {email} and this password.</p>
                        <button onClick={onClose} className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white">Close</button>
                    </>
                ) : (
                    <>
                        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                            Your account currently only signs in via Google/GitHub. Setting a password lets you also sign in directly with your email.
                        </p>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                               placeholder="New password"
                               className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                               placeholder="Confirm password"
                               className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm">Cancel</button>
                            <button onClick={submit} disabled={loading}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">
                                {loading ? 'Saving...' : 'Set password'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}