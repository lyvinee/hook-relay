import { useLocation, useNavigate, useParams } from 'react-router';
import { navigations } from '../../config/navigation';

const DeliveryList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Delivery Attempts</h1>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover" onClick={() => navigate(navigations.delivery('del_123'))} style={{ cursor: 'pointer' }}>
                            <td>del_123</td>
                            <td><span className="badge badge-success">Success</span></td>
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

export default DeliveryList;
