# SqueakPeek - CS_546_Group_22

## Overview
SqueakPeek is designed to improve dining safety in New York City by mapping restaurants in areas with documented rodent activity. It combines official reports with real-time, user-submitted sightings to create an interactive heat map that highlights potential sanitation risks. Users can contribute by reporting rodent encounters and sharing updates on nearby restaurant conditions, allowing the data to stay continuously updated. The goal is to help diners make more informed, data-driven decisions about where to eat while discouraging visiting potentially unsanitary establishments. In addition to supporting consumers, the platform also provides useful real-time information for health inspectors and pest control professionals, ultimately promoting greater transparency and encouraging higher standards of cleanliness for food establishments.

## Requirements
* Node.js
* MongoDB installed
* npm (Node Package Manager)
* A running MongoDB instance

## Libraries and Frameworks
SqueakPeek is built in Node.js with Express.js as the backend and Handlebars as the server-side rendering engine.
Several libraries were used to build out the unique features of SqueakPeek
   -Leaflet used to render interactive maps and minimaps for displaying rodent report and restaurant locations throughout the city.
   -node-geocoder handles geocoding functionality, including converting geographic coordinates to map zipcodes for location management.
   -Lucide Icons orovides a modern and lightweight icon library used throughout the user interface to improve visual clarity and user experience.

## How To Run SqueakPeek:
1. Clone the repository
```bash
git clone https://github.com/olivialongmuir/CS_546_Group_22.git
cd CS_546_Group_22
```
2. Install the dependencies
```bash
npm install
```
3. Seed the database
```bash
npm run seed
```
4. Run SqueakPeek
```bash
npm run start
```

## Home Page:

Landing page for SqueakPeek. Contains a title and small paragraph describing the website in its purpose and features. There are 3 buttons on this page: "Explore Heatmap", "Browse Restaurants", and "Browse Reports", each routing to their respective pages.

Below the descriptor paragraph are a few analytics. These are queired from the database once on loading the page and then passively updated by an AJAX call in the background. The refresh rate is currently set to once per minute. Analytics include: "Total restaurants", "Total Reports", "Total Users", and "Verified Sightings". These elements are not directly interactable and are for display only.

## Rat Map:

The Rat Map is a core feature that visualizes restaurant data from the database alongside user-submitted rodent reports in the form of a heat map. Users can customize the map’s appearance based on their preferences, including toggling between light and dark modes and selecting different heat map color schemes to improve accessibility.

Registered users can contribute by creating rodent reports through a right-click action on the map and selecting “Create Rodent Report.” Additionally, administrators and restaurant owners can access a “Register Restaurant” option from the same context menu to add new establishments to the system.

On the right side of the map, a hotspot feed provides real-time insights into reporting activity, highlighting areas with higher concentrations of rodent reports across New York City’s boroughs and neighborhoods.

From the Rat Map, users can click on existing restaurant and report pins to display a popup containing a preview of the related details. From the popup, users can quickly navigate directly to the associated Rodent Report or Restaurant page for that item.

## Rodent Reports:

The Rodent Reports system allows users to browse and interact with user-submitted rodent sighting reports across the city. Reports can be filtered through a client-side filtering system located in the left-side panel, providing a fast and responsive user experience without requiring page reloads.

Each report panel routes users to a dedicated report page containing additional details, comments, and community engagement features for logged-in users. Reports also include a Leaflet-based minimap with a custom rat pin marker displaying the exact sighting location.

## Restaurants:

The Restaurants system allows users to browse registered restaurants using client-side search and filtering tools. Users can select restaurants from the results panel to navigate to dedicated restaurant pages containing additional details, comments, reactions, and engagement features.

Each restaurant includes a dynamically updated Rodent Score metric representing rodent activity levels within the surrounding area.

Restaurant and Rodent Report data can be managed through the administrative portal, allowing administrators to maintain and moderate website content.

## Login/Signup:

