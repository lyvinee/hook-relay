import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTopicsControllerFindAll } from '../../gen/client/topics/topics';
import { format } from 'date-fns';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '../../components/DataTable';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { navigations } from '../../config/navigation';
import type { TopicDto } from '../../gen/client/model';

const TopicList = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Fetch all topics
    const { data: response, isLoading } = useTopicsControllerFindAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const topics = response?.data?.data || [];
    const meta = response?.data?.meta;

    const columns = useMemo<ColumnDef<TopicDto>[]>(
        () => [
            {
                accessorKey: 'topicName',
                header: 'Name',
                cell: ({ row }) => (
                    <span className="font-medium text-base-content">
                        {row.original.topicName}
                    </span>
                ),
            },
            {
                accessorKey: 'topicSlugId',
                header: 'Key',
                cell: ({ row }) => (
                    <span className="font-mono text-xs bg-base-200 px-2 py-1 rounded">
                        {row.original.topicSlugId}
                    </span>
                ),
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                cell: ({ row }) => (
                    <div className={`badge ${row.original.isActive ? 'badge-success' : 'badge-ghost'} gap-2`}>
                        {row.original.isActive ? 'Active' : 'Inactive'}
                    </div>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.createdAt ? format(new Date(row.original.createdAt), 'MMM d, yyyy') : '-'}
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
                            navigate(navigations.topic(row.original.topicId));
                        }}
                    >
                        View/Edit
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
                    <h1 className="text-3xl font-bold tracking-tight text-base-content">Topics</h1>
                    <p className="text-base-content/60 mt-2">
                        Manage event topics
                    </p>
                </div>
                <Link to={navigations.topicNew} className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Topic
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={topics}
                pageCount={meta?.totalPages || -1}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
            />
        </div>
    );
};

export default TopicList;
