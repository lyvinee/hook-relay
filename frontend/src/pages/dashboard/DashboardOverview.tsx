import { useLocation, useNavigate, useParams } from 'react-router';
import { navigations } from '../../config/navigation';

const DashboardOverview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => navigate(navigations.webhooks)}>
                    <div className="card-body">
                        <h2 className="card-title">Webhooks</h2>
                        <p>Manage your webhooks</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => navigate(navigations.events)}>
                    <div className="card-body">
                        <h2 className="card-title">Events</h2>
                        <p>View recent events</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => navigate(navigations.deliveries)}>
                    <div className="card-body">
                        <h2 className="card-title">Deliveries</h2>
                        <p>Check delivery statuses</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => navigate(navigations.dlq)}>
                    <div className="card-body">
                        <h2 className="card-title">DLQ</h2>
                        <p>Dead Letter Queue</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-base-200 rounded">
                <p className="text-sm opacity-50">Debug Info:</p>
                <pre>{JSON.stringify({ location, params }, null, 2)}</pre>
            </div>
        </div>
    );
};

export default DashboardOverview;
