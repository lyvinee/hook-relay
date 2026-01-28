import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { navigations } from '../../config/navigation';
import WebhookSuccessModal from '../../components/WebhookSuccessModal';
import { useListClients } from '../../gen/client/clients/clients';
import { useCreateWebhook } from '../../gen/client/webhooks/webhooks';
import { X } from "lucide-react"

// Validation Schema mirroring the backend DTO
const webhookSchema = z.object({
    clientId: z.uuid('Invalid Client ID (UUID required)'),
    endpointName: z.string().min(1, 'Endpoint name is required').max(200, 'Endpoint name must be less than 200 characters'),
    targetUrl: z.url('Invalid or missing URL').max(200, 'URL must be less than 200 characters'),
    timeoutMs: z.coerce.number().int().positive('Timeout must be a positive integer').default(5000),
    isActive: z.boolean().default(true),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

const WebhookCreate = () => {
    const navigate = useNavigate();
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [createdSecret, setCreatedSecret] = useState('');
    const [submitError, setSubmitError] = useState('');

    const {
        data: clientsResponse,
        isLoading: isLoadingClients,
        isError: isClientError
    } = useListClients({ limit: 100 });

    const clients = clientsResponse?.data?.data || [];

    const createWebhookMutation = useCreateWebhook({
        mutation: {
            onSuccess(data) {
                console.log('Webhook created successfully', data);
                setIsSuccessModalOpen(true);
                setCreatedSecret(data.data.hmacSecret);
            },
            onError(error) {
                console.error('Failed to create webhook', error);
                const message = error.response?.data?.message || 'Failed to create webhook';
                setSubmitError(Array.isArray(message) ? message.join(', ') : String(message));
            }
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch
    } = useForm({
        resolver: zodResolver(webhookSchema),
        mode: 'onChange',
        defaultValues: {
            clientId: '',
            endpointName: '',
            targetUrl: '',
            timeoutMs: 5000,
            isActive: true,
        },
    });

    // Auto-select first client when clients are loaded
    useEffect(() => {
        if (clients.length > 0 && !watch('clientId')) {
            setValue('clientId', clients[0].clientId);
        }
    }, [clients, setValue, watch]);

    const onSubmit: SubmitHandler<WebhookFormData> = (data) => {
        setSubmitError('');
        createWebhookMutation.mutate({ data });
    };

    if (isLoadingClients) {
        return <div className="p-8 text-center">Loading clients...</div>;
    }

    if (isClientError) {
        return (
            <div className="container mx-auto p-4 max-w-2xl">
                <X className="w-6 h-6" />
                <button onClick={() => navigate(navigations.webhooks)} className="btn btn-ghost mt-4">Back</button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.webhooks)} className="btn btn-ghost">Back</button>
                <h1 className="text-2xl font-bold">Create Webhook</h1>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {submitError && (
                        <div className="alert alert-error mb-4">
                            <span>{submitError}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Client ID Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Client</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.clientId ? 'select-error' : ''}`}
                                {...register('clientId')}
                            >
                                {clients.map((client) => (
                                    <option key={client.clientId} value={client.clientId}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                            {errors.clientId && (
                                <span className="text-error text-sm mt-1">{errors.clientId.message}</span>
                            )}
                        </div>

                        {/* Endpoint Name */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Endpoint Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Order Created"
                                className={`input input-bordered w-full ${errors.endpointName ? 'input-error' : ''}`}
                                {...register('endpointName')}
                            />
                            {errors.endpointName && (
                                <span className="text-error text-sm mt-1">{errors.endpointName.message}</span>
                            )}
                        </div>

                        {/* Target URL */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Target URL</span>
                            </label>
                            <input
                                type="url"
                                placeholder="https://api.example.com/webhooks"
                                className={`input input-bordered w-full ${errors.targetUrl ? 'input-error' : ''}`}
                                {...register('targetUrl')}
                            />
                            {errors.targetUrl && (
                                <span className="text-error text-sm mt-1">{errors.targetUrl.message}</span>
                            )}
                        </div>

                        {/* Timeout MS */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Timeout (ms)</span>
                            </label>
                            <input
                                type="number"
                                className={`input input-bordered w-full ${errors.timeoutMs ? 'input-error' : ''}`}
                                {...register('timeoutMs')}
                            />
                            {errors.timeoutMs && (
                                <span className="text-error text-sm mt-1">{errors.timeoutMs.message}</span>
                            )}
                        </div>

                        {/* Is Active */}
                        <div className="form-control w-full">
                            <label className="label cursor-pointer justify-start gap-4">
                                <span className="label-text">Active</span>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    {...register('isActive')}
                                />
                            </label>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => navigate(navigations.webhooks)}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || createWebhookMutation.isPending}>
                                {isSubmitting || createWebhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <WebhookSuccessModal
                isOpen={isSuccessModalOpen}
                secret={createdSecret}
                onClose={() => setIsSuccessModalOpen(false)}
            />
        </div>
    );
};

export default WebhookCreate;
