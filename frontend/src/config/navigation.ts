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

    // Deliveries
    deliveries: '/dashboard/deliveries',
    delivery: (deliveryId: string) => `/dashboard/deliveries/${deliveryId}`,

    // DLQ
    dlq: '/dashboard/dlq',

    // Admin Only - Clients
    clients: '/dashboard/clients',
    createClient: '/dashboard/clients/new',
    client: (clientId: string) => `/dashboard/clients/${clientId}`,

    // Admin Only - Users
    users: '/dashboard/users',
    createUser: '/dashboard/users/new',
    user: (userId: string) => `/dashboard/users/${userId}`,
};
