import { useAuthStore } from "../store/authStore";
import AdminLayout from "./AdminLayout";
import ClientLayout from "./ClientLayout";
import Loader from "../components/Loader";



export default function DashboardLayout() {

    const { user } = useAuthStore();

    if (!user) return null;

    if (user.role === "admin") return <AdminLayout />
    if (user.role === "client") return <ClientLayout />

    return (
        <div>
            <Loader />
        </div>
    )
}   