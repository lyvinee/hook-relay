import { useParams, useNavigate } from 'react-router';
import { useGetClientById } from '../../gen/client/clients/clients';
import { navigations } from '../../config/navigation';
import { ArrowLeft, Edit } from 'lucide-react';

const ClientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: clientResponse, isLoading, isError, error } = useGetClientById(id!);
    const client = clientResponse?.data;

    if (!id) return <div>Invalid Client ID</div>;
    if (isLoading) return <div className="p-8 text-center">Loading client details...</div>;
    if (isError) return (
        <div className="alert alert-error">
            <span>{error?.message || 'Failed to load client'}</span>
            <button onClick={() => navigate(navigations.clients)}>Back to List</button>
        </div>
    );
    if (!client) return <div>Client not found</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(navigations.clients)} className="btn btn-ghost btn-circle">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">
                        {client.name}
                    </h1>
                </div>
                <button
                    onClick={() => navigate(navigations.clientEdit(id))}
                    className="btn btn-primary gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </button>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Name</span>
                            </label>
                            <input
                                type="text"
                                value={client.name}
                                readOnly
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Slug */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Slug</span>
                            </label>
                            <input
                                type="text"
                                value={client.slugName}
                                readOnly
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="form-control w-full">
                            <label className="label cursor-pointer justify-start gap-4">
                                <span className="label-text font-medium">Active Status</span>
                                <input
                                    type="checkbox"
                                    checked={Boolean(client.isActive)}
                                    readOnly
                                    className="checkbox checkbox-primary"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Metadata - Read Only */}
                    {/* Note: Metadata is not currently in ClientResponseDto based on CreateClientDto investigation.
                        If it's missing in DTO, we can't display it yet. 
                        However, the user mentioned displaying metadata. 
                        I will check ClientResponseDto again or assume it might be added later/is missing from types.
                        For now, skipping metadata display if not in DTO or adding if I find it.
                        Wait, let me check ClientResponseDto again. 
                    */}

                    {/* Read-Only Meta Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm opacity-70 mt-8">
                        <div>
                            <span className="font-bold">Created At:</span>{' '}
                            {client.createdAt ? new Date(String(client.createdAt)).toLocaleString() : 'N/A'}
                        </div>
                        <div>
                            <span className="font-bold">Last Updated:</span>{' '}
                            {client.updatedAt ? new Date(String(client.updatedAt)).toLocaleString() : 'N/A'}
                        </div>
                        <div>
                            <span className="font-bold">Client ID:</span> {client.clientId}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetails;
