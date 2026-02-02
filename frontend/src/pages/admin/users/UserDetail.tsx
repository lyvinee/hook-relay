import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { navigations } from '../../../config/navigation';
import {
    useGetUserById,
    useUpdateUser,
    useEnableUser,
    useDisableUser
} from '../../../gen/client/users/users';
import { UpdateUserDtoRole } from '../../../gen/client/model/updateUserDtoRole';

// Schema for updating user
const updateUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.nativeEnum(UpdateUserDtoRole),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

const UserDetail = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [updateError, setUpdateError] = useState('');
    const [actionError, setActionError] = useState('');

    const { data: userResponse, isLoading, isError, refetch } = useGetUserById(userId!, {
        query: {
            enabled: !!userId,
        }
    });

    const user = userResponse?.data;

    const updateUserMutation = useUpdateUser({
        mutation: {
            onSuccess: () => {
                refetch();
                alert('User updated successfully'); // Simple feedback for now
            },
            onError: (error) => {
                const message = error.response?.data?.message || 'Failed to update user';
                setUpdateError(Array.isArray(message) ? message.join(', ') : String(message));
            }
        }
    });

    const enableUserMutation = useEnableUser({
        mutation: {
            onSuccess: () => refetch(),
            onError: (error) => setActionError(error.message)
        }
    });

    const disableUserMutation = useDisableUser({
        mutation: {
            onSuccess: () => refetch(),
            onError: (error) => setActionError(error.message)
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(updateUserSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            role: UpdateUserDtoRole.user,
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                email: user.email,
                role: user.role as UpdateUserDtoRole,
            });
        }
    }, [user, reset]);

    const onSubmit: SubmitHandler<UpdateUserFormData> = (data) => {
        setUpdateError('');
        if (userId) {
            updateUserMutation.mutate({ id: userId, data });
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading user details...</div>;
    if (isError || !user) return <div className="p-8 text-center text-error">User not found</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.users)} className="btn btn-ghost">Back</button>
                <h1 className="text-2xl font-bold">User Details</h1>
                <div className="ml-auto flex gap-2">
                    {user.status === 'active' ? (
                        <button
                            onClick={() => disableUserMutation.mutate({ id: userId! })}
                            className="btn btn-error btn-sm"
                            disabled={disableUserMutation.isPending}
                        >
                            Disable User
                        </button>
                    ) : (
                        <button
                            onClick={() => enableUserMutation.mutate({ id: userId! })}
                            className="btn btn-success btn-sm"
                            disabled={enableUserMutation.isPending}
                        >
                            Enable User
                        </button>
                    )}
                </div>
            </div>

            {actionError && (
                <div className="alert alert-error mb-4">
                    <span>{actionError}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info / Edit Form */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Edit User</h2>
                        {updateError && (
                            <div className="alert alert-error mb-4">
                                <span>{updateError}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <span className="text-error text-sm mt-1">{errors.email.message}</span>
                                )}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text">Role</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full ${errors.role ? 'select-error' : ''}`}
                                    {...register('role')}
                                >
                                    {Object.values(UpdateUserDtoRole).map((role) => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <span className="text-error text-sm mt-1">{errors.role.message}</span>
                                )}
                            </div>

                            <div className="card-actions justify-end mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting || updateUserMutation.isPending}
                                >
                                    {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Metadata Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Metadata</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-base-content/70">ID</div>
                                <div className="font-mono text-sm">{user.userId}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Status</div>
                                <div>
                                    {user.status === 'active' ? (
                                        <div className="badge badge-success badge-sm gap-2">Active</div>
                                    ) : (
                                        <div className="badge badge-error badge-sm gap-2">{user.status}</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Created At</div>
                                <div>{user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy HH:mm:ss') : '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-base-content/70">Updated At</div>
                                <div>{user.updatedAt ? format(new Date(user.updatedAt), 'MMM d, yyyy HH:mm:ss') : '-'}</div>
                            </div>
                            {user.activatedAt && (
                                <div>
                                    <div className="text-sm text-base-content/70">Activated At</div>
                                    <div>{format(new Date(user.activatedAt as unknown as string), 'MMM d, yyyy HH:mm:ss')}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