SqueakPeek supports four account types: Consumer, Health Inspector, Restaurant Owner, and Exterminator. Each type has a different level of access throughout the platform, with admins sitting above all of them — admins have direct access to the database and are the ones responsible for approving new accounts that aren't auto-activated. Consumer accounts are activated immediately upon registration, while inspector, restaurant owner, and exterminator accounts are submitted to administrators for review and approval before they can sign in. This ensures that the functionalities of the site are limited to only the users that should have those permissions.

The login page is what starts a new user session, and that session is what unlocks most of the interactive parts of the site. Anyone can browse the map and read existing reports without an account, but creating new rodent reports, posting comments, and reacting to comments or reports all require being logged in. Once a valid username and password are submitted, the user is redirected to their profile page, where they can view their account information and activity. Logging out terminates the session and returns the user to the home page.

To create a new account, users must navigate to the sign-up page. Every field is required and has to be filled out before clicking "Sign Up," and both username and email must be unique. If either of those fields is already in use by another account, the form will reject the submission. The password itself doesn't need to be unique, since it gets hashed before being stored. Next to each field is a small info icon that, when hovered, explains exactly what the field expects, so that the user does not have to speculate on the requirements.

The registration form is submitted asynchronously through an AJAX request, so any errors come back inline without a full page reload, while the login form uses a standard POST submission. Both forms enforce three-stage validation requirement, where the same checks are run on the client, in the route handler, and inside the data layer before anything is written to the database.

On the back end, registration and login live in routes/auth.js, and the actual user records are created through the data layer in data/users.js. Passwords are run through bcrypt before they ever touch the database, so we never store anything in plaintext. When someone logs in, their password is checked against the stored hash, and accounts still waiting on admin approval get a clear message explaining they can't sign in yet.

## Security/Auth:

Authentication state in SqueakPeek is managed with express-session. When a user logs in, their user ID and account type are stored on the session, and the session cookie is configured as httpOnly with sameSite: lax and an eight-hour expiration to reduce exposure to common session-related attacks. Passwords are always hashed with bcrypt at rest, and login comparisons are done against the hash rather than any plaintext value.

Access control is in middleware.js, which runs before route handlers and decides what each request is allowed to do based on the session. The admin section is restricted to users whose account type is "admin", and certain actions on restaurants and rodent reports (PATCH and DELETE) are also admin-only. Posting new rodent reports requires a logged-in user, and registering a new restaurant through, like through the map, is limited to restaurant owners and administrators. Comment actions like posting, liking, disliking, and deleting all require an active session as well. Unauthenticated users hitting protected routes are redirected to the login page, while authenticated users without the correct privileges are shown a Forbidden error page.

The front end is set up to reflect these same rules, so users only see options they can actually use. For example, the "Register Restaurant" button in the map's right-click popup is hidden unless the user is signed in as a restaurant owner or admin, and clicking the map while logged out shows a sign-up prompt instead of the report form. The middleware still has the final say, even if someone tried to skip the UI and hit the route directly, the server would block it.

## Directory Structure

```
.
├── app.js
├── helpers.js
├── middleware.js
├── seed.js
├── README.md
├── config/
│   ├── mongoCollections.js
│   ├── mongoConnection.js
│   └── settings.js
├── data/
│   ├── restaurants.js
│   ├── rodentReports.js
│   └── users.js
├── database/
│   ├── restaurants.json
│   ├── restaurants_sample.json
│   ├── rodents.json
│   └── rodents_sample.json
├── public/
│   ├── css/
│   │   ├── profile.css
│   │   ├── restaurants.css
│   │   └── styles.css
│   ├── js/
│   │   ├── heatmap.js
│   │   ├── profile.js
│   │   └── rodentReports.js
│   └── images/
├── routes/
│   ├── auth.js
│   ├── index.js
│   ├── pageRoutes.js
│   ├── restaurants.js
│   ├── rodentReports.js
│   └── users.js
└── views/
    ├── layouts/
    │   └── main.handlebars
    ├── error.handlebars
    ├── heatmap.handlebars
    ├── home.handlebars
    ├── login.handlebars
    ├── profile.handlebars
    ├── ratreports.handlebars
    ├── register.handlebars
    ├── restaurant.handlebars
    └── restaurants.handlebars
```
