
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type OnChangeFn,
    type PaginationState,
} from '@tanstack/react-table';
import { Pagination } from './Pagination';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    onPaginationChange,
    isLoading = false,
}: DataTableProps<TData, TValue>) {

    // If pagination is controlled (passed in), use it. Otherwise, use internal state if needed (though standard usage usually involves controlling it for server-side)
    // For strictly client-side without control, we can omit pagination prop and let the table handle it internally.
    // However, specifically for server-side support, we often want manual pagination.

    const isServerSide = !!onPaginationChange;

    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount ?? -1, // -1 means unknown page count for server-side unless specified
        state: {
            pagination,
        },
        onPaginationChange: onPaginationChange,
        getCoreRowModel: getCoreRowModel(),
        // Only use built-in pagination model if we are NOT doing server-side pagination manually or if we want client-side features
        getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
        manualPagination: isServerSide, // Inform generic logic that we handle pagination externally
    });

    return (
        <div className="w-full space-y-4">
            <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table table-zebra w-full bg-base-100">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-base-200">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <th key={header.id} className="font-semibold text-sm">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center">
                                    <span className="loading loading-spinner loading-md"></span>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination table={table} />
        </div>
    );
}
