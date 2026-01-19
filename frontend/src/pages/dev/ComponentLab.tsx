import { useMemo, useState } from 'react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '../../components/DataTable';

type Person = {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: 'active' | 'inactive' | 'pending';
    progress: number;
};

const makeData = (count: number): Person[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i.toString(),
        firstName: `First${i}`,
        lastName: `Last${i}`,
        age: 20 + (i % 30),
        visits: Math.floor(Math.random() * 100),
        status: i % 3 === 0 ? 'active' : i % 2 === 0 ? 'inactive' : 'pending',
        progress: Math.floor(Math.random() * 100),
    }));
};

const ComponentLab = () => {
    // Generate 100 mock rows
    const data = useMemo(() => makeData(100), []);

    // Controlled Pagination State for testing
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const columns = useMemo<ColumnDef<Person>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 60,
            },
            {
                header: 'Name',
                accessorFn: row => `${row.firstName} ${row.lastName}`,
            },
            {
                accessorKey: 'age',
                header: 'Age',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: info => {
                    const status = info.getValue() as string;
                    let color = 'badge-ghost';
                    if (status === 'active') color = 'badge-success';
                    if (status === 'inactive') color = 'badge-error';
                    return <span className={`badge ${color} badge-sm`}>{status}</span>;
                }
            },
            {
                accessorKey: 'progress',
                header: 'Profile Progress',
                cell: info => <progress className="progress progress-primary w-20" value={info.getValue() as number} max="100"></progress>
            },
        ],
        []
    );

    return (
        <div className="space-y-8">
            <div className="prose">
                <h1>Component Lab</h1>
                <p>Playground for testing shared components.</p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">DataTable</h2>
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body">
                        <p className="text-sm mb-4">
                            Showing client-side pagination with 100 mock records.
                        </p>

                        <DataTable
                            columns={columns}
                            data={data}
                            // To test generic built-in pagination, we don't pass controlled props
                            // But let's verify controlled mode as well since we built it
                            pagination={pagination}
                            onPaginationChange={setPagination}
                            pageCount={Math.ceil(data.length / pagination.pageSize)}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ComponentLab;
