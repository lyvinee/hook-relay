export const navigations = {
    // Public
    login: '/login',

    // Dashboard (Client & Admin)
    dashboard: '/dashboard',
    profile: '/dashboard/profile',

    // Webhooks
    webhooks: '/dashboard/webhooks',
    createWebhook: '/dashboard/webhooks/new',
    webhook: (webhookId: string) => `/dashboard/webhooks/${webhookId}`,

    // Events
    events: '/dashboard/events',
    event: (eventId: string) => `/dashboard/events/${eventId}`,

    // Topics
    topics: "/dashboard/topics",
    topic: (topicId: string) => `/dashboard/topics/${topicId}`,
    topicNew: "/dashboard/topics/new",

    // Deliveries
    deliveries: '/dashboard/deliveries',
    delivery: (deliveryId: string) => `/dashboard/deliveries/${deliveryId}`,

    // DLQ
    dlq: '/dashboard/dlq',

    // Admin Only - Clients
    clients: '/dashboard/clients',
    createClient: '/dashboard/clients/new',
    clientView: (clientId: string) => `/dashboard/clients/view/${clientId}`,
    clientEdit: (clientId: string) => `/dashboard/clients/edit/${clientId}`,

    // Admin Only - Users
    users: '/dashboard/users',
    createUser: '/dashboard/users/new',
    user: (userId: string) => `/dashboard/users/${userId}`,
};
