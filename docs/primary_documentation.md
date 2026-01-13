Below is a **clean, production-oriented README** for **HookRelay (MVP)**, written so you can directly start **planning, designing APIs, and assigning responsibilities**.
This README assumes **at-least-once delivery**, async processing, and a DB-centric dispatcher.

---

# HookRelay — MVP README

## Overview

**HookRelay** is a multi-tenant webhook relay platform that allows clients to:

* Register webhook endpoints
* Subscribe to topics
* Receive events reliably
* Get retries and DLQ for failed deliveries

The system is designed around **event immutability** and **delivery state machines**.

---

## Core Concepts (Mental Model)

| Concept  | Meaning                                  |
| -------- | ---------------------------------------- |
| User     | Authenticated human or system actor      |
| Client   | Tenant / customer using HookRelay        |
| Event    | Immutable business fact                  |
| Topic    | Routing namespace for events             |
| Webhook  | Destination endpoint                     |
| Delivery | Attempt to send one event to one webhook |
| DLQ      | Terminal failure store                   |

> **Events are facts. Deliveries are attempts.**

---

## MVP Scope

### Functional

1. Register users and clients
2. Register webhook endpoints
3. Create events
4. Fan-out and process deliveries
5. Retry failures and move to DLQ

### Non-Goals (MVP)

* Exactly-once delivery
* Streaming consumers
* Schema registry
* Advanced filtering (payload rules)

---

## Data Model

### 1. Users

Represents authenticated actors.

```
users
```

| Field                 | Purpose             |
| --------------------- | ------------------- |
| id                    | Primary identifier  |
| role                  | `ADMIN` or `CLIENT` |
| email                 | Login identity      |
| isActive              | Soft access control |
| createdAt / updatedAt | Audit               |

---

### 2. Auth Methods

Supports multiple authentication methods per user.

```
auth_methods
```

| Field          | Purpose                |
| -------------- | ---------------------- |
| userId         | Owner                  |
| provider       | password / oauth / otp |
| providerUserId | External ID            |
| secretHash     | Password / OTP secret  |
| isPrimary      | Preferred login        |
| isVerified     | Trust flag             |
| metadata       | Provider-specific data |

---

### 3. Clients (Tenants)

Logical owner of webhooks and events.

```
clients
```

| Field                    | Purpose              |
| ------------------------ | -------------------- |
| clientName / displayName | Human readable       |
| slugName                 | URL-safe unique name |
| userId                   | Owner                |
| isActive                 | Tenant control       |
| deletedAt                | Soft delete          |

---

### 4. Webhooks

Registered destinations.

```
webhooks
```

| Field        | Purpose          |
| ------------ | ---------------- |
| clientId     | Owner            |
| endpointName | Friendly name    |
| targetUrl    | HTTPS endpoint   |
| hmacSecret   | Signature secret |
| retryPolicy  | Backoff config   |
| timeoutMs    | Request timeout  |
| isActive     | Enable/disable   |

**Rules**

* HTTPS only
* No private IPs
* Secrets never logged

---

### 5. Topics

Routing namespaces.

```
webhook_topics
```

| Field     | Purpose        |
| --------- | -------------- |
| topicName | e.g. `orders`  |
| isActive  | Routing toggle |

Topics are **stable** and long-lived.

---

### 6. Events

Immutable business facts.

```
webhook_events
```

| Field        | Purpose           |
| ------------ | ----------------- |
| eventName    | `order.created`   |
| eventPayload | JSON snapshot     |
| topicId      | Routing           |
| eventId      | Unique identifier |

**Rules**

* Written once
* Never updated
* Never retried

---

### 7. Webhook Subscriptions

Defines interest.

```
webhook_subscriptions
```

| Field     | Purpose        |
| --------- | -------------- |
| clientId  | Tenant         |
| webhookId | Destination    |
| topicId   | Subscription   |
| isActive  | Enable/disable |

This allows:

* One webhook → many topics
* One topic → many webhooks

---

### 8. Webhook Deliveries

Tracks delivery attempts.

```
webhook_delivery
```

| Field                 | Purpose                               |
| --------------------- | ------------------------------------- |
| eventId               | What happened                         |
| webhookId             | Where to send                         |
| status                | pending / retrying / success / failed |
| attemptCount          | Retry count                           |
| lastAttemptAt         | Observability                         |
| nextRetryAt           | Scheduling                            |
| responseCode          | HTTP status                           |
| error / responseBody  | Debug                                 |
| createdAt / updatedAt | Audit                                 |

**This is the retry queue.**

---

### 9. Dead Letter Queue (DLQ)

Terminal failures.

```
webhook_dlq
```

(derived from `webhook_delivery` where `status = failed`)

Purpose:

* Manual replay
* Client support
* Compliance

---

## Event → Delivery Lifecycle

### 1. Business Action

Client or internal system triggers an action.

### 2. Event Creation (Sync)

Event is written inside the business transaction.

```
INSERT INTO webhook_events (...)
```

No HTTP calls here.

---

### 3. Dispatcher (Async)

Background worker:

1. Reads undispatched events
2. Resolves subscriptions
3. Creates delivery rows

```
event → N deliveries
```

---

### 4. Delivery Worker

Worker picks deliveries:

* `status = pending OR retrying`
* `nextRetryAt <= now()`

Uses row locking to avoid duplication.

---

### 5. Delivery Outcome

| Result        | Action            |
| ------------- | ----------------- |
| 2xx           | Mark success      |
| Timeout / 5xx | Retry             |
| Max retries   | Mark failed → DLQ |

---

## Retry Strategy (MVP)

* Exponential backoff
* Max retries configurable per webhook
* Jitter recommended

Example:

```
2^attempt minutes
```

---

## Security

### Webhook Signing

Each request includes:

* `X-Signature`
* `X-Timestamp`

Signature:

```
HMAC_SHA256(secret, payload + timestamp)
```

---

## Operational Queries

### Unsent Events

```sql
SELECT * FROM webhook_delivery
WHERE status IN ('pending', 'retrying');
```

### Ready for Retry

```sql
SELECT * FROM webhook_delivery
WHERE status = 'retrying'
AND nextRetryAt <= now();
```

---

## Invariants (Non-Negotiable)

* Events are immutable
* Deliveries are stateful
* No synchronous webhook calls
* Retries mutate deliveries only
* Fan-out is deterministic

---

## MVP Architecture (Logical)

```
API
 ├─ Auth
 ├─ Client Management
 ├─ Webhook Management
 └─ Event Ingest
        ↓
Database (Events)
        ↓
Dispatcher
        ↓
Deliveries
        ↓
Workers
        ↓
Client Endpoints
```

---

## What This MVP Enables Later

* Kafka / SNS / PubSub backing
* Event versioning
* Payload filtering
* Per-webhook ordering
* Exactly-once via idempotency keys

---
