import { useLocation, useParams } from 'react-router';

const DlqList = () => {
    const location = useLocation();
    // const navigate = useNavigate();
    const params = useParams();

    return (
        <div>
            <h1>DLQ List</h1>
            <p>Placeholder for DLQ List</p>
            <pre>{JSON.stringify({ location, params }, null, 2)}</pre>
        </div>
    );
};

export default DlqList;
