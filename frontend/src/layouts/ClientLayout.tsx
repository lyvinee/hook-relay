import React from 'react';
import { Outlet, Link } from 'react-router';
import { navigations } from '../config/navigation';

const ClientLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-base-100">
            {/* Sidebar */}
            <aside className="w-64 bg-base-200 text-base-content flex flex-col">
                <div className="p-4 text-xl font-bold">Hook Relay</div>
                <ul className="menu p-4 w-full flex-1">
                    {/* Dashboard */}
                    <li><Link to={navigations.dashboard}>Dashboard</Link></li>

                    {/* Core Features */}
                    <div className="divider text-xs">Features</div>
                    <li><Link to={navigations.webhooks}>Webhooks</Link></li>
                    <li><Link to={navigations.topics}>Topics</Link></li>
                    <li><Link to={navigations.events}>Events</Link></li>
                    <li><Link to={navigations.deliveries}>Deliveries</Link></li>
                    <li><Link to={navigations.dlq}>DLQ</Link></li>

                    {/* Account */}
                    <div className="divider text-xs">Account</div>
                    <li><Link to={navigations.profile}>Profile</Link></li>
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

export default ClientLayout;
