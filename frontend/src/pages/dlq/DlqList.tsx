import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useListWebhookDlq } from '../../gen/client/webhook-dlq/webhook-dlq';
import { format } from 'date-fns';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { WebhookDlqDto } from '../../gen/client/model';
import { DataTable } from '../../components/DataTable';
import { Eye } from 'lucide-react';

const DlqList = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isLoading } = useListWebhookDlq({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const dlqItems = data?.data?.data || [];
    const meta = data?.data?.meta;

    const columns = useMemo<ColumnDef<WebhookDlqDto>[]>(
        () => [
            {
                accessorKey: 'webhookDlqId',
                header: 'ID',
                cell: ({ row }) => (
                    <span className="font-mono text-xs">{row.original.webhookDlqId}</span>
                ),
            },
            {
                accessorKey: 'deliveryStatus',
                header: 'Status',
                cell: ({ row }) => (
                    <div className="badge badge-error badge-sm">
                        {row.original.deliveryStatus}
                    </div>
                ),
            },
            {
                accessorKey: 'deliveryAttempts',
                header: 'Attempts',
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
                        className="btn btn-ghost btn-xs gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/dlq/${row.original.webhookDlqId}`);
                        }}
                    >
                        <Eye className="w-4 h-4" />
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
                <h1 className="text-2xl font-bold">Dead Letter Queue</h1>
            </div>

            <DataTable
                columns={columns}
                data={dlqItems}
                pageCount={meta?.totalPages || -1}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
            />
        </div>
    );
};

export default DlqList;
