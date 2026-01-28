import {
    users,
    clients,
    topics,
    appConfig,
    webhooks,
    webhookSubscriptions,
    authMethodType,
    userRole,
    userStatus
} from "../schema";
import { InferInsertModel } from "drizzle-orm";

type UserInsert = InferInsertModel<typeof users>;
type ClientInsert = InferInsertModel<typeof clients>;
type TopicInsert = InferInsertModel<typeof topics>;
type AppConfigInsert = InferInsertModel<typeof appConfig>;
type WebhookInsert = InferInsertModel<typeof webhooks>;
type WebhookSubscriptionInsert = InferInsertModel<typeof webhookSubscriptions>;

export const usersData: Omit<UserInsert, "userId" | "createdAt" | "updatedAt">[] = [
    {
        email: "admin@example.com",
        role: "admin",
        status: "active",
        activatedAt: new Date(),
    },
    {
        email: "user@example.com",
        role: "user",
        status: "active",
        activatedAt: new Date(),
    },
];

export const clientsData: Omit<ClientInsert, "clientId" | "createdAt" | "updatedAt">[] = [
    {
        name: "Acme Corp",
        slugName: "acme-corp",
        isActive: true,
    },
    {
        name: "Globex Corporation",
        slugName: "globex",
        isActive: true,
    },
    {
        name: "Soylent Corp",
        slugName: "soylent",
        isActive: false,
    },
];

export const topicsData: Omit<TopicInsert, "topicId" | "createdAt" | "updatedAt">[] = [
    {
        topicName: "Invoice Paid",
        topicSlugId: "invoice.paid",
        isActive: true,
    },
    {
        topicName: "Customer Created",
        topicSlugId: "customer.created",
        isActive: true,
    },
    {
        topicName: "Subscription Canceled",
        topicSlugId: "subscription.canceled",
        isActive: true,
    },
];

export const appConfigData: Omit<AppConfigInsert, "createdAt" | "updatedAt">[] = [
    {
        key: "maintenance_mode",
        value: { enabled: false },
        isActive: true,
    },
    {
        key: "feature_flags",
        value: { new_dashboard: true, beta_features: false },
        isActive: true,
    },
];

export const getWebhooksForClient = (clientId: string): Omit<WebhookInsert, "webhookId" | "createdAt" | "updatedAt">[] => {
    return [
        {
            clientId: clientId,
            endpointName: "Main Endpoint",
            targetUrl: `https://webhook.site/${clientId}/main`,
            isActive: true,
            timeoutMs: 5000,
        },
        {
            clientId: clientId,
            endpointName: "Backup Endpoint",
            targetUrl: `https://webhook.site/${clientId}/backup`,
            isActive: true,
            timeoutMs: 10000,
        },
    ];
};

export const getSubscriptionsForWebhook = (webhookId: string, topicIds: string[]): Omit<WebhookSubscriptionInsert, "webhookSubscriptionId" | "createdAt" | "updatedAt">[] => {
    return topicIds.map(topicId => ({
        webhookId,
        topicId,
        isActive: true,
    }));
};
