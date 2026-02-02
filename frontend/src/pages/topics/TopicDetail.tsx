import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTopicsControllerFindOne, useTopicsControllerUpdate } from "../../gen/client/topics/topics";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { navigations } from "../../config/navigation";

const schema = z.object({
    topicName: z.string().min(1, "Topic Name is required"),
    isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function TopicDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: response, isLoading, error } = useTopicsControllerFindOne(id!);
    const { mutate: updateTopic, isPending: isUpdating } = useTopicsControllerUpdate();

    const topic = response?.data;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (topic) {
            setValue("topicName", topic.topicName);
            setValue("isActive", topic.isActive);
        }
    }, [topic, setValue]);

    const onSubmit = (data: FormData) => {
        if (!id) return;
        updateTopic(
            {
                id,
                data: {
                    topicName: data.topicName,
                    isActive: data.isActive,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Topic updated successfully");
                    navigate(navigations.topics);
                },
                onError: (error) => {
                    toast.error("Failed to update topic: " + error.message);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-error">Topic not found</h2>
                <button className="btn btn-primary mt-4" onClick={() => navigate(navigations.topics)}>
                    Back to Topics
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-base-content">Topic Details</h1>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-base-content/60">Topic ID</span>
                                <span className="font-mono">{topic.topicId}</span>
                            </div>
                            <div>
                                <span className="block text-base-content/60">Topic Key</span>
                                <span className="font-mono bg-base-200 px-2 py-1 rounded inline-block">{topic.topicSlugId}</span>
                            </div>
                            <div>
                                <span className="block text-base-content/60">Created At</span>
                                <span>{format(new Date(topic.createdAt), 'MMM d, yyyy HH:mm:ss')}</span>
                            </div>
                            <div>
                                <span className="block text-base-content/60">Last Updated</span>
                                <span>{format(new Date(topic.updatedAt), 'MMM d, yyyy HH:mm:ss')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider">Edit Topic</div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Topic Name</span>
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full ${errors.topicName ? "input-error" : ""}`}
                                {...register("topicName")}
                            />
                            {errors.topicName && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.topicName.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-4">
                                <span className="label-text font-medium">Active Status</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-success"
                                    {...register("isActive")}
                                />
                            </label>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => navigate(navigations.topics)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isUpdating}
                            >
                                {isUpdating ? <span className="loading loading-spinner"></span> : null}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
