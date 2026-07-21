'use client'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type RowSelectionState,
    type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

type DataTableProps<T> = {
    data: T[]
    columns: ColumnDef<T>[]
    getRowId: (row: T) => string
    onRowClick?: (row: T) => void
    toolbar?: (selectedIds: string[], clearSelection: () => void) => React.ReactNode
    selectable?: boolean
}

export function DataTable<T>({ data, columns, getRowId, onRowClick, toolbar, selectable = true }: DataTableProps<T>) {
    const t = useTranslations('dataTable')
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getRowId,
        state: { rowSelection, sorting },
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableRowSelection: selectable,
    })

    const selectedIds = Object.keys(rowSelection)

    return (
        <div className="space-y-2">
            {toolbar && selectable && (
                <div className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
                    {toolbar(selectedIds, () => setRowSelection({}))}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        {selectable && (
                        <th className="w-10 px-3 py-2">
                            <input
                                type="checkbox"
                                checked={table.getIsAllRowsSelected()}
                                onChange={table.getToggleAllRowsSelectedHandler()}
                            />
                        </th>
                        )}
                        {table.getFlatHeaders().map((header) => (
                            <th
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className="cursor-pointer select-none px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                        >
                            {selectable && (
                            <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={row.getIsSelected()}
                                    onChange={row.getToggleSelectedHandler()}
                                />
                            </td>
                            )}
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="cursor-pointer px-3 py-2 text-gray-800 dark:text-gray-200"
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {table.getRowModel().rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-gray-400">
                                {t('noResults')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}