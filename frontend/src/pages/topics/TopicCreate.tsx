import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTopicsControllerCreate } from "../../gen/client/topics/topics";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const schema = z.object({
    topicName: z.string().min(1, "Topic Name is required"),
    topicSlugId: z.string().min(1, "Topic Key is required").regex(/^[a-z0-9.]+$/, "Key must serve as a slug (lowercase, numbers, dots)"),
});

type FormData = z.infer<typeof schema>;

export default function TopicCreate() {
    const navigate = useNavigate();
    const { mutate: createTopic, isPending } = useTopicsControllerCreate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: FormData) => {
        createTopic(
            {
                data: {
                    topicName: data.topicName,
                    topicSlugId: data.topicSlugId,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Topic created successfully");
                    navigate("/dashboard/topics");
                },
                onError: (error) => {
                    toast.error("Failed to create topic: " + error.message);
                },
            }
        );
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-base-content">Create Topic</h1>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Topic Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Order Created"
                                className={`input input-bordered w-full ${errors.topicName ? "input-error" : ""}`}
                                {...register("topicName")}
                            />
                            {errors.topicName && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.topicName.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Topic Key (Slug)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. order.created"
                                className={`input input-bordered w-full ${errors.topicSlugId ? "input-error" : ""}`}
                                {...register("topicSlugId")}
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/60">
                                    Unique identifier used in API calls. Lowercase, numbers, and dots only.
                                </span>
                                {errors.topicSlugId && (
                                    <span className="label-text-alt text-error">{errors.topicSlugId.message}</span>
                                )}
                            </label>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => navigate("/dashboard/topics")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isPending}
                            >
                                {isPending ? <span className="loading loading-spinner"></span> : null}
                                Create Topic
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
