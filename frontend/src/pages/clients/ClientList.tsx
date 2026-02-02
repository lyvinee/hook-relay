import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { navigations } from '../../config/navigation';
import { useListClients } from '../../gen/client/clients/clients';
import { format } from 'date-fns';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { ClientResponseDto } from '../../gen/client/model';
import { DataTable } from '../../components/DataTable';
import { Plus } from 'lucide-react';

const ClientList = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isLoading, isError, error } = useListClients({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const clients = data?.data?.data || [];
    const meta = data?.data?.meta;

    const columns = useMemo<ColumnDef<ClientResponseDto>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            },
            {
                accessorKey: 'slugName',
                header: 'Slug',
                cell: ({ row }) => (
                    <span className="font-mono text-xs">{row.original.slugName}</span>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.createdAt ? format(new Date(row.original.createdAt as unknown as string), 'MMM d, yyyy HH:mm') : '-'}
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
                            navigate(navigations.clientView(row.original.clientId));
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
                <h1 className="text-2xl font-bold">Clients</h1>
                <button
                    onClick={() => navigate(navigations.createClient)}
                    className="btn btn-primary gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Client
                </button>
            </div>

            {isError && (
                <div className="alert alert-error mb-4">
                    <span>{error?.message || 'Failed to load clients'}</span>
                </div>
            )}

            <DataTable
                columns={columns}
                data={clients}
                pageCount={meta?.totalPages || -1}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ClientList;
