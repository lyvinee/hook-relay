import { useNavigate, useParams } from 'react-router';
import { navigations } from '../../config/navigation';
import { useGetWebhookEventById } from '../../gen/client/webhook-events/webhook-events';
import ReactJson from 'react-json-view';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const EventDetail = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();

    const { data: eventResponse, isLoading, isError } = useGetWebhookEventById(eventId!, {
        query: {
            enabled: !!eventId,
        }
    });

    const event = eventResponse?.data;

    if (isLoading) return <div className="p-8 text-center">Loading event details...</div>;
    if (isError || !event) return <div className="p-8 text-center text-error">Event not found</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.events)} className="btn btn-ghost btn-circle">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Event Details</h1>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Protocol / Payload Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Event Payload</h2>
                        <div className="border rounded-box p-4 bg-base-200">
                            <ReactJson
                                src={event.eventPayload || {}}
                                name={false}
                                theme="rjv-default"
                                collapsed={false}
                                enableClipboard={true}
                                displayDataTypes={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Metadata Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Metadata</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-base-content/70">Event ID</div>
                                <div className="font-mono text-sm">{event.webhookEventId}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Webhook ID</div>
                                <div className="font-mono text-sm">{event.webhookId}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Topic ID</div>
                                <div className="font-mono text-sm">{event.topicId}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Occurred At</div>
                                <div>{event.eventTimestamp ? format(new Date(event.eventTimestamp), 'MMM d, yyyy HH:mm:ss.SSS') : '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Ingested At</div>
                                <div>{event.createdAt ? format(new Date(event.createdAt), 'MMM d, yyyy HH:mm:ss.SSS') : '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Idempotency Key</div>
                                <div className="font-mono text-sm">{event.webhookIdempotencyKey}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
