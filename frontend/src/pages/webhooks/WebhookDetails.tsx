import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { navigations } from '../../config/navigation';
import { useGetWebhookById, useUpdateWebhook } from '../../gen/client/webhooks/webhooks';
import ReactJson from 'react-json-view';
import { ArrowLeft, Save, Edit, X } from 'lucide-react';

const webhookSchema = z.object({
    endpointName: z.string().min(1, 'Endpoint name is required').max(200),
    targetUrl: z.url('Invalid or missing URL').max(200),
    timeoutMs: z.number().int().positive().default(5000), // changed from coerce to number for stricter typing
    isActive: z.boolean().default(true),
    retryPolicy: z.any().optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

const WebhookDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'read' | 'edit'>('read');
    const [submitError, setSubmitError] = useState('');

    const { data: webhookResponse, isLoading, isError, error, refetch } = useGetWebhookById(id!);
    const webhook = webhookResponse?.data;

    const updateWebhookMutation = useUpdateWebhook({
        mutation: {
            onSuccess: () => {
                setMode('read');
                refetch();
            },
            onError: (error) => {
                const message = error.response?.data?.message || 'Failed to update webhook';
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
    } = useForm({
        resolver: zodResolver(webhookSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (webhook) {
            reset({
                endpointName: webhook.endpointName,
                targetUrl: webhook.targetUrl,
                timeoutMs: Number(webhook.timeoutMs || 5000),
                isActive: Boolean(webhook.isActive),
                retryPolicy: webhook.retryPolicy || {},
            });
        }
    }, [webhook, reset]);

    if (!id) return <div>Invalid Webhook ID</div>;
    if (isLoading) return <div className="p-8 text-center">Loading webhook details...</div>;
    if (isError) return (
        <div className="alert alert-error">
            <span>{error?.message || 'Failed to load webhook'}</span>
            <button onClick={() => navigate(navigations.webhooks)}>Back to List</button>
        </div>
    );
    if (!webhook) return <div>Webhook not found</div>;

    const onSubmit: SubmitHandler<WebhookFormData> = (data) => {
        setSubmitError('');
        updateWebhookMutation.mutate({ id, data });
    };

    const handleCancel = () => {
        reset({
            endpointName: webhook.endpointName,
            targetUrl: webhook.targetUrl,
            timeoutMs: Number(webhook.timeoutMs || 5000),
            isActive: Boolean(webhook.isActive),
            retryPolicy: webhook.retryPolicy || {},
        });
        setMode('read');
        setSubmitError('');
    };

    const isRead = mode === 'read';

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(navigations.webhooks)} className="btn btn-ghost btn-circle">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">
                        {isRead ? webhook.endpointName : 'Edit Webhook'}
                    </h1>
                </div>
                {isRead && (
                    <button onClick={() => setMode('edit')} className="btn btn-primary gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                )}
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {submitError && (
                        <div className="alert alert-error mb-4">
                            <span>{submitError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Endpoint Name */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium">Endpoint Name</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isRead}
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
                                    <span className="label-text font-medium">Target URL</span>
                                </label>
                                <input
                                    type="url"
                                    disabled={isRead}
                                    className={`input input-bordered w-full ${errors.targetUrl ? 'input-error' : ''}`}
                                    {...register('targetUrl')}
                                />
                                {errors.targetUrl && (
                                    <span className="text-error text-sm mt-1">{errors.targetUrl.message}</span>
                                )}
                            </div>

                            {/* Timeout */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium">Timeout (ms)</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isRead}
                                    className={`input input-bordered w-full ${errors.timeoutMs ? 'input-error' : ''}`}
                                    {...register('timeoutMs')}
                                />
                                {errors.timeoutMs && (
                                    <span className="text-error text-sm mt-1">{errors.timeoutMs.message}</span>
                                )}
                            </div>

                            {/* Status */}
                            <div className="form-control w-full">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <span className="label-text font-medium">Active Status</span>
                                    <input
                                        type="checkbox"
                                        disabled={isRead}
                                        className="checkbox checkbox-primary"
                                        {...register('isActive')}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Retry Policy - JSON Editor */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Retry Policy (JSON)</span>
                            </label>
                            <div className={`border rounded-box p-4 ${isRead ? 'bg-base-200' : 'bg-base-100'}`}>
                                <Controller
                                    name="retryPolicy"
                                    control={control}
                                    render={({ field }) => (
                                        <ReactJson
                                            src={field.value}
                                            name={false}
                                            theme={isRead ? 'rjv-default' : 'monokai'}
                                            collapsed={false}
                                            enableClipboard={true}
                                            displayDataTypes={false}
                                            onEdit={!isRead ? (e) => field.onChange(e.updated_src) : false}
                                            onAdd={!isRead ? (e) => field.onChange(e.updated_src) : false}
                                            onDelete={!isRead ? (e) => field.onChange(e.updated_src) : false}
                                            style={{ backgroundColor: 'transparent' }}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Read-Only Meta Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm opacity-70">
                            <div>
                                <span className="font-bold">Created At:</span>{' '}
                                {webhook.createdAt ? new Date(webhook.createdAt).toLocaleString() : 'N/A'}
                            </div>
                            <div>
                                <span className="font-bold">Last Updated:</span>{' '}
                                {webhook.updatedAt ? new Date(webhook.updatedAt).toLocaleString() : 'N/A'}
                            </div>
                            <div>
                                <span className="font-bold">Webhook ID:</span> {webhook.webhookId}
                            </div>
                            <div>
                                <span className="font-bold">Client ID:</span> {webhook.clientId}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {!isRead && (
                            <div className="flex justify-end gap-3 mt-8 border-t pt-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn btn-ghost gap-2"
                                    disabled={isSubmitting || updateWebhookMutation.isPending}
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary gap-2"
                                    disabled={isSubmitting || updateWebhookMutation.isPending}
                                >
                                    <Save className="w-4 h-4" />
                                    {isSubmitting || updateWebhookMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WebhookDetails;
