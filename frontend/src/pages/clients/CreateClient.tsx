import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { navigations } from '../../config/navigation';
import { useCreateClient } from '../../gen/client/clients/clients';
import { ArrowLeft, X } from 'lucide-react';
import ReactJson from 'react-json-view';

const clientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    slug: z.string().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
    metadata: z.any().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const CreateClient = () => {
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState('');

    const createClientMutation = useCreateClient({
        mutation: {
            onSuccess(data) {
                navigate(navigations.clientView(data.data.clientId));
            },
            onError(error) {
                const message = error.response?.data?.message || 'Failed to create client';
                setSubmitError(Array.isArray(message) ? message.join(', ') : String(message));
            }
        }
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            slug: '',
            metadata: {},
        },
    });

    const onSubmit: SubmitHandler<ClientFormData> = (data) => {
        setSubmitError('');
        createClientMutation.mutate({
            data: {
                name: data.name,
                slugName: data.slug,
                isActive: true, // properties: isActive is optional
            }
        });
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.clients)} className="btn btn-ghost btn-circle">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Create Client</h1>
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
                                placeholder="e.g. Acme Corp"
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
                                placeholder="e.g. acme-corp"
                                className={`input input-bordered w-full ${errors.slug ? 'input-error' : ''}`}
                                {...register('slug')}
                            />
                            {errors.slug && (
                                <span className="text-error text-sm mt-1">{errors.slug.message}</span>
                            )}
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
                                onClick={() => navigate(navigations.clients)}
                                className="btn btn-ghost gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting || createClientMutation.isPending}
                            >
                                {isSubmitting || createClientMutation.isPending ? 'Creating...' : 'Create Client'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateClient;
