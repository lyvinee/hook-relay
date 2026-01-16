import { boolean, integer, unique } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { jsonb } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const createUpdateTimeStamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}


export const userRole = pgEnum("user_role_type", ["user", "admin"]);
export const signUpAttemptStatus = pgEnum("sign_up_attempt_status", [
  "pending",
  "expired",
  "active"
]);

export const userStatus = pgEnum("user_status", [
  "active",
  "disabled",
  "soft_deleted"
]);

export const authMethodType = pgEnum("auth_method_type", [
  "password",
  "google",
  "github",
]);
export const webhookDeliveryStatus = pgEnum("webhook_delivery_status", [
  "pending",
  "success",
  "failed",
  "dlq",
]);

export const verificationChannel = pgEnum("verification_channel", [
  "email",
  "sms",
]);

export const verificationChallengeFlowType = pgEnum("verification_challenge_flow_type", [
  "sign_up",
  "forgot_password",
]);

export const authSessionStatus = pgEnum("auth_session_status", [
  "active",
  "expired",
  "revoked",
]);

export const users = pgTable("users", {
  userId: uuid("user_id").defaultRandom().primaryKey(),
  role: userRole("role").notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  status: userStatus("status").notNull(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  ...createUpdateTimeStamps,
});

export const signupAttempts = pgTable("signup_attempts", {
  signupAttemptId: uuid("signup_attempt_id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 200 }).notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  status: signUpAttemptStatus("status").notNull(),
  provider: authMethodType("provider").notNull(),
  ...createUpdateTimeStamps,
})


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
  (t) => [unique().on(t.clientId, t.targetUrl)],
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
  webhookIdempotencyKey: varchar("webhook_idempotency_key", { length: 200 }).notNull().unique(),
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
  permanentlyFailedAt: timestamp("permanently_failed_at", { withTimezone: true }),
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

export const verificationChallenges = pgTable(
  "verification_challenges",
  {
    verificationChallengeId: uuid("verification_challenge_id")
      .defaultRandom()
      .primaryKey(),
    flowType: verificationChallengeFlowType("flow_type").notNull(),
    flowId: uuid("flow_id").notNull(),
    channel: verificationChannel("channel").notNull(),
    secretHash: varchar("secret_hash", { length: 400 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    attemptCount: integer("attempt_count").default(0).notNull(),
    ...createUpdateTimeStamps,
  },
  (t) => [
    unique().on(t.flowType, t.flowId, t.channel),
  ],
);


export const authSessions = pgTable("auth_sessions", {
  authSessionId: uuid("auth_session_id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.userId),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  status: authSessionStatus("status").notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  ipHash: varchar("ip_hash", { length: 200 }),
  userAgent: varchar("user_agent", { length: 200 }),
  ...createUpdateTimeStamps,
})

export const refreshTokenSessions = pgTable("refresh_token_sessions", {
  refreshTokenSessionId: uuid("refresh_token_session_id").defaultRandom().primaryKey(),
  authSessionId: uuid("auth_session_id").notNull().references(() => authSessions.authSessionId),
  tokenHash: varchar("token_hash", { length: 200 }).notNull(),
  lookupHash: varchar("lookup_hash", { length: 200 }).notNull(),
  rotatedAt: timestamp("rotated_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...createUpdateTimeStamps,
})

// ---------------------------------- RELATIONS


export const usersRelations = relations(users, ({ many }) => ({
  authMethods: many(authMethods),
}));

export const authMethodsRelations = relations(authMethods, ({ one }) => ({
  user: one(users, {
    fields: [authMethods.userId],
    references: [users.userId],
  }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  webhooks: many(webhooks),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  client: one(clients, {
    fields: [webhooks.clientId],
    references: [clients.clientId],
  }),
  subscriptions: many(webhookSubscriptions),
  events: many(webhookEvents),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  subscriptions: many(webhookSubscriptions),
  events: many(webhookEvents),
}));

export const webhookSubscriptionsRelations = relations(
  webhookSubscriptions,
  ({ one }) => ({
    webhook: one(webhooks, {
      fields: [webhookSubscriptions.webhookId],
      references: [webhooks.webhookId],
    }),
    topic: one(topics, {
      fields: [webhookSubscriptions.topicId],
      references: [topics.topicId],
    }),
  }),
);

export const webhookEventsRelations = relations(webhookEvents, ({ one, many }) => ({
  webhook: one(webhooks, {
    fields: [webhookEvents.webhookId],
    references: [webhooks.webhookId],
  }),
  topic: one(topics, {
    fields: [webhookEvents.topicId],
    references: [topics.topicId],
  }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(
  webhookDeliveries,
  ({ one }) => ({
    event: one(webhookEvents, {
      fields: [webhookDeliveries.webhookEventId],
      references: [webhookEvents.webhookEventId],
    }),
    dlq: one(webhookDlq),
  }),
);

export const webhookDlqRelations = relations(webhookDlq, ({ one }) => ({
  delivery: one(webhookDeliveries, {
    fields: [webhookDlq.webhookDeliveryId],
    references: [webhookDeliveries.webhookDeliveryId],
  }),
}));

export const authSessionsRelations = relations(authSessions, ({ many, one }) => ({
  user: one(users, {
    fields: [authSessions.userId],
    references: [users.userId],
  }),
  refreshTokenSessions: many(refreshTokenSessions),
}))

export const refreshTokenSessionsRelations = relations(refreshTokenSessions, ({ one }) => ({
  authSession: one(authSessions, {
    fields: [refreshTokenSessions.authSessionId],
    references: [authSessions.authSessionId],
  }),
}))
