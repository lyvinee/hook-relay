import { useState } from 'react';
import { Link } from 'react-router';
import { navigations } from '../../config/navigation';

const RouteCatalog = () => {
    const [params, setParams] = useState({
        webhookId: 'test_wh_123',
        eventId: 'test_evt_456',
        deliveryId: 'test_del_789',
        clientId: 'test_cli_001',
        userId: 'test_usr_002',
    });

    const updateParam = (key: keyof typeof params, value: string) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8">
            <div className="prose">
                <h1>Route Catalog</h1>
                <p>List of all registered application routes. Use the inputs below to configure dynamic parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="card bg-white shadow-sm border border-slate-200">
                    <div className="card-body">
                        <h2 className="card-title text-sm uppercase text-slate-500">Test Parameters</h2>
                        <div className="grid grid-cols-1 gap-4 mt-2">
                            {Object.keys(params).map(key => (
                                <div key={key} className="form-control">
                                    <label className="label">
                                        <span className="label-text font-mono text-xs">{key}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={params[key as keyof typeof params]}
                                        onChange={e => updateParam(key as keyof typeof params, e.target.value)}
                                        className="input input-bordered input-sm font-mono"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Route List */}
                <div className="space-y-6">
                    <div className="card bg-white shadow-sm border border-slate-200">
                        <div className="card-body p-0">
                            <table className="table table-zebra w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th>Route Name</th>
                                        <th>Path / Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(navigations).map(([key, value]) => {
                                        let path = '';
                                        if (typeof value === 'function') {
                                            // execution based on param name matching
                                            // Mocking the call based on key name for simplicity
                                            if (key === 'webhook') path = value(params.webhookId);
                                            else if (key === 'event') path = value(params.eventId);
                                            else if (key === 'delivery') path = value(params.deliveryId);
                                            else if (key === 'client') path = value(params.clientId);
                                            else if (key === 'user') path = value(params.userId);
                                            else path = '#unknown-param';
                                        } else {
                                            path = value;
                                        }

                                        return (
                                            <tr key={key}>
                                                <td className="font-mono text-sm font-semibold">{key}</td>
                                                <td>
                                                    <Link
                                                        to={path}
                                                        className="link link-primary no-underline hover:underline font-mono text-sm break-all"
                                                        target="_blank"
                                                    >
                                                        {path} <span className="text-xs opacity-50">↗</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteCatalog;
