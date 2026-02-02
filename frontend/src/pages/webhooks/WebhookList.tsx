import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { navigations } from '../../config/navigation';
import { useListWebhooks } from '../../gen/client/webhooks/webhooks';
import { format } from 'date-fns';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { WebhookDto } from '../../gen/client/model';
import { DataTable } from '../../components/DataTable';

const WebhookList = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isLoading } = useListWebhooks({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const webhooks = data?.data?.data || [];
    const meta = data?.data?.meta;

    const columns = useMemo<ColumnDef<WebhookDto>[]>(
        () => [
            {
                accessorKey: 'endpointName',
                header: 'Name',
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.endpointName}</span>
                ),
            },
            {
                accessorKey: 'targetUrl',
                header: 'Target URL',
                cell: ({ row }) => (
                    <span className="font-mono text-xs max-w-xs truncate block" title={row.original.targetUrl}>
                        {row.original.targetUrl}
                    </span>
                ),
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                cell: ({ row }) => (
                    row.original.isActive ? (
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
                            navigate(navigations.webhook(row.original.webhookId));
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
                <h1 className="text-2xl font-bold">Webhooks</h1>
                <button
                    onClick={() => navigate(navigations.createWebhook)}
                    className="btn btn-primary"
                >
                    Create Webhook
                </button>
            </div>

            <DataTable
                columns={columns}
                data={webhooks}
                pageCount={meta?.totalPages || -1}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
            />
        </div>
    );
};

export default WebhookList;
