import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router';
import { navigations } from '../config/navigation';
import { useAuthLogout } from '../gen/client/auth/auth';
import { useAuthStore } from '../store/authStore';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const { logout: logoutStore } = useAuthStore();
    const logout = useAuthLogout({
        mutation: {
            onSuccess: () => {
                logoutStore();
                navigate(navigations.login);
            },
            onError: () => {
                // Logout locally even if API fails
                logoutStore();
                navigate(navigations.login);
            }
        }
    });

    return (
        <div className="flex h-screen bg-base-100">
            {/* Sidebar */}
            <aside className="w-64 bg-base-300 text-base-content flex flex-col">
                <div className="p-4 text-xl font-bold text-primary">Hook Relay Admin</div>
                <ul className="menu p-4 w-full flex-1">
                    {/* Dashboard */}
                    <li><Link to={navigations.dashboard}>Dashboard</Link></li>

                    {/* Admin Management */}
                    <div className="divider text-xs">Administration</div>
                    <li><Link to={navigations.clients}>Clients</Link></li>
                    <li><Link to={navigations.users}>Users</Link></li>

                    {/* Core Features (Accessing as Admin or shared view) */}
                    <div className="divider text-xs">System Views</div>
                    <li><Link to={navigations.webhooks}>Webhooks</Link></li>
                    <li><Link to={navigations.topics}>Topics</Link></li>
                    <li><Link to={navigations.events}>Events</Link></li>
                    <li><Link to={navigations.deliveries}>Deliveries</Link></li>
                    <li><Link to={navigations.dlq}>DLQ</Link></li>
                </ul>
                <div className="p-4">
                    <button
                        className="btn btn-outline btn-sm w-full"
                        onClick={() => logout.mutate()}
                        disabled={logout.isPending}
                    >
                        {logout.isPending ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
