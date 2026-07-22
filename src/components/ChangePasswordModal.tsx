'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export function ChangePasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
    const t = useTranslations('passwordManager')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const submit = async () => {
        setError(null)
        if (newPassword.length < 6) { setError(t('errors.newPasswordTooShort')); return }
        if (newPassword !== confirmPassword) { setError(t('errors.newPasswordsDontMatch')); return }

        setLoading(true)
        const supabase = createClient()

        const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: oldPassword })
        if (verifyError) {
            setError(t('errors.currentPasswordIncorrect'))
            setLoading(false)
            return
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
        setLoading(false)
        if (updateError) { setError(updateError.message); return }
        setSuccess(true)
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 dark:bg-gray-900">
                <h2 className="text-lg font-semibold">{t('changeTitle')}</h2>

                {success ? (
                    <>
                        <p className="text-sm text-green-600">{t('updateSuccess')}</p>
                        <button onClick={onClose} className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white">{t('close')}</button>
                    </>
                ) : (
                    <>
                        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                               placeholder={t('currentPasswordPlaceholder')}
                               className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                               placeholder={t('newPasswordPlaceholder')}
                               className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                               placeholder={t('confirmNewPasswordPlaceholder')}
                               className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm">{t('cancel')}</button>
                            <button onClick={submit} disabled={loading}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">
                                {loading ? t('updating') : t('updatePassword')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}