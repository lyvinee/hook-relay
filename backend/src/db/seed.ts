import "dotenv/config";
import drizzleSeed from "drizzle-seed";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { hash } from "argon2";















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
      appConfig: schema.appConfig,
    })
    .refine((f) => ({
      users: {
        count: 10,
        columns: {
          userId: f.uuid(),
        },
      },
      clients: {
        count: 5,
        columns: {
          clientId: f.uuid(),
        },
      },
      topics: {
        count: 5,
        columns: {
          topicId: f.uuid(),
        },
      },
      appConfig: {
        count: 2,
      },
    }));


  const pwdHash = await hash("Password@123");

  const users = await db.query.users.findMany();

  console.log("Seeding authMethods...");
  await db.insert(schema.authMethods).values(users.map((user) => ({
    userId: user.userId,
    methodType: schema.authMethodType.enumValues[0], // 'password'
    secretHash: pwdHash,
    isPrimary: true,
    isVerified: true,
  })));


  // seed webhooks
  const clients = await db.query.clients.findMany();

  console.log("Seeding webhooks...");
  const webhooks = await db
    .insert(schema.webhooks)
    .values(
      clients.map(c => ({
        clientId: c.clientId,
        endpointName: `Endpoint for ${c.name}`,
        targetUrl: `https://example.com/webhook/${c.slugName}`,
        isActive: true,
      })),
    )
    .returning();

  // webhook subscriptions
  const topics = await db.query.topics.findMany();

  console.log("Seeding webhook subscriptions...");
  await db.insert(schema.webhookSubscriptions).values(
    webhooks.map((w, i) => ({
      webhookId: w.webhookId,
      topicId: topics[i % topics.length].topicId,
      isActive: true,
    })),
  );

  console.log("Seeding app config...");
  await db
    .insert(schema.appConfig)
    .values([
      {
        key: "maintenance_mode",
        value: { enabled: false },
        isActive: true,
      },
      {
        key: "feature_flags",
        value: { new_dashboard: true },
        isActive: true,
      },
    ])
    .onConflictDoNothing();
}

main()
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
