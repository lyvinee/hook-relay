import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuthRefresh, useAuthGetMe } from "../gen/client/auth/auth";
import { useAuthStore } from "../store/authStore";
import { navigations } from "../config/navigation";
import { toast } from "sonner";
import Loader from "../components/Loader";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Global Auth State
  const { accessToken, setAccessToken, setUser, user, logout } = useAuthStore();

  const refreshAuth = useAuthRefresh({
    mutation: {
      onSuccess(data) {
        setAccessToken(data.data.accessToken);
      },
      onError(error) {
        console.error("Auth refresh failed:", error);
        if (!accessToken) {
          navigate(navigations.login);
        }
      },
    },
  });

  const fetchMe = useAuthGetMe({
    query: { enabled: !!accessToken },
  });

  useEffect(() => {
    console.group("MainLayout Initializer");
    console.log("accessToken", accessToken);
    console.log("user", user);
    console.groupEnd();

    if (!accessToken || !user) {
      refreshAuth.mutate();
    }


  }, [])

  useEffect(() => {
    if (refreshAuth.isSuccess) {
      fetchMe.refetch();
    } else if (refreshAuth.isError) {
      if (accessToken) return;

      if (location.pathname.includes("login")) return;
      navigate(navigations.login);
    }


  }, [refreshAuth.isSuccess, refreshAuth.isError, location.pathname, accessToken])

  useEffect(() => {
    console.log("trigger 1")
    if (fetchMe.isSuccess) {
      console.log("fetch me data", fetchMe.data.data);
      setUser(fetchMe.data.data);
    } else if (fetchMe.isError) {
      toast.error("unable to fetch user profile, please login again.")
      logout(); // Clear session to prevent loop
      navigate(navigations.login);
    }
  }, [fetchMe.isSuccess, fetchMe.isError])

  useEffect(() => {
    console.log("triggerer")
    if (user && (location.pathname === "/" || location.pathname === navigations.login)) {
      console.log("path name", location.pathname);
      console.log("user", user);
      navigate(navigations.dashboard);
    } else {
      console.log("path name other paht", location.pathname);
      console.log("user other path", user);
    }
  }, [user, location.pathname, navigate]);

  if (fetchMe.isLoading || refreshAuth.isPending) return <Loader />


  return (
    <div className="font-sans antialiased text-base-content min-h-screen">
      <Outlet />
    </div>
  );
};

export default MainLayout;
