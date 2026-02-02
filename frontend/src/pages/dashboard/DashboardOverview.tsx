import { useNavigate } from 'react-router';
import { navigations } from '../../config/navigation';

const DashboardOverview = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div role="alert" className="alert alert-info mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Dashboard analytics and statistics are currently in development. Please use the cards below to navigate.</span>
            </div>

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
        </div>
    );
};

export default DashboardOverview;
