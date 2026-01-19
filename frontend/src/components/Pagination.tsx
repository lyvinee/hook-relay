
import { type Table } from '@tanstack/react-table';

interface PaginationProps<TData> {
    table: Table<TData>;
    className?: string;
    showPageSize?: boolean;
}

export function Pagination<TData>({
    table,
    className = '',
    showPageSize = true,
}: PaginationProps<TData>) {
    return (
        <div className={`flex items-center justify-between px-2 ${className}`}>
            {/* Page Size Selector */}
            {showPageSize && (
                <div className="flex items-center gap-2">
                    <span className="text-sm">Rows per page:</span>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value));
                        }}
                        className="select select-bordered select-sm w-20"
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm mr-4">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount().toLocaleString()}
                    </strong>
                </span>

                <div className="join">
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        «
                    </button>
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        ‹
                    </button>
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        ›
                    </button>
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        »
                    </button>
                </div>
            </div>
        </div>
    );
}
