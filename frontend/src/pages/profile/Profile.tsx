import { useLocation, useParams } from 'react-router';

const Profile = () => {
    const location = useLocation();
    // const navigate = useNavigate();
    const params = useParams();

    return (
        <div>
            <h1>Profile</h1>
            <p>Placeholder for Profile Page</p>
            <pre>{JSON.stringify({ location, params }, null, 2)}</pre>
        </div>
    );
};

export default Profile;
