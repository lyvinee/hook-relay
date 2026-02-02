import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useListWebhookDeliveries } from '../../gen/client/webhook-deliveries/webhook-deliveries';
import { format } from 'date-fns';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '../../components/DataTable';
import { navigations } from '../../config/navigation';
import type { WebhookDeliveryDto } from '../../gen/client/model';

const DeliveryList = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: response, isLoading } = useListWebhookDeliveries({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const deliveries = response?.data?.data || [];
    const meta = response?.data?.meta;

    const columns = useMemo<ColumnDef<WebhookDeliveryDto>[]>(
        () => [
            {
                accessorKey: 'webhookDeliveryId',
                header: 'Delivery ID',
                cell: ({ row }) => (
                    <span className="font-mono text-xs max-w-[150px] truncate block" title={row.original.webhookDeliveryId}>
                        {row.original.webhookDeliveryId}
                    </span>
                ),
            },
            {
                accessorKey: 'deliveryStatus',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.original.deliveryStatus;
                    let badgeClass = 'badge-ghost';
                    if (status === 'success') badgeClass = 'badge-success';
                    else if (status === 'failed') badgeClass = 'badge-error';
                    else if (status === 'pending') badgeClass = 'badge-warning';
                    else if (status === 'dlq') badgeClass = 'badge-error badge-outline';

                    return (
                        <div className={`badge ${badgeClass} gap-2`}>
                            {status.toUpperCase()}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'statusCode',
                header: 'Status Code',
                cell: ({ row }) => (
                    <span className={`font-mono text-sm ${Number(row.original.statusCode || 0) >= 400 ? 'text-error' : 'text-success'}`}>
                        {String(row.original.statusCode || '-')}
                    </span>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.createdAt ? format(new Date(row.original.createdAt), 'MMM d, yyyy HH:mm:ss') : '-'}
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
                            navigate(navigations.delivery(row.original.webhookDeliveryId));
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-content">Webhook Deliveries</h1>
                    <p className="text-base-content/60 mt-2">
                        View history of webhook delivery attempts
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={deliveries}
                pageCount={meta?.totalPages || -1}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
            />
        </div>
    );
};

export default DeliveryList;
