'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import type { User } from '@/types/user'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
    const queryClient = useQueryClient()
    const t = useTranslations('admin.users')
    const tCommon = useTranslations('common')
    const { data: users = [] } = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => (await fetch('/api/admin/users')).json() as Promise<User[]>,
    })

    const router = useRouter()

    const patchMutation = useMutation({
        mutationFn: async ({ id, body }: { id: string; body: Partial<Pick<User, 'role' | 'isBlocked'>> }) =>
            fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
    })

    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => Promise.all(ids.map((id) => fetch(`/api/admin/users/${id}`, { method: 'DELETE' }))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
    })

    const columns: ColumnDef<User>[] = [
        { accessorFn: (u) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—', header: t('columns.name') },
        { accessorKey: 'email', header: t('columns.email'), cell: (c) => c.getValue() ?? '—' },
        { accessorKey: 'role', header: t('columns.role') },
        { accessorKey: 'isBlocked', header: t('columns.status'), cell: ({ row }) => (row.original.isBlocked ? t('blocked') : t('active')) },
    ]

    return (
        <div className="mx-auto max-w-5xl space-y-4 p-6">
            <h1 className="text-xl font-semibold">{t('title')}</h1>
            <DataTable
                data={users}
                columns={columns}
                getRowId={(u) => u.id}
                onRowClick={(row) => router.push(`/positions/candidates/${row.id}`)}
                selectable
                toolbar={(selectedIds, clear) => {
                    const selectedUsers = users.filter((u) => selectedIds.includes(u.id))
                    const oneSelected = selectedUsers.length === 1 ? selectedUsers[0] : null
                    return (
                        <>
              <span className="text-sm text-gray-500">
                {selectedIds.length > 0 ? tCommon('selectedCount', { count: selectedIds.length }) : tCommon('noSelection')}
              </span>
                            {oneSelected && (
                                <select
                                    value={oneSelected.role}
                                    onChange={(e) => { patchMutation.mutate({ id: oneSelected.id, body: { role: e.target.value as User['role'] } }); }}
                                    className="rounded-lg border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <option value="candidate">{t('roleCandidate')}</option>
                                    <option value="recruiter">{t('roleRecruiter')}</option>
                                    <option value="admin">{t('roleAdmin')}</option>
                                </select>
                            )}
                            {oneSelected && (
                                <button
                                    onClick={() => patchMutation.mutate({ id: oneSelected.id, body: { isBlocked: !oneSelected.isBlocked } })}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-amber-600"
                                >
                                    {oneSelected.isBlocked ? t('unblock') : t('block')}
                                </button>
                            )}
                            <button
                                disabled={selectedIds.length === 0}
                                onClick={() => { deleteMutation.mutate(selectedIds); clear() }}
                                className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-30"
                            >
                                {tCommon('delete')}
                            </button>
                        </>
                    )
                }}
            />
        </div>
    )
}