import "dotenv/config";
import drizzleSeed from "drizzle-seed";
import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const db = drizzle(dbUrl, { schema });

  console.log("Usage commands **************");
  console.table([
    {
      command: "npm run seed:db",
      description: "Seed the database with sample data",
    },
    {
      command: "npm run seed:db reset",
      description: "Reset the database",
    },
  ]);

  const args = process.argv.slice(2);
  if (args.includes("reset")) {
    console.log("Resetting database...");
    await drizzleSeed.reset(db, schema);
    console.log("Database reset");
    return;
  }

  console.log("Seeding database...");
  await drizzleSeed
    .seed(db, {
      users: schema.users,
      clients: schema.clients,
      topics: schema.topics,
    })
    .refine((f) => ({
      users: { count: 10 },
      clients: { count: 5 },
      topics: { count: 5 },
    }));

  // Manual seeding for tables with unique constraints
  const users = await db.query.users.findMany();
  const clients = await db.query.clients.findMany();
  const topics = await db.query.topics.findMany();

  console.log("Seeding authMethods...");
  const authMethodsData = users.map((user) => ({
    userId: user.userId,
    methodType: schema.authMethodType.enumValues[0], // 'email'
    email: user.email,
    isPrimary: true,
    isVerified: true,
  }));
  if (authMethodsData.length > 0) {
    await db.insert(schema.authMethods).values(authMethodsData);
  }

  console.log("Seeding webhooks...");
  const webhooksData = clients.map((client) => ({
    clientId: client.clientId,
    endpointName: `Endpoint for ${client.name}`,
    targetUrl: `https://example.com/webhook/${client.slugName}`,
    isActive: true,
  }));

  let createdWebhooks: (typeof schema.webhooks.$inferSelect)[] = [];
  if (webhooksData.length > 0) {
    createdWebhooks = await db
      .insert(schema.webhooks)
      .values(webhooksData)
      .returning();
  }

  console.log("Seeding webhook subscriptions...");
  // Subscribe first webhook to first topic, etc.
  const subscriptionsData: (typeof schema.webhookSubscriptions.$inferInsert)[] =
    [];
  if (createdWebhooks.length > 0 && topics.length > 0) {
    createdWebhooks.forEach((webhook, idx) => {
      // Subscribe to all topics or random? Let's just subscribe to one topic per webhook to be safe and simple
      const topic = topics[idx % topics.length];
      subscriptionsData.push({
        webhookId: webhook.webhookId,
        topicId: topic.topicId,
        isActive: true,
      });
    });
    await db.insert(schema.webhookSubscriptions).values(subscriptionsData);
  } else {
    console.log("Skipping subscriptions (no webhooks or topics)");
  }

  // Seed events manually if needed, or skip. User complained about constraints preventing seeding "most stuff".
  // Let's seed some events for the first webhook
  if (createdWebhooks.length > 0 && topics.length > 0) {
    console.log("Seeding webhook events...");
    const webhook = createdWebhooks[0];
    const topic = topics[0];
    const eventsData = Array.from({ length: 10 }).map(() => ({
      webhookId: webhook.webhookId,
      topicId: topic.topicId,
      eventPayload: { test: "data", timestamp: new Date().toISOString() },
      eventTimestamp: new Date(),
      isActive: true,
    }));
    await db.insert(schema.webhookEvents).values(eventsData);
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
