import { useLocation, useNavigate, useParams } from 'react-router';
import { navigations } from '../../../config/navigation';

const ClientList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Clients</h1>
                <button
                    onClick={() => navigate(navigations.createClient)}
                    className="btn btn-primary"
                >
                    Create Client
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover" onClick={() => navigate(navigations.client('sub_123'))} style={{ cursor: 'pointer' }}>
                            <td>sub_123</td>
                            <td>Example Client</td>
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

export default ClientList;
