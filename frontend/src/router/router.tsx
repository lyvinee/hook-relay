import { createBrowserRouter } from 'react-router';
import MainLayout from '../layouts/MainLayout';
import DevLayout from '../layouts/DevLayout';
import Login from '../pages/auth/Login';
import RouteCatalog from '../pages/dev/RouteCatalog';
import ComponentLab from '../pages/dev/ComponentLab';
import NotFound from '../pages/NotFound';

import DashboardLayout from '../layouts/DashboardLayout';
import UserCreate from '../pages/admin/users/UserCreate';
import UserDetail from '../pages/admin/users/UserDetail';
import UserList from '../pages/admin/users/UserList';
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import DeliveryDetail from '../pages/deliveries/DeliveryDetail';
import DeliveryList from '../pages/deliveries/DeliveryList';
import DlqList from '../pages/dlq/DlqList';
import DlqDetail from '../pages/dlq/DlqDetail';
import EventDetail from '../pages/events/EventDetail';
import EventCreate from "../pages/events/EventCreate";
import TopicList from "../pages/topics/TopicList";
import TopicCreate from "../pages/topics/TopicCreate";
import TopicDetail from "../pages/topics/TopicDetail";
import EventList from '../pages/events/EventList'; // Keep this
import Profile from '../pages/profile/Profile';
import WebhookCreate from '../pages/webhooks/WebhookCreate';
import WebhookDetails from '../pages/webhooks/WebhookDetails';
import WebhookList from '../pages/webhooks/WebhookList';
import ClientList from '../pages/clients/ClientList';
import CreateClient from '../pages/clients/CreateClient';
import ClientDetails from '../pages/clients/ClientDetails';
import ClientEdit from '../pages/clients/ClientEdit';

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        // errorElement: <NotFound />,
        children: [
            {
                index: true,
                element: <Login />,
            },
            {
                path: 'login',
                element: <Login />,
            },
            {
                path: '/dashboard',
                element: <DashboardLayout />,
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
                            { path: ':id', element: <WebhookDetails /> },
                        ],
                    },
                    {
                        path: 'topics',
                        children: [
                            { index: true, element: <TopicList /> },
                            { path: 'new', element: <TopicCreate /> },
                            { path: ':id', element: <TopicDetail /> },
                        ],
                    },
                    {
                        path: 'events',
                        children: [
                            { index: true, element: <EventList /> },
                            { path: 'new', element: <EventCreate /> },
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
                        children: [
                            { index: true, element: <DlqList /> },
                            { path: ':id', element: <DlqDetail /> },
                        ]
                    },
                    {
                        path: 'clients',
                        children: [
                            { index: true, element: <ClientList /> },
                            { path: 'new', element: <CreateClient /> },
                            { path: 'view/:id', element: <ClientDetails /> },
                            { path: 'edit/:id', element: <ClientEdit /> },
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
                ]
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
