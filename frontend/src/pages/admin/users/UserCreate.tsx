import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { navigations } from '../../../config/navigation';
import { useCreateUser } from '../../../gen/client/users/users';
import { CreateUserDtoRole } from '../../../gen/client/model/createUserDtoRole';
import { CreateUserDtoStatus } from '../../../gen/client/model/createUserDtoStatus';

const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.nativeEnum(CreateUserDtoRole),
    status: z.nativeEnum(CreateUserDtoStatus),
});

type UserFormData = z.infer<typeof userSchema>;

const UserCreate = () => {
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState('');

    const createUserMutation = useCreateUser({
        mutation: {
            onSuccess(data) {
                console.log('User created successfully', data);
                navigate(navigations.users);
            },
            onError(error) {
                console.error('Failed to create user', error);
                const message = error.response?.data?.message || 'Failed to create user';
                setSubmitError(Array.isArray(message) ? message.join(', ') : String(message));
            }
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(userSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            role: CreateUserDtoRole.user,
            status: CreateUserDtoStatus.active,
        },
    });

    const onSubmit: SubmitHandler<UserFormData> = (data) => {
        setSubmitError('');
        createUserMutation.mutate({ data });
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.users)} className="btn btn-ghost">Back</button>
                <h1 className="text-2xl font-bold">Create User</h1>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {submitError && (
                        <div className="alert alert-error mb-4">
                            <span>{submitError}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Email */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="user@example.com"
                                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                                {...register('email')}
                            />
                            {errors.email && (
                                <span className="text-error text-sm mt-1">{errors.email.message}</span>
                            )}
                        </div>

                        {/* Role */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Role</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.role ? 'select-error' : ''}`}
                                {...register('role')}
                            >
                                {Object.values(CreateUserDtoRole).map((role) => (
                                    <option key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.role && (
                                <span className="text-error text-sm mt-1">{errors.role.message}</span>
                            )}
                        </div>

                        {/* Status */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Status</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.status ? 'select-error' : ''}`}
                                {...register('status')}
                            >
                                {Object.values(CreateUserDtoStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.status && (
                                <span className="text-error text-sm mt-1">{errors.status.message}</span>
                            )}
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => navigate(navigations.users)}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || createUserMutation.isPending}>
                                {isSubmitting || createUserMutation.isPending ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserCreate;
