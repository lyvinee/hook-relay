import { boolean, integer, unique } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { jsonb } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role_type", ["user", "admin"]);
export const authMethodType = pgEnum("auth_method_type", [
  "email",
  "google",
  "github",
]);
export const webhookDeliveryStatus = pgEnum("webhook_delivery_status", [
  "pending",
  "success",
  "failed",
  "dlq",
]);

export const users = pgTable("users", {
  userId: uuid("user_id").defaultRandom().primaryKey(),
  role: userRole("role").notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const authMethods = pgTable(
  "auth_methods",
  {
    authMethodId: uuid("auth_method_id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.userId),
    methodType: authMethodType("method_type").notNull(),
    providerUserId: varchar("provider_user_id", { length: 200 }),
    secretHash: varchar("secret_hash", { length: 200 }),
    isPrimary: boolean("is_primary").default(false),
    isVerified: boolean("is_verified").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.methodType)],
);

export const clients = pgTable(
  "clients",
  {
    clientId: uuid("client_id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slugName: varchar("slug_name", { length: 200 }).notNull(),
    isActive: boolean("is_active").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [unique().on(t.slugName)],
);

export const webhooks = pgTable(
  "webhooks",
  {
    webhookId: uuid("webhook_id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.clientId),
    endpointName: varchar("endpoint_name", { length: 200 }).notNull(),
    targetUrl: varchar("target_url", { length: 200 }).notNull(),
    hmacSecret: varchar("hmac_secret", { length: 200 }),
    retryPolicy: jsonb("retry_policy"),
    timeoutMs: integer("timeout_ms").default(5000),
    isActive: boolean("is_active").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [unique().on(t.clientId)],
);

export const topics = pgTable("topics", {
  topicId: uuid("topic_id").defaultRandom().primaryKey(),
  topicName: varchar("topic_name", { length: 200 }).notNull(),
  topicSlugId: varchar("topic_slug_id", { length: 200 }).notNull().unique(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const webhookEvents = pgTable("webhook_events", {
  webhookEventId: uuid("webhook_event_id").defaultRandom().primaryKey(),
  webhookId: uuid("webhook_id")
    .notNull()
    .references(() => webhooks.webhookId),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.topicId),
  eventPayload: jsonb("event_payload").notNull(),
  eventTimestamp: timestamp("event_timestamp", {
    withTimezone: true,
  }).notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const webhookSubscriptions = pgTable(
  "webhook_subscriptions",
  {
    webhookSubscriptionId: uuid("webhook_subscription_id")
      .defaultRandom()
      .primaryKey(),
    webhookId: uuid("webhook_id")
      .notNull()
      .references(() => webhooks.webhookId),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.topicId),
    isActive: boolean("is_active").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [unique().on(t.webhookId, t.topicId)],
);

export const webhookDeliveries = pgTable("webhook_deliveries", {
  webhookDeliveryId: uuid("webhook_delivery_id").defaultRandom().primaryKey(),
  webhookEventId: uuid("webhook_event_id")
    .notNull()
    .references(() => webhookEvents.webhookEventId),
  deliveryPayload: jsonb("delivery_payload").notNull(),
  deliveryTimestamp: timestamp("delivery_timestamp", {
    withTimezone: true,
  }).notNull(),
  deliveryStatus: webhookDeliveryStatus("delivery_status")
    .notNull()
    .default("pending"),
  deliveryAttempts: integer("delivery_attempts").notNull().default(0),
  deliveryRetryAfter: timestamp("delivery_retry_after", { withTimezone: true }),
  deliveryError: jsonb("delivery_error"),
  deliveryResponse: jsonb("delivery_response"),
  deliveryResponseStatus: integer("delivery_response_status")
    .notNull()
    .default(0),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const webhookDlq = pgTable("webhook_dlq", {
  webhookDlqId: uuid("webhook_dlq_id").defaultRandom().primaryKey(),
  webhookDeliveryId: uuid("webhook_delivery_id")
    .notNull()
    .references(() => webhookDeliveries.webhookDeliveryId),
  deliveryPayload: jsonb("delivery_payload").notNull(),
  deliveryTimestamp: timestamp("delivery_timestamp", {
    withTimezone: true,
  }).notNull(),
  deliveryStatus: webhookDeliveryStatus("delivery_status")
    .notNull()
    .default("pending"),
  deliveryAttempts: integer("delivery_attempts").notNull().default(0),
  deliveryRetryAfter: timestamp("delivery_retry_after", { withTimezone: true }),
  deliveryError: jsonb("delivery_error"),
  deliveryResponse: jsonb("delivery_response"),
  deliveryResponseStatus: integer("delivery_response_status")
    .notNull()
    .default(0),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const appConfig = pgTable("app_config", {
  key: varchar("key", { length: 200 }).primaryKey(),
  value: jsonb("value").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(
    () => new Date(),
  ),
});
