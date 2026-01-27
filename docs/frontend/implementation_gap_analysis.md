# Frontend Implementation Gap Analysis

> **Generated**: 2026-01-18
> **Status**: Critical Gaps Identified

This document outlines the discrepancies between the `architecture_spec.md` (derived from `flow.md`) and the current codebase state.

## 1. Missing Components (High Priority)

### Layouts
- [ ] **`src/layouts/ClientLayout.tsx`**: Missing. Required to wrap client-side dashboard pages.
- [ ] **`src/layouts/AdminLayout.tsx`**: Missing. Required to wrap admin-side pages.
- [ ] **Sidebar Component**: No reusable sidebar component found for the layouts.

### Pages & Sub-pages
The following pages are defined in the flow but do not exist in `src/pages`. They should be organized in subdirectories:

#### Webhooks (`src/pages/webhooks/`)
- [ ] `WebhookList.tsx`: Table view of webhooks.
- [ ] `WebhookCreate.tsx`: Form to create a new webhook.
- [ ] `WebhookDetail.tsx`: View/Edit form for a specific webhook.

#### Clients (`src/pages/clients/` - Admin Only)
- [ ] `ClientList.tsx`: Table view of clients.
- [ ] `ClientCreate.tsx`: Form to create a new client.
- [ ] `ClientDetail.tsx`: View/Edit form for a specific client.

#### Users (`src/pages/users/` - Admin Only)
- [ ] `UserList.tsx`: Table view of users.
- [ ] `UserCreate.tsx`: Form to create a new user.
- [ ] `UserDetail.tsx`: View/Edit form for a specific user.

#### Other Sections
- [ ] `Dashboard.tsx`
- [ ] `Profile.tsx`
- [ ] `WebhookEvents.tsx` (List + Detail)
- [ ] `DeliveryAttempts.tsx` (List + Detail)
- [ ] `DLQ.tsx` (List + Replay Action)
- [ ] `Login.tsx` (Currently referencing `Home.tsx` generic content)

## 2. Missing Logic

### Authentication & Authorization
- [ ] **`authStore`**: No Zustand store found (e.g., `src/stores/authStore.ts`).
- [ ] **`MainLayout` Logic**: Currently just renders `Outlet` with a navbar.
  - **Missing**: `useEffect` to call `refresh`.
  - **Missing**: Conditional rendering/redirection based on auth state.
  - **Missing**: Role-based routing logic (Admin vs Client).

### Routing
- [ ] **`src/router/router.tsx`**: Currently only maps `/` to `Home`.
  - **Missing**: Nested routes for `/webhooks`, `/clients`, `/users` handling the List/Create/Detail mapping.
  - **Missing**: Protected route wrappers.

## 3. Configuration & Tooling
- 🟢 **Orval**: Configured.
- 🟢 **State**: `zustand` installed.
- 🟢 **Forms**: `react-hook-form`, `zod`, `@hookform/resolvers` installed.
- 🟢 **UI**: `@tanstack/react-table`, `sonner` installed.

## 4. Recommendations for Next Steps

1.  **Initialize Store**: Create `src/stores/authStore.ts` with Zustand.
2.  **Scaffold Layouts**: Create `ClientLayout` and `AdminLayout`.
3.  **Update Router**: Define the route hierarchy in `router.tsx` with placeholders.
4.  **Implement CRUD Features**:
    - Build reusable **Table** component (using `@tanstack/react-table`).
    - Build reusable **Form** components (using `react-hook-form` + `zod`).
    - Implement `Webhooks`, `Clients`, and `Users` CRUD pages using these components.

