import { useNavigate } from 'react-router';
import { navigations } from '../../config/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthGetMe, useAuthLogin } from '../../gen/client/auth/auth';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });

    const userStore = useAuthStore();

    const fetchMe = useAuthGetMe({
        query: {
            enabled: !!userStore.accessToken,
        }
    })


    const loginMutation = useAuthLogin({
        mutation: {
            onSuccess: (data) => {
                userStore.setAccessToken(data.data.accessToken);
            },
            onError: (error) => {
                console.log(error);
            }
        }
    })

    const onSubmit = (data: LoginFormInputs) => {
        loginMutation.mutate({ data });
    };

    useEffect(() => {
        if (fetchMe.isSuccess) {
            userStore.setUser(fetchMe.data.data);
            navigate(navigations.dashboard);
        } else if (fetchMe.isError) {
            userStore.setAccessToken(null);
            userStore.setUser(null);
            toast.error("Something went wrong, please try again later")
        }
    }, [fetchMe.data]);

    useEffect(() => {
        if (userStore.accessToken) {
            navigate(navigations.dashboard);
        }
    }, [userStore.accessToken]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
            <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold mb-4 justify-center">Login</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                                {...register('email')}
                            />
                            {errors.email && (
                                <span className="text-error text-xs mt-1">{errors.email.message}</span>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="******"
                                className={`input input-bordered ${errors.password ? 'input-error' : ''}`}
                                {...register('password')}
                            />
                            {errors.password && (
                                <span className="text-error text-xs mt-1">{errors.password.message}</span>
                            )}
                            <label className="label">
                                <a href="#" className="label-text-alt link link-hover">
                                    Forgot password?
                                </a>
                            </label>
                        </div>

                        <div className="form-control mt-6">
                            <button className="btn btn-primary btn-full" type="submit">
                                Sign In
                            </button>
                        </div>
                    </form>

                    <div className="divider">OR</div>

                    <div className="text-center text-sm">
                        Don't have an account?{' '}
                        <a href="#" className="link link-primary">
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
