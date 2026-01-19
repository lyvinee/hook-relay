import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';

const DevLayout: React.FC = () => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shadow-lg">
                <div className="p-4 bg-slate-800">
                    <h1 className="text-xl font-bold text-emerald-400">Dev Tools</h1>
                    <p className="text-xs text-slate-400">Environment: Development</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4">
                    <div className="mb-6">
                        <h3 className="text-xs uppercase font-semibold text-slate-500 mb-2">Navigation</h3>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to="/dev"
                                    className={`block px-3 py-2 rounded text-sm ${location.pathname === '/dev' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                                >
                                    Route Catalog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs uppercase font-semibold text-slate-500 mb-2">Component Stories</h3>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to="/dev/components/datatable"
                                    className={`block px-3 py-2 rounded text-sm ${location.pathname.includes('/datatable') ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                                >
                                    DataTable
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="p-4 bg-slate-800 border-t border-slate-700">
                    <Link to="/" className="btn btn-outline btn-sm btn-ghost w-full text-slate-300">
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DevLayout;
