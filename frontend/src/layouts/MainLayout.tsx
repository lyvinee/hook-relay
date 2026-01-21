import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuthRefresh, useAuthGetMe } from '../gen/client/auth/auth';
import { useAuthStore } from '../store/authStore';
import { navigations } from '../config/navigation';
import Loader from '../components/Loader';


type AuthenticationState = "loading" | "authenticated" | "profile-loaded" | "error";



const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Global Auth State
    const {
        setAccessToken,
        setUser,
    } = useAuthStore();

    const [authenticationState, setAuthenticationState] = React.useState<AuthenticationState>("loading");
    const refreshAuth = useAuthRefresh();
    const fetchMe = useAuthGetMe({
        query: { enabled: authenticationState === "authenticated" }
    });

    const handleAuthInit = React.useCallback(async () => {
        try {
            const result = await refreshAuth.mutateAsync();
            setAccessToken(result.data.accessToken);
            setAuthenticationState("authenticated");
        } catch (error) {
            console.error("Auth initialization failed:", error);
            setAuthenticationState("error");
        }
    }, [refreshAuth, setAccessToken]);


    useEffect(() => {
        handleAuthInit();
    }, [])

    useEffect(() => {
        if (fetchMe.data?.data) {
            setUser(fetchMe.data.data)
            setAuthenticationState("profile-loaded");
        }
    }, [fetchMe])

    useEffect(() => {
        if (authenticationState === "error") {
            // Only redirect if NOT on a public page
            const publicPaths = ['/login', '/dev'];
            const isPublic = publicPaths.some(path => location.pathname.startsWith(path));

            if (!isPublic) {
                navigate("/login");
            }
        }
    }, [authenticationState, location.pathname, navigate])

    // Redirect authenticated users away from public pages like Login
    useEffect(() => {
        const isPublicAuthPage = location.pathname === '/login';
        if ((authenticationState === "authenticated" || authenticationState === "profile-loaded") && isPublicAuthPage) {
            navigate(navigations.dashboard);
        }
    }, [authenticationState, location.pathname, navigate]);



    // Render
    if (authenticationState === "loading") {
        return <Loader />;
    }

    return (
        <div className="font-sans antialiased text-base-content min-h-screen">
            <Outlet />
        </div>
    );
};

export default MainLayout;
