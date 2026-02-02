import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { navigations } from '../../../config/navigation';
import { useListUsers } from '../../../gen/client/users/users';
import { format } from 'date-fns';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { UserResponseDto } from '../../../gen/client/model';
import { DataTable } from '../../../components/DataTable';

const UserList = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: response, isLoading } = useListUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    // Temporary type assertion until client is regenerated
    const data = response as any;
    const users = data?.data?.data || [];
    const meta = data?.data?.meta;

    const columns = useMemo<ColumnDef<UserResponseDto>[]>(
        () => [
            {
                accessorKey: 'email',
                header: 'Email',
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.email}</span>
                ),
            },
            {
                accessorKey: 'role',
                header: 'Role',
                cell: ({ row }) => (
                    <div className="badge badge-neutral badge-sm capitalize">
                        {row.original.role}
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    row.original.status === 'active' ? (
                        <div className="badge badge-success badge-sm gap-2">
                            Active
                        </div>
                    ) : (
                        <div className="badge badge-error badge-sm gap-2">
                            Inactive
                        </div>
                    )
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.createdAt ? format(new Date(row.original.createdAt), 'MMM d, yyyy HH:mm') : '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <button
                        className="btn btn-ghost btn-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(navigations.user(row.original.userId));
                        }}
                    >
                        View
                    </button>
                ),
            },
        ],
        [navigate]
    );

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <button
                    onClick={() => navigate(navigations.createUser)}
                    className="btn btn-primary"
                >
                    Create User
                </button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                pageCount={meta?.totalPages || -1}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UserList;
