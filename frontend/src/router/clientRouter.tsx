import type { RouteObject } from "react-router";
import UserCreate from "../pages/admin/users/UserCreate";
import UserDetail from "../pages/admin/users/UserDetail";
import UserList from "../pages/admin/users/UserList";
import DashboardOverview from "../pages/dashboard/DashboardOverview";
import DeliveryDetail from "../pages/deliveries/DeliveryDetail";
import DeliveryList from "../pages/deliveries/DeliveryList";
import DlqList from "../pages/dlq/DlqList";
import EventDetail from "../pages/events/EventDetail";
import EventList from "../pages/events/EventList";
import Profile from "../pages/profile/Profile";
import WebhookCreate from "../pages/webhooks/WebhookCreate";
import WebhookDetails from "../pages/webhooks/WebhookDetails";
import WebhookList from "../pages/webhooks/WebhookList";



export const clientRoutes: RouteObject[] = [
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
    {
        path: 'users',
        children: [
            { index: true, element: <UserList /> },
            { path: 'new', element: <UserCreate /> },
            { path: ':userId', element: <UserDetail /> },
        ],
    },
]