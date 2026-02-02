import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWebhookEvent } from "../../gen/client/webhook-events/webhook-events";
import { useListWebhooks } from "../../gen/client/webhooks/webhooks";
import { useTopicsControllerFindAll } from "../../gen/client/topics/topics";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { WebhookDto } from "../../gen/client/model";

interface Topic {
    topicId: string;
    topicName: string;
    topicSlugId: string;
    isActive: boolean;
}

const schema = z.object({
    webhookId: z.string().uuid("Invalid Webhook ID"),
    topicId: z.string().uuid("Invalid Topic ID"),
    eventPayload: z.string().min(1, "Payload is required").refine((val) => {
        try {
            JSON.parse(val);
            return true;
        } catch {
            return false;
        }
    }, "Invalid JSON format"),
    webhookIdempotencyKey: z.string().min(1, "Idempotency Key is required"),
});

type FormData = z.infer<typeof schema>;

export default function EventCreate() {
    const navigate = useNavigate();
    const { mutate: createEvent, isPending } = useCreateWebhookEvent();
    const { data: webhooksData, isLoading: isLoadingWebhooks } = useListWebhooks({ page: 1, limit: 100 });
    const { data: topicsData, isLoading: isLoadingTopics } = useTopicsControllerFindAll();

    // Cast topics data since API response is void in spec currently
    const topics = (topicsData?.data.data || []).map((topic) => ({
        topicId: topic.topicId,
        topicName: topic.topicName,
        topicSlugId: topic.topicSlugId,
        isActive: topic.isActive,
    }));
    const webhooks = webhooksData?.data?.data || [];

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            webhookIdempotencyKey: crypto.randomUUID(),
            eventPayload: "{\n  \"message\": \"Hello World\"\n}",
        },
    });

    const onSubmit = (data: FormData) => {
        try {
            const parsedPayload = JSON.parse(data.eventPayload);
            createEvent(
                {
                    data: {
                        webhookId: data.webhookId,
                        topicId: data.topicId,
                        eventPayload: parsedPayload,
                        webhookIdempotencyKey: data.webhookIdempotencyKey,
                    },
                },
                {
                    onSuccess: () => {
                        toast.success("Event triggered successfully");
                        navigate("/dashboard/events");
                    },
                    onError: (error) => {
                        toast.error("Failed to trigger event: " + error.message);
                    },
                }
            );
        } catch (e) {
            toast.error("Invalid JSON payload");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-base-content">Trigger Event</h1>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Webhook Endpoint</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.webhookId ? "select-error" : ""}`}
                                {...register("webhookId")}
                                disabled={isLoadingWebhooks}
                            >
                                <option value="">Select a webhook</option>
                                {webhooks.map((webhook: WebhookDto) => (
                                    <option key={webhook.webhookId} value={webhook.webhookId}>
                                        {webhook.endpointName} ({webhook.targetUrl})
                                    </option>
                                ))}
                            </select>
                            {errors.webhookId && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.webhookId.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Topic</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.topicId ? "select-error" : ""}`}
                                {...register("topicId")}
                                disabled={isLoadingTopics}
                            >
                                <option value="">Select a topic</option>
                                {topics.map((topic) => (
                                    <option key={topic.topicId} value={topic.topicId}>
                                        {topic.topicName} ({topic.topicSlugId})
                                    </option>
                                ))}
                            </select>
                            {errors.topicId && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.topicId.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Idempotency Key</span>
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full ${errors.webhookIdempotencyKey ? "input-error" : ""}`}
                                {...register("webhookIdempotencyKey")}
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/60">
                                    Auto-generated UUID. You can modify this to test idempotency.
                                </span>
                                {errors.webhookIdempotencyKey && (
                                    <span className="label-text-alt text-error">{errors.webhookIdempotencyKey.message}</span>
                                )}
                            </label>
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Event Payload (JSON)</span>
                            </label>
                            <textarea
                                className={`textarea textarea-bordered h-48 font-mono text-sm ${errors.eventPayload ? "textarea-error" : ""}`}
                                placeholder="{ ... }"
                                {...register("eventPayload")}
                            />
                            {errors.eventPayload && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.eventPayload.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => navigate("/dashboard/events")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isPending}
                            >
                                {isPending ? <span className="loading loading-spinner"></span> : null}
                                Trigger Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
