import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { hash } from "argon2";
import * as schema from "./schema";
import {
    usersData,
    clientsData,
    topicsData,
    appConfigData,
    getWebhooksForClient,
    getSubscriptionsForWebhook,
} from "./seed/data";

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const db = drizzle(dbUrl, { schema });

    const args = process.argv.slice(2);
    const isReset = args.includes("reset");

    console.log("Usage commands **************");
    console.table([
        {
            command: "npm run seed:manual",
            description: "Seed the database with manual static data",
        },
        {
            command: "npm run seed:manual reset",
            description: "Reset the database (clear all data)",
        },
    ]);

    if (isReset) {
        console.log("Resetting database (clearing data)...");
        await resetDatabase(db);
        console.log("Database reset complete.");
        return;
    }

    console.log("Seeding database...");
    await seedDatabase(db);
    console.log("Seeding complete.");
}

async function resetDatabase(db: ReturnType<typeof drizzle<typeof schema>>) {
    // Delete in reverse dependency order
    // Leaf nodes first
    await db.delete(schema.webhookDlq);
    await db.delete(schema.webhookDeliveries);
    await db.delete(schema.webhookEvents);
    await db.delete(schema.webhookSubscriptions);
    await db.delete(schema.webhooks);

    await db.delete(schema.clients);
    await db.delete(schema.topics);
    await db.delete(schema.appConfig);

    await db.delete(schema.refreshTokenSessions);
    await db.delete(schema.authSessions);
    await db.delete(schema.authMethods);
    await db.delete(schema.users);

    await db.delete(schema.verificationChallenges);
    await db.delete(schema.signupAttempts);
}

async function seedDatabase(db: ReturnType<typeof drizzle<typeof schema>>) {
    // 1. Users
    console.log(`Seeding ${usersData.length} users...`);
    const insertedUsers = await db.insert(schema.users)
        .values(usersData)
        .returning({ userId: schema.users.userId, email: schema.users.email });

    // 2. Auth Methods (derived from users)
    console.log("Seeding auth methods...");
    const pwdHash = await hash("Password@123");
    const authMethodsData = insertedUsers.map((user) => ({
        userId: user.userId,
        methodType: schema.authMethodType.enumValues[0], // 'password'
        secretHash: pwdHash,
        isPrimary: true,
        isVerified: true,
    }));
    if (authMethodsData.length > 0) {
        await db.insert(schema.authMethods).values(authMethodsData);
    }

    // 3. Clients
    console.log(`Seeding ${clientsData.length} clients...`);
    const insertedClients = await db.insert(schema.clients)
        .values(clientsData)
        .returning({ clientId: schema.clients.clientId });

    // 4. Topics
    console.log(`Seeding ${topicsData.length} topics...`);
    const insertedTopics = await db.insert(schema.topics)
        .values(topicsData)
        .returning({ topicId: schema.topics.topicId });

    // 5. App Config
    console.log(`Seeding ${appConfigData.length} app config items...`);
    if (appConfigData.length > 0) {
        await db.insert(schema.appConfig).values(appConfigData).onConflictDoNothing();
    }

    // 6. Webhooks (for each client)
    console.log("Seeding webhooks...");
    const insertedWebhooks = [];
    for (const client of insertedClients) {
        const webhooksForClient = getWebhooksForClient(client.clientId);
        if (webhooksForClient.length > 0) {
            const result = await db.insert(schema.webhooks)
                .values(webhooksForClient)
                .returning({ webhookId: schema.webhooks.webhookId });
            insertedWebhooks.push(...result);
        }
    }

    // 7. Webhook Subscriptions (for each webhook, subscribe to random or all topics)
    console.log("Seeding webhook subscriptions...");
    const topicIds = insertedTopics.map(t => t.topicId);
    const subscriptionData = [];

    if (topicIds.length > 0) {
        for (const webhook of insertedWebhooks) {
            // Just subscribe to all topics for simplicity in this manual seed, 
            // or we could randomize it. Let's subscribe to all for now.
            const subs = getSubscriptionsForWebhook(webhook.webhookId, topicIds);
            subscriptionData.push(...subs);
        }

        if (subscriptionData.length > 0) {
            await db.insert(schema.webhookSubscriptions).values(subscriptionData);
        }
    }
}

main()
    .catch((err) => {
        console.error("Error seeding database:", err);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
