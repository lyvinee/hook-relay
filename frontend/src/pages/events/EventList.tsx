import { useLocation, useNavigate, useParams } from 'react-router';
import { navigations } from '../../config/navigation';

const EventList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Events</h1>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover" onClick={() => navigate(navigations.event('evt_123'))} style={{ cursor: 'pointer' }}>
                            <td>evt_123</td>
                            <td>user.created</td>
                            <td>
                                <button className="btn btn-ghost btn-xs">View</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-4 bg-base-200 rounded">
                <pre>{JSON.stringify({ location, params }, null, 2)}</pre>
            </div>
        </div>
    );
};

export default EventList;
