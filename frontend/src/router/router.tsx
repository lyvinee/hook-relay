import { createBrowserRouter } from 'react-router';
import MainLayout from '../layouts/MainLayout';
import ClientLayout from '../layouts/ClientLayout';
import DevLayout from '../layouts/DevLayout';
// import AdminLayout from '../layouts/AdminLayout'; // TODO: Use when implementing role-based switching
import Login from '../pages/auth/Login';
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import Profile from '../pages/profile/Profile';
import WebhookList from '../pages/webhooks/WebhookList';
import WebhookCreate from '../pages/webhooks/WebhookCreate';
import WebhookDetail from '../pages/webhooks/WebhookDetail';
import EventList from '../pages/events/EventList';
import EventDetail from '../pages/events/EventDetail';
import DeliveryList from '../pages/deliveries/DeliveryList';
import DeliveryDetail from '../pages/deliveries/DeliveryDetail';
import DlqList from '../pages/dlq/DlqList';
import ClientList from '../pages/admin/clients/ClientList';
import ClientCreate from '../pages/admin/clients/ClientCreate';
import ClientDetail from '../pages/admin/clients/ClientDetail';
import UserList from '../pages/admin/users/UserList';
import UserCreate from '../pages/admin/users/UserCreate';
import UserDetail from '../pages/admin/users/UserDetail';
import RouteCatalog from '../pages/dev/RouteCatalog';
import ComponentLab from '../pages/dev/ComponentLab';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        // errorElement: <NotFound />,
        children: [
            {
                index: true,
                element: <Login />, // Redirect validation logic usually goes here or in MainLayout
            },
            {
                path: 'login',
                element: <Login />,
            },
            {
                path: 'dashboard',
                element: <ClientLayout />, // TODO: Implement conditional AdminLayout/ClientLayout based on role
                children: [
                    {
                        index: true,
                        element: <DashboardOverview />,
                    },
                    {
                        path: 'profile',
                        element: <Profile />,
                    },
                    {
                        path: 'webhooks',
                        children: [
                            { index: true, element: <WebhookList /> },
                            { path: 'new', element: <WebhookCreate /> },
                            { path: ':webhookId', element: <WebhookDetail /> },
                        ],
                    },
                    {
                        path: 'events',
                        children: [
                            { index: true, element: <EventList /> },
                            { path: ':eventId', element: <EventDetail /> },
                        ],
                    },
                    {
                        path: 'deliveries',
                        children: [
                            { index: true, element: <DeliveryList /> },
                            { path: ':deliveryId', element: <DeliveryDetail /> },
                        ],
                    },
                    {
                        path: 'dlq',
                        element: <DlqList />,
                    },
                    // Admin Routes
                    {
                        path: 'clients',
                        children: [
                            { index: true, element: <ClientList /> },
                            { path: 'new', element: <ClientCreate /> },
                            { path: ':clientId', element: <ClientDetail /> },
                        ],
                    },
                    {
                        path: 'users',
                        children: [
                            { index: true, element: <UserList /> },
                            { path: 'new', element: <UserCreate /> },
                            { path: ':userId', element: <UserDetail /> },
                        ],
                    },
                ],
            },
            // Dev Tools
            {
                path: 'dev',
                element: <DevLayout />,
                children: [
                    {
                        index: true,
                        element: <RouteCatalog />,
                    },
                    {
                        path: 'components/datatable',
                        element: <ComponentLab />,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export default router;
