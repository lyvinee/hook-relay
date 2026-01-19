import { useLocation, useNavigate, useParams } from 'react-router';
import { navigations } from '../../config/navigation';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const handleLogin = () => {
        // Simulate login and navigate to dashboard
        navigate(navigations.dashboard);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <p className="mb-4">Placeholder for Login Page</p>
                <button
                    onClick={handleLogin}
                    className="btn btn-primary w-full"
                >
                    Sign In
                </button>
                <div className="mt-4 text-xs text-gray-400">
                    <pre>{JSON.stringify({ location, params }, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default Login;
