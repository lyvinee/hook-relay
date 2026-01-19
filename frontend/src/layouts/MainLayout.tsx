import React from 'react';
import { Outlet } from 'react-router';

const MainLayout: React.FC = () => {
    // Placeholder for Gatekeeper logic (Check Auth, Redirect, etc.)
    return (
        <div className="font-sans antialiased text-gray-900">
            <Outlet />
        </div>
    );
};

export default MainLayout;
