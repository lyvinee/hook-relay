import { useParams, useNavigate } from 'react-router';
import { useGetWebhookDeliveryById } from '../../gen/client/webhook-deliveries/webhook-deliveries';
import { navigations } from '../../config/navigation';
import { Loader2, ArrowLeft, Calendar, Clock, Activity, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import ReactJson from 'react-json-view';

const DeliveryDetail = () => {
    const { deliveryId } = useParams<{ deliveryId: string }>();
    const navigate = useNavigate();

    const { data: response, isLoading, error } = useGetWebhookDeliveryById(deliveryId!);
    const delivery = response?.data;

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !delivery) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-error">Delivery not found</h2>
                <button className="btn btn-primary mt-4" onClick={() => navigate(navigations.deliveries)}>
                    Back to Deliveries
                </button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'badge-success';
            case 'failed': return 'badge-error';
            case 'pending': return 'badge-warning';
            case 'dlq': return 'badge-error badge-outline';
            default: return 'badge-ghost';
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate(navigations.deliveries)}
                    className="btn btn-ghost btn-sm gap-2 mb-2 pl-0 hover:bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Deliveries
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-base-content flex items-center gap-3">
                            Delivery Detail
                            <div className={`badge ${getStatusColor(delivery.deliveryStatus)} badge-lg`}>
                                {delivery.deliveryStatus.toUpperCase()}
                            </div>
                        </h1>
                        <p className="text-base-content/60 mt-1 font-mono text-sm">
                            ID: {delivery.webhookDeliveryId}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-primary">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Status Code</div>
                    <div className={`stat-value ${Number(delivery.statusCode || 0) >= 400 ? 'text-error' : 'text-success'}`}>
                        {String(delivery.statusCode || '-')}
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-secondary">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Duration</div>
                    <div className="stat-value text-secondary text-2xl">
                        {delivery.duration ? `${delivery.duration}ms` : '-'}
                    </div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-accent">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Created At</div>
                    <div className="stat-value text-accent text-lg">
                        {delivery.createdAt ? format(new Date(delivery.createdAt), 'MMM d, yyyy HH:mm:ss') : '-'}
                    </div>
                </div>
            </div>

            {delivery.errorMessage && (
                <div className="alert alert-error shadow-lg mb-8">
                    <AlertTriangle className="stroke-current shrink-0 h-6 w-6" />
                    <div>
                        <h3 className="font-bold">Error Message</h3>
                        <div className="text-xs font-mono mt-1">{String(delivery.errorMessage || '')}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-0">
                        <div className="p-4 border-b border-base-200 font-bold bg-base-200/50 rounded-t-xl flex justify-between items-center">
                            Request
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-base-content/70">Headers</h4>
                                <div className="bg-base-200 p-4 rounded-lg text-xs overflow-auto max-h-40">
                                    <ReactJson
                                        src={delivery.requestHeaders || {}}
                                        name={false}
                                        displayDataTypes={false}
                                        enableClipboard={false}
                                        collapsed={true}
                                        theme="rjv-default"
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-base-content/70">Payload</h4>
                                <div className="bg-base-200 p-4 rounded-lg text-xs overflow-auto max-h-96">
                                    <ReactJson
                                        src={delivery.requestPayload || {}}
                                        name={false}
                                        displayDataTypes={false}
                                        enableClipboard={true}
                                        collapsed={2}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-0">
                        <div className="p-4 border-b border-base-200 font-bold bg-base-200/50 rounded-t-xl flex justify-between items-center">
                            Response
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-base-content/70">Headers</h4>
                                <div className="bg-base-200 p-4 rounded-lg text-xs overflow-auto max-h-40">
                                    <ReactJson
                                        src={delivery.responseHeaders || {}}
                                        name={false}
                                        displayDataTypes={false}
                                        enableClipboard={false}
                                        collapsed={true}
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-base-content/70">Body</h4>
                                <div className="bg-base-200 p-4 rounded-lg text-xs overflow-auto max-h-96">
                                    <ReactJson
                                        src={delivery.responseBody || {}}
                                        name={false}
                                        displayDataTypes={false}
                                        enableClipboard={true}
                                        collapsed={2}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDetail;
