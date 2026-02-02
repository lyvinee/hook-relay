import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { navigations } from '../../config/navigation';
import { useGetClientById, useUpdateClient } from '../../gen/client/clients/clients';
import { ArrowLeft, Save, X } from 'lucide-react';
import ReactJson from 'react-json-view';

const clientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    slug: z.string().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
    isActive: z.boolean(),
    metadata: z.any().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const ClientEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState('');

    const { data: clientResponse, isLoading, isError, error } = useGetClientById(id!);
    const client = clientResponse?.data;

    const updateClientMutation = useUpdateClient({
        mutation: {
            onSuccess(data) {
                navigate(navigations.clientView(data.data.clientId));
            },
            onError(error) {
                const message = error.response?.data?.message || 'Failed to update client';
                setSubmitError(Array.isArray(message) ? message.join(', ') : String(message));
            }
        }
    });

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (client) {
            reset({
                name: client.name,
                slug: client.slugName,
                isActive: Boolean(client.isActive),
                metadata: {}, // Metadata mapping TBD as per DTO
            });
        }
    }, [client, reset]);

    if (!id) return <div>Invalid Client ID</div>;
    if (isLoading) return <div className="p-8 text-center">Loading client details...</div>;
    if (isError) return (
        <div className="alert alert-error">
            <span>{error?.message || 'Failed to load client'}</span>
            <button onClick={() => navigate(navigations.clients)}>Back to List</button>
        </div>
    );
    if (!client) return <div>Client not found</div>;

    const onSubmit: SubmitHandler<ClientFormData> = (data) => {
        setSubmitError('');
        updateClientMutation.mutate({
            id,
            data: {
                name: data.name,
                slugName: data.slug,
                isActive: data.isActive,
                // metadata: data.metadata, // Commented out until DTO supports it
            }
        });
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.clientView(id))} className="btn btn-ghost btn-circle">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Edit Client</h1>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {submitError && (
                        <div className="alert alert-error mb-4">
                            <span>{submitError}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Name</span>
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                                {...register('name')}
                            />
                            {errors.name && (
                                <span className="text-error text-sm mt-1">{errors.name.message}</span>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Slug</span>
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full ${errors.slug ? 'input-error' : ''}`}
                                {...register('slug')}
                            />
                            {errors.slug && (
                                <span className="text-error text-sm mt-1">{errors.slug.message}</span>
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="form-control w-full">
                            <label className="label cursor-pointer justify-start gap-4">
                                <span className="label-text font-medium">Active Status</span>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    {...register('isActive')}
                                />
                            </label>
                        </div>

                        {/* Metadata - JSON Editor */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Metadata (JSON)</span>
                            </label>
                            <div className="border rounded-box p-4 bg-base-100">
                                <Controller
                                    name="metadata"
                                    control={control}
                                    render={({ field }) => (
                                        <ReactJson
                                            src={field.value}
                                            name={false}
                                            theme="monokai"
                                            collapsed={false}
                                            enableClipboard={false}
                                            displayDataTypes={false}
                                            onEdit={(e) => field.onChange(e.updated_src)}
                                            onAdd={(e) => field.onChange(e.updated_src)}
                                            onDelete={(e) => field.onChange(e.updated_src)}
                                            style={{ backgroundColor: 'transparent' }}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => navigate(navigations.clientView(id))}
                                className="btn btn-ghost gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary gap-2"
                                disabled={isSubmitting || updateClientMutation.isPending}
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting || updateClientMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientEdit;
