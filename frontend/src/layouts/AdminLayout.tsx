import React from 'react';
import { Outlet, Link } from 'react-router';
import { navigations } from '../config/navigation';

const AdminLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-base-100">
            {/* Sidebar */}
            <aside className="w-64 bg-base-300 text-base-content flex flex-col">
                <div className="p-4 text-xl font-bold text-primary">Hook Relay Admin</div>
                <ul className="menu p-4 w-full flex-1">
                    {/* Dashboard */}
                    <li><Link to={navigations.dashboard}>Dashboard (View as Client)</Link></li>

                    {/* Admin Management */}
                    <div className="divider text-xs">Administration</div>
                    <li><Link to={navigations.clients}>Clients</Link></li>
                    <li><Link to={navigations.users}>Users</Link></li>

                    {/* Core Features (Accessing as Admin or shared view) */}
                    <div className="divider text-xs">System Views</div>
                    <li><Link to={navigations.webhooks}>Webhooks</Link></li>
                    <li><Link to={navigations.events}>Events</Link></li>
                    <li><Link to={navigations.deliveries}>Deliveries</Link></li>
                    <li><Link to={navigations.dlq}>DLQ</Link></li>
                </ul>
                <div className="p-4">
                    <button className="btn btn-outline btn-sm w-full">Logout</button>
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
