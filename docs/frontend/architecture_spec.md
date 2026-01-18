# Frontend Architecture & Implementation Specification

> **Context**: This specification is refined from `flow.md` to serve as a context for AI agents and developers implementing the `hook-relay` frontend.

## 1. High-Level Overview
The application is a dual-portal system (Client & Admin) built with React. It uses a centralized "gatekeeper" layout to route users based on their authentication status and role (Admin vs Client).

## 2. Core Technologies
- **Framework**: React (Vite)
- **State Management**: Zustand (ephemeral, in-memory)
- **Routing**: React Router
- **API Client**: Orval (generated from OpenAPI)
- **Forms**: React Hook Form + Zod + @hookform/resolvers
- **UI Components**: 
  - Tables: @tanstack/react-table
  - Toasts: Sonner
  - Styling: DaisyUI/Tailwind (Implied)

## 3. Authentication & Authorization Flow

### 3.1 Auth Store (`authStore`)
- **Type**: Zustand Store
- **Persistence**: In-memory (Ephemeral).
- **State Variables**:
  - `accessToken`: String | null
  - `userProfile`: User object (includes role)
  - `isAuthenticated`: Boolean

### 3.2 Gatekeeper Logic (`MainLayout.tsx`)
The `MainLayout` serves as the entry point decision maker. It **must not** render the dashboard immediately.
1. **On Mount**:
   - Call `refresh` API to attempt session restoration.
2. **If 401 (Unauthorized)**:
   - Redirect to `Login` page / Render Login component.
3. **If Success**:
   - Call `getProfile` API to fetch user details.
   - Store `accessToken` and `userProfile` in `authStore`.
   - **Role Check**:
     - If `Admin` -> Render `AdminLayout` (or navigate to `/admin`).
     - If `Client` -> Render `ClientLayout` (or navigate to `/client` or `/dashboard`).

## 4. Routing Structure

### 4.1 Layouts
- **`MainLayout.tsx`**: (Root) Handles initial auth check and direction.
- **`ClientLayout.tsx`**: Wraps client pages.
  - **Sidebar**: Dashboard, Profile, Webhooks, Webhook Events, Delivery Attempts, DLQ, Logout.
- **`AdminLayout.tsx`**: Wraps admin pages.
  - **Sidebar**: All Client pages + **Clients** + **Users**.

### 4.2 Route Definition
```tsx
/ (Root) -> MainLayout
  |
  +-- /login (Public)
  |
  +-- /dashboard (Protected, Role Based)
      |
      +-- / (Dashboard Overview)
      +-- /profile
      |
      +-- /webhooks
      |   +-- / (List)
      |   +-- /new (Create)
      |   +-- /:webhookId (View/Update)
      |
      +-- /events
      |   +-- / (List)
      |   +-- /:eventId (View)
      |
      +-- /deliveries
      |   +-- / (List)
      |   +-- /:deliveryId (View)
      |
      +-- /dlq
      |   +-- / (List)
      |
      +-- /clients (Admin Only)
      |   +-- / (List)
      |   +-- /new (Create)
      |   +-- /:clientId (View/Update)
      |
      +-- /users (Admin Only)
          +-- / (List)
          +-- /new (Create)
          +-- /:userId (View/Update)
```

## 5. View/Page Requirements

| Page | Role | Features |
| :--- | :--- | :--- |
| **Dashboard** | Both | Aggregate metrics. |
| **Profile** | Both | View/Update user details. |
| **Webhooks** | Both | List (Table), Create (Form), View/Edit (Form), Disable/Enable. |
| **Webhook Events** | Both | List (Table), View details. |
| **Delivery Attempts** | Both | List (Table), View details. |
| **DLQ** | Both | List messages (Table), Replay (Trigger) webhook. |
| **Clients** | **Admin** | List (Table), Create (Form), Edit (Form). |
| **Users** | **Admin** | List (Table), Create (Form), Edit (Form). |
| **Login** | Public | Email/Password flow (Google SSO later). |

## 6. API Integration
- **Code Generation**: Use `orval` to generate hooks from the OpenAPI spec.
- **Location**: `src/gen` or similar (configured in `orval.config.ts`).
