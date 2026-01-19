import { useLocation, useNavigate, useParams } from 'react-router';
import { navigations } from '../../config/navigation';

const WebhookDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.webhooks)} className="btn btn-ghost">Back</button>
                <h1 className="text-2xl font-bold">Webhook Detail</h1>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">ID: {params.webhookId}</h2>
                    <p>Details placeholder...</p>
                </div>
            </div>

            <div className="mt-8 p-4 bg-base-200 rounded">
                <pre>{JSON.stringify({ location, params }, null, 2)}</pre>
            </div>
        </div>
    );
};

export default WebhookDetail;
