
MainLayout.tsx
it determines if the user should navigate to dashboard or login. it does it by calling refresh api.
if it returns 401, login, else
call another api to get the user data, understand if they are admin / client and navigate to the respective layout.

dashboard:
ClientLayout.tsx
AdminLayout.tsx

Clients will have the following pages
1. Dashboard
2. Profile
3. Webhooks
4. Webhook Events
5. Delivery attempts
6. DLQ
8. Logout

Admin will all of those pages
1. Dashboard
2. Profile
3. Webhooks
4. Webhook Events
5. Delivery attempts
6. DLQ
8. Logout
9. Users

ClientLayout and AdminLayout will have a sidebar with the above pages.
Sidebar is placed on the left with the menu items stacked vertically.
Mobile version will have a hamburger menu on the top right. and a hidden drawer with the menu items stacked vertically.
Right side is the content space where the selected menu content will be displayed.

Dashboard will hold aggregates ( not included right now)
Profile will show the user details and allow to update the user details.
Webhooks will show the list of webhooks and allow to create, update, disable and view the webhooks.
Webhook Events will show the list of webhook events and allow to view the webhook events.
Delivery attempts will show the list of delivery attempts and allow to view the delivery attempts.
DLQ will show the list of DLQ messages and allow to view the DLQ messages. users will be able to trigger the webhook for the DLQ messages.
Logout will log out the user and navigate to the login page.


Login mode:
for now, its only email and password. Google signin will be added later.

Flow control:
React router controls the navigation, but the main layout component will determine if the user should navigate to dashboard or login. it does it by calling refresh api.
followed by a get self profile api to display all the contents, understand if they are admin / client and navigate to the respective layout.

these details are stored in the separate zustand store, authstore, this will hold a session variable, inside which it will have the accessToken, userProfile data. this is used wherever necessary, the zustand store is ephermeral and lives in the memory. 

you will need to generate the client code for the apis using the openapi schema. you should be using orval and its config in the frontend folder to generate the config.