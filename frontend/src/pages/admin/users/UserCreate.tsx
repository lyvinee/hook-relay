import { useLocation, useNavigate, useParams } from 'react-router';
import { navigations } from '../../../config/navigation';

const UserCreate = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const handleSave = () => {
        navigate(navigations.users);
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(navigations.users)} className="btn btn-ghost">Back</button>
                <h1 className="text-2xl font-bold">Create User</h1>
            </div>

            <div className="card bg-base-100 shadow-xl max-w-2xl">
                <div className="card-body">
                    <p>Form placeholder...</p>
                    <div className="card-actions justify-end mt-4">
                        <button onClick={() => navigate(navigations.users)} className="btn btn-ghost">Cancel</button>
                        <button onClick={handleSave} className="btn btn-primary">Save User</button>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-base-200 rounded">
                <pre>{JSON.stringify({ location, params }, null, 2)}</pre>
            </div>
        </div>
    );
};

export default UserCreate;
