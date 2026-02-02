import { useNavigate, useParams } from 'react-router';
import { useGetWebhookDlqById, useReplayWebhookDlq } from '../../gen/client/webhook-dlq/webhook-dlq';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import ReactJson from 'react-json-view';
import { toast } from 'sonner';

const DlqDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: dlqResponse, isLoading, isError, error } = useGetWebhookDlqById(id!);
    const dlqItem = dlqResponse?.data;

    const replayMutation = useReplayWebhookDlq({
        mutation: {
            onSuccess: (data) => {
                toast.success(data.data.status || 'Replay initiated');
            },
            onError: (error) => {
                const errorData = error.response?.data as { message?: string | string[] };
                toast.error(
                    Array.isArray(errorData?.message)
                        ? errorData.message.join(', ')
                        : (errorData?.message || 'Failed to replay')
                );
            },
        },
    });

    const handleReplay = () => {
        if (!id) return;
        replayMutation.mutate({
            id,
            data: { initiatorType: 'user' }
        });
    };

    if (!id) return <div>Invalid DLQ ID</div>;
    if (isLoading) return <div className="p-8 text-center">Loading details...</div>;
    if (isError) return (
        <div className="alert alert-error">
            <span>{error?.message || 'Failed to load DLQ item'}</span>
            <button onClick={() => navigate('/dashboard/dlq')}>Back to List</button>
        </div>
    );
    if (!dlqItem) return <div>Item not found</div>;

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/dlq')} className="btn btn-ghost btn-circle">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">
                        DLQ Item Details
                    </h1>
                </div>
                <button
                    onClick={handleReplay}
                    className="btn btn-primary gap-2"
                    disabled={replayMutation.isPending}
                >
                    <RefreshCw className={`w-4 h-4 ${replayMutation.isPending ? 'animate-spin' : ''}`} />
                    {replayMutation.isPending ? 'Replaying...' : 'Replay Message'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meta Info Card */}
                <div className="card bg-base-100 shadow-xl col-span-1 lg:col-span-2">
                    <div className="card-body">
                        <h2 className="card-title text-sm opacity-70 uppercase mb-4">Meta Information</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-bold block">ID:</span>
                                <span className="font-mono text-xs">{dlqItem.webhookDlqId}</span>
                            </div>
                            <div>
                                <span className="font-bold block">Delivery ID:</span>
                                <span className="font-mono text-xs">{dlqItem.webhookDeliveryId}</span>
                            </div>
                            <div>
                                <span className="font-bold block">Webhook ID:</span>
                                <span className="font-mono text-xs">{dlqItem.webhookId}</span>
                            </div>
                            <div>
                                <span className="font-bold block">Event ID:</span>
                                <span className="font-mono text-xs">{dlqItem.eventId}</span>
                            </div>
                            <div>
                                <span className="font-bold block">Status:</span>
                                <span className="badge badge-error badge-sm">{dlqItem.deliveryStatus}</span>
                            </div>
                            <div>
                                <span className="font-bold block">Attempts:</span>
                                {dlqItem.deliveryAttempts}
                            </div>
                            <div>
                                <span className="font-bold block">Created At:</span>
                                {new Date(dlqItem.createdAt).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-bold block">Retry After:</span>
                                {dlqItem.deliveryRetryAfter ? new Date(dlqItem.deliveryRetryAfter as unknown as string).toLocaleString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Information */}
                <div className="card bg-base-100 shadow-xl border border-error/20">
                    <div className="card-body">
                        <h2 className="card-title text-sm text-error uppercase mb-4">Error Details</h2>
                        <div className="bg-base-200 p-4 rounded-lg overflow-auto max-h-96">
                            {dlqItem.deliveryError ? (
                                <ReactJson
                                    src={dlqItem.deliveryError}
                                    name={false}
                                    theme="rjv-default"
                                    collapsed={1}
                                    displayDataTypes={false}
                                    style={{ backgroundColor: 'transparent' }}
                                />
                            ) : (
                                <span className="text-base-content/50 italic">No error details available</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payload Information */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-sm opacity-70 uppercase mb-4">Delivery Payload</h2>
                        <div className="bg-base-200 p-4 rounded-lg overflow-auto max-h-96">
                            <ReactJson
                                src={dlqItem.deliveryPayload || {}}
                                name={false}
                                theme="rjv-default"
                                collapsed={2}
                                displayDataTypes={false}
                                style={{ backgroundColor: 'transparent' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Response Information */}
                <div className="card bg-base-100 shadow-xl col-span-1 lg:col-span-2">
                    <div className="card-body">
                        <h2 className="card-title text-sm opacity-70 uppercase mb-4">Delivery Response</h2>
                        <div className="mb-2">
                            <span className="font-bold mr-2">Status Code:</span>
                            <span className={`badge ${dlqItem.deliveryResponseStatus >= 200 && dlqItem.deliveryResponseStatus < 300 ? 'badge-success' : 'badge-neutral'}`}>
                                {dlqItem.deliveryResponseStatus}
                            </span>
                        </div>
                        <div className="bg-base-200 p-4 rounded-lg overflow-auto max-h-60">
                            {dlqItem.deliveryResponse ? (
                                <ReactJson
                                    src={dlqItem.deliveryResponse}
                                    name={false}
                                    theme="rjv-default"
                                    collapsed={1}
                                    displayDataTypes={false}
                                    style={{ backgroundColor: 'transparent' }}
                                />
                            ) : (
                                <span className="text-base-content/50 italic">No response body</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DlqDetail;
