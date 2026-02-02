import { useAuthGetMe } from '../../gen/client/auth/auth';

const Profile = () => {
    const { data, isLoading, isError, error } = useAuthGetMe();

    const user = data?.data;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            {isLoading && (
                <div className="flex justify-center p-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            )}

            {isError && (
                <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error?.message || 'Failed to load profile data'}</span>
                </div>
            )}

            {user && (
                <div className="card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">User Information</h2>

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-base-200">
                                <span className="text-base-content/60 w-32 font-medium">Email</span>
                                <span className="font-mono">{user.email}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-base-200">
                                <span className="text-base-content/60 w-32 font-medium">Role</span>
                                <div className="badge badge-primary badge-outline capitalize">{user.role}</div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <span className="text-base-content/60 w-32 font-medium">User ID</span>
                                <span className="font-mono text-xs bg-base-200 p-2 rounded">{user.userId}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
